use anyhow::{Context, Result};
use tracing::info;

use super::database_utils::ArcDbPool;
use crate::{
    db_models::ledger_info::LedgerInfo, schema::ledger_infos,
    utils::database_execution::execute_with_better_error_conn,
};

/// Verify the chain id from GRPC against the database.
pub async fn check_or_update_chain_id(grpc_chain_id: i64, db_pool: ArcDbPool) -> Result<u64> {
    info!("Checking if chain id is correct");

    let mut conn = db_pool
        .get()
        .await
        .expect("Failed to get connection from pool while checking or updating chain id");

    let maybe_existing_chain_id = LedgerInfo::get(&mut conn)
        .await
        .expect("Failed to get chain id from db while checking or updating chain id")
        .map(|li| li.chain_id);

    match maybe_existing_chain_id {
        Some(chain_id) => {
            anyhow::ensure!(chain_id == grpc_chain_id, "Wrong chain detected! Trying to index chain {} now but existing data is for chain {}", grpc_chain_id, chain_id);
            info!(
                chain_id = chain_id,
                "Chain id matches! Continue to index...",
            );
            Ok(chain_id as u64)
        }
        None => {
            info!(
                chain_id = grpc_chain_id,
                "Adding chain id to db, continue to index..."
            );
            let query = diesel::insert_into(ledger_infos::table)
                .values(LedgerInfo {
                    chain_id: grpc_chain_id,
                })
                .on_conflict_do_nothing();
            execute_with_better_error_conn(&mut conn, vec![query])
                .await
                .context("Error updating chain_id!")
                .map(|_| grpc_chain_id as u64)
        }
    }
}
