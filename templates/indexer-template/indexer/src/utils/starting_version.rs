use anyhow::{Context, Result};

use super::database_utils::ArcDbPool;
use crate::{
    config::indexer_processor_config::IndexerProcessorConfig,
    db_models::processor_status::ProcessorStatusQuery,
};

pub async fn get_starting_version(
    indexer_processor_config: &IndexerProcessorConfig,
    conn_pool: ArcDbPool,
) -> Result<u64> {
    let starting_version_from_config = indexer_processor_config
        .transaction_stream_config
        .starting_version
        .unwrap_or(0);

    let latest_processed_version_from_db =
        get_latest_processed_version_from_db(indexer_processor_config, conn_pool)
            .await
            .context("Failed to get latest processed version from DB")?
            .unwrap_or(0);

    Ok(starting_version_from_config.max(latest_processed_version_from_db))
}

/// Gets the start version for the processor. If not found, start from 0.
pub async fn get_latest_processed_version_from_db(
    indexer_processor_config: &IndexerProcessorConfig,
    conn_pool: ArcDbPool,
) -> Result<Option<u64>> {
    let mut conn = conn_pool.get().await?;

    match ProcessorStatusQuery::get_by_processor(
        indexer_processor_config.processor_config.name(),
        &mut conn,
    )
    .await?
    {
        Some(status) => Ok(Some(status.last_success_version as u64 + 1)),
        None => Ok(None),
    }
}
