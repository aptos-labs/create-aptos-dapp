use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::{pg::Pg, query_builder::QueryFragment};
use tracing::error;

use crate::{
    db_models::events_models::Message,
    schema::messages,
    utils::{
        database_execution::execute_in_chunks,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

fn create_message_events_sql(
    items_to_insert: Vec<Message>,
) -> Vec<impl QueryFragment<Pg> + diesel::query_builder::QueryId + Send> {
    let query = diesel::insert_into(messages::table)
        .values(items_to_insert)
        .on_conflict(messages::message_obj_addr)
        .do_nothing();
    vec![query]
}

pub async fn process_create_message_events(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    create_events: Vec<Message>,
) -> Result<(), ProcessorError> {
    let create_result = execute_in_chunks(
        pool.clone(),
        create_message_events_sql,
        &create_events,
        get_config_table_chunk_size::<Message>("messages", &per_table_chunk_sizes),
    )
    .await;

    match create_result {
        Ok(_) => Ok(()),
        Err(e) => {
            error!("Failed to store create message events: {:?}", e);
            Err(ProcessorError::ProcessError {
                message: e.to_string(),
            })
        }
    }
}
