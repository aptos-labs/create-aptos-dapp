use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::{insert_into, QueryResult};
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};

use crate::{
    db_models::package_upgrade::PackageUpgrade,
    schema::package_upgrade_history,
    utils::{
        database_connection::get_db_connection,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

async fn execute_upgrade_package_changes_sql(
    conn: &mut AsyncPgConnection,
    items_to_insert: Vec<PackageUpgrade>,
) -> QueryResult<()> {
    conn.transaction(|conn| {
        Box::pin(async move {
            let create_package_upgrade_query = insert_into(package_upgrade_history::table)
                .values(items_to_insert.clone())
                .on_conflict((
                    package_upgrade_history::package_addr,
                    package_upgrade_history::package_name,
                    package_upgrade_history::upgrade_number,
                ))
                .do_nothing();
            create_package_upgrade_query.execute(conn).await?;
            Ok(())
        })
    })
    .await
}

pub async fn process_upgrade_package_changes(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    upgrade_changes: Vec<PackageUpgrade>,
) -> Result<(), ProcessorError> {
    let chunk_size = get_config_table_chunk_size::<PackageUpgrade>(
        "package_upgrade_history",
        &per_table_chunk_sizes,
    );
    let tasks = upgrade_changes
        .chunks(chunk_size)
        .map(|chunk| {
            let pool = pool.clone();
            let items = chunk.to_vec();
            tokio::spawn(async move {
                let conn = &mut get_db_connection(&pool).await.expect(
                    "Failed to get connection from pool while processing upgrade package changes",
                );
                execute_upgrade_package_changes_sql(conn, items).await
            })
        })
        .collect::<Vec<_>>();

    let results = futures_util::future::try_join_all(tasks)
        .await
        .expect("Task panicked executing in chunks");
    for res in results {
        res.map_err(|e| {
            tracing::warn!("Error running query: {:?}", e);
            ProcessorError::ProcessError {
                message: e.to_string(),
            }
        })?;
    }
    Ok(())
}
