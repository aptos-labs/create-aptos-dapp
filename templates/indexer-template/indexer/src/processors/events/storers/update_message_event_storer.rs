use std::cmp;

use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::{
    insert_into, query_dsl::methods::FilterDsl, upsert::excluded, BoolExpressionMethods,
    ExpressionMethods, QueryResult,
};
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};

use crate::{
    db_models::{message::Message, user_stat::UserStat},
    schema::{messages, user_stats},
    utils::{
        database_connection::get_db_connection,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

const POINT_PER_UPDATE_MESSAGE: i64 = 1;

async fn execute_update_message_events_sql(
    conn: &mut AsyncPgConnection,
    items_to_insert: Vec<Message>,
    user_stats_changes: AHashMap<String, (i64, i64)>,
) -> QueryResult<()> {
    conn.transaction(|conn| {
        Box::pin(async move {
            let update_message_query = insert_into(messages::table)
                .values(items_to_insert.clone())
                .on_conflict(messages::message_obj_addr)
                .do_update()
                .set((
                    messages::message_obj_addr.eq(messages::message_obj_addr),
                    messages::creator_addr.eq(messages::creator_addr),
                    messages::creation_timestamp.eq(messages::creation_timestamp),
                    messages::last_update_timestamp.eq(excluded(messages::last_update_timestamp)),
                    messages::last_update_event_idx.eq(excluded(messages::last_update_event_idx)),
                    messages::content.eq(excluded(messages::content)),
                ))
                .filter(
                    // Update only if the last update timestamp is greater than the existing one
                    // or if the last update timestamp is the same but the event index is greater
                    messages::last_update_timestamp
                        .lt(excluded(messages::last_update_timestamp))
                        .or(messages::last_update_timestamp
                            .eq(excluded(messages::last_update_timestamp))
                            .and(
                                messages::last_update_event_idx
                                    .lt(excluded(messages::last_update_event_idx)),
                            )),
                );
            update_message_query.execute(conn).await?;

            /*
            DO NOT backfill data (i.e. process same event twice), you would mess up the user stat!!!!
            Instead, if you want to change the point calculation logic, you should delete all data and re-index from scratch.
            You can delete all data by revert all DB migrations, see README.md for more details.
             */
            let update_user_stat_query = insert_into(user_stats::table)
                .values(
                    user_stats_changes
                        .iter()
                        .map(
                            |(user_addr, (update_message_count, latest_message_update_time))| {
                                UserStat {
                                    user_addr: user_addr.clone(),
                                    // This value doesn't matter because we always use the original DB value for creation_timestamp
                                    creation_timestamp: 0,
                                    last_update_timestamp: *latest_message_update_time,
                                    // This value doesn't matter because we always use the original DB value for created_messages
                                    created_messages: 0,
                                    updated_messages: *update_message_count,
                                    s1_points: update_message_count * POINT_PER_UPDATE_MESSAGE,
                                    total_points: update_message_count * POINT_PER_UPDATE_MESSAGE,
                                }
                            },
                        )
                        .collect::<Vec<_>>(),
                )
                .on_conflict(user_stats::user_addr)
                .do_update()
                .set((
                    user_stats::user_addr.eq(user_stats::user_addr),
                    user_stats::creation_timestamp.eq(user_stats::creation_timestamp),
                    user_stats::last_update_timestamp
                        .eq(excluded(user_stats::last_update_timestamp)),
                    user_stats::created_messages.eq(user_stats::created_messages),
                    user_stats::updated_messages
                        .eq(user_stats::updated_messages + excluded(user_stats::updated_messages)),
                    user_stats::s1_points
                        .eq(user_stats::s1_points + excluded(user_stats::s1_points)),
                    user_stats::total_points
                        .eq(user_stats::total_points + excluded(user_stats::total_points)),
                ));
            update_user_stat_query.execute(conn).await?;

            Ok(())
        })
    })
    .await
}

pub async fn process_update_message_events(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    update_events: Vec<Message>,
) -> Result<(), ProcessorError> {
    // Key is user address
    // Value is (number of new messages, latest update message time)
    let mut user_stats_changes: AHashMap<String, (i64, i64)> = AHashMap::new();
    for message in update_events.clone() {
        let (update_count, latest_time) = user_stats_changes
            .get(&message.creator_addr)
            .cloned()
            .unwrap_or((0, 0));
        user_stats_changes.insert(
            message.creator_addr.clone(),
            (
                update_count + 1,
                cmp::max(latest_time, message.last_update_timestamp),
            ),
        );
    }

    // Filter update_events so when there are 2 events updating the same record, only the latest one is sent to DB for update
    // because we cannot update one record with 2 different values in the same transaction
    let mut filtered_update_events_map: AHashMap<String, Message> = AHashMap::new();
    for message in update_events {
        filtered_update_events_map
            .entry(message.message_obj_addr.clone())
            .and_modify(|existing| {
                if (message.last_update_timestamp, message.last_update_event_idx)
                    > (
                        existing.last_update_timestamp,
                        existing.last_update_event_idx,
                    )
                {
                    *existing = message.clone();
                }
            })
            .or_insert(message);
    }
    let filtered_update_events: Vec<Message> = filtered_update_events_map.into_values().collect();

    let chunk_size = get_config_table_chunk_size::<Message>("messages", &per_table_chunk_sizes);
    let tasks = filtered_update_events
        .chunks(chunk_size)
        .map(|chunk| {
            let pool = pool.clone();
            let items = chunk.to_vec();
            let user_stats_changes = user_stats_changes.clone();
            tokio::spawn(async move {
                let conn = &mut get_db_connection(&pool).await.expect(
                    "Failed to get connection from pool while processing update message events",
                );
                execute_update_message_events_sql(conn, items, user_stats_changes).await
            })
        })
        .collect::<Vec<_>>();

    let results = futures_util::future::try_join_all(tasks)
        .await
        .expect("Task panicked executing in chunks");
    for res in results {
        res.map_err(|e| {
            tracing::error!("Error running query: {:?}", e);
            ProcessorError::ProcessError {
                message: e.to_string(),
            }
        })?;
    }
    Ok(())
}
