use diesel::{
    debug_query,
    pg::Pg,
    query_builder::{QueryFragment, QueryId},
    QueryResult,
};
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};

pub async fn execute_with_better_error<U>(
    conn: &mut AsyncPgConnection,
    queries: Vec<U>,
) -> QueryResult<()>
where
    U: QueryFragment<Pg> + QueryId + Send,
{
    let debug_query = queries
        .iter()
        .map(|q| debug_query::<Pg, _>(q).to_string())
        .collect::<Vec<_>>();
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
        tracing::error!("Error running query: {:?}\n{:?}", e, debug_query);
    }
    res
}
