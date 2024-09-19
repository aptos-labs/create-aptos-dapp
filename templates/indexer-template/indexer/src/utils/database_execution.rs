use diesel::{query_builder::QueryFragment, QueryResult};
use diesel_async::{AsyncConnection, RunQueryDsl};
use tracing::{debug, warn};

use super::database_utils::{clean_data_for_db, ArcDbPool, Backend, MyDbConnection};

pub async fn execute_in_chunks<U, T>(
    pool: ArcDbPool,
    build_queries: fn(Vec<T>) -> Vec<U>,
    items_to_insert: &[T],
    chunk_size: usize,
) -> Result<(), diesel::result::Error>
where
    U: QueryFragment<Backend> + diesel::query_builder::QueryId + Send + 'static,
    T: serde::Serialize + for<'de> serde::Deserialize<'de> + Clone + Send + 'static,
{
    let tasks = items_to_insert
        .chunks(chunk_size)
        .map(|chunk| {
            let pool = pool.clone();
            let items = chunk.to_vec();
            tokio::spawn(async move {
                let queries = build_queries(items.clone());
                execute_or_retry_cleaned(pool, build_queries, items, queries).await
            })
        })
        .collect::<Vec<_>>();

    let results = futures_util::future::try_join_all(tasks)
        .await
        .expect("Task panicked executing in chunks");
    for res in results {
        res?
    }

    Ok(())
}

pub async fn execute_or_retry_cleaned<U, T>(
    pool: ArcDbPool,
    build_queries: fn(Vec<T>) -> Vec<U>,
    items: Vec<T>,
    queries: Vec<U>,
) -> Result<(), diesel::result::Error>
where
    U: QueryFragment<Backend> + diesel::query_builder::QueryId + Send,
    T: serde::Serialize + for<'de> serde::Deserialize<'de> + Clone,
{
    match execute_with_better_error(pool.clone(), queries).await {
        Ok(_) => {}
        Err(_) => {
            let cleaned_items = clean_data_for_db(items, true);
            let cleaned_queries = build_queries(cleaned_items);
            match execute_with_better_error(pool.clone(), cleaned_queries).await {
                Ok(_) => {}
                Err(e) => {
                    return Err(e);
                }
            }
        }
    }
    Ok(())
}

pub async fn execute_with_better_error<U>(pool: ArcDbPool, queries: Vec<U>) -> QueryResult<()>
where
    U: QueryFragment<Backend> + diesel::query_builder::QueryId + Send,
{
    let conn = &mut pool.get().await.map_err(|e| {
        warn!("Error getting connection from pool: {:?}", e);
        diesel::result::Error::DatabaseError(
            diesel::result::DatabaseErrorKind::UnableToSendCommand,
            Box::new(e.to_string()),
        )
    })?;

    execute_with_better_error_conn(conn, queries).await
}

pub async fn execute_with_better_error_conn<U>(
    conn: &mut MyDbConnection,
    queries: Vec<U>,
) -> QueryResult<()>
where
    U: QueryFragment<Backend> + diesel::query_builder::QueryId + Send,
{
    let debug_query = queries
        .iter()
        .map(|q| diesel::debug_query::<Backend, _>(q).to_string())
        .collect::<Vec<_>>();
    debug!("Executing queries in one DB transaction atomically: {:?}", debug_query);
    let res = conn
        .transaction(|conn| {
            Box::pin(async move {
                for q in queries {
                    q.execute(conn).await?;
                }
                Ok(())
            })
        })
        .await;
    if let Err(ref e) = res {
        warn!("Error running query: {:?}\n{:?}", e, debug_query);
    }
    res
}
