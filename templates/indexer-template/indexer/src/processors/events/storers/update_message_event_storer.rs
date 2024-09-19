use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::{
    pg::Pg, query_builder::QueryFragment, query_dsl::methods::FilterDsl, upsert::excluded,
    BoolExpressionMethods, ExpressionMethods,
};
use tracing::error;

use crate::{
    db_models::events_models::Message,
    schema::messages,
    utils::{
        database_execution::execute_in_chunks,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

fn update_message_events_sql(
    items_to_insert: Vec<Message>,
) -> Vec<impl QueryFragment<Pg> + diesel::query_builder::QueryId + Send> {
    let query = diesel::insert_into(messages::table)
        .values(items_to_insert)
        .on_conflict(messages::message_obj_addr)
        .do_update()
        .set((
            messages::message_obj_addr.eq(excluded(messages::message_obj_addr)),
            messages::creator_addr.eq(excluded(messages::creator_addr)),
            messages::creation_timestamp.eq(excluded(messages::creation_timestamp)),
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

    vec![query]
}

pub async fn process_update_message_events(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    update_events: Vec<Message>,
) -> Result<(), ProcessorError> {
    // filter update_events so when there are 2 events updating the same record, only the latest one is sent to DB for update
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

    let update_result = execute_in_chunks(
        pool.clone(),
        update_message_events_sql,
        &filtered_update_events,
        get_config_table_chunk_size::<Message>("messages", &per_table_chunk_sizes),
    )
    .await;

    match update_result {
        Ok(_) => Ok(()),
        Err(e) => {
            error!("Failed to store update message events: {:?}", e);
            Err(ProcessorError::ProcessError {
                message: e.to_string(),
            })
        }
    }
}
