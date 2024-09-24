use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::ConnectionResult;
use diesel_async::{
    pooled_connection::{bb8::Pool, AsyncDieselConnectionManager, ManagerConfig},
    AsyncPgConnection,
};
use futures_util::{future::BoxFuture, FutureExt};
use std::sync::Arc;

use super::database_utils::{ArcDbPool, DbPoolConnection};

fn establish_connection(database_url: &str) -> BoxFuture<ConnectionResult<AsyncPgConnection>> {
    use native_tls::{Certificate, TlsConnector};
    use postgres_native_tls::MakeTlsConnector;

    (async move {
        let (url, cert_path) = parse_and_clean_db_url(database_url);
        let connector = match cert_path {
            Some(cert_path) => {
                let cert = std::fs::read(cert_path).expect("Could not read certificate");

                let cert = Certificate::from_pem(&cert).expect("Could not parse certificate");
                let connector = TlsConnector::builder()
                    .danger_accept_invalid_certs(true)
                    .add_root_certificate(cert)
                    .build()
                    .expect("Could not build TLS connector");
                MakeTlsConnector::new(connector)
            }
            None => {
                let connector = TlsConnector::builder()
                    .build()
                    .expect("Could not build default TLS connector");
                MakeTlsConnector::new(connector)
            }
        };
        let (client, connection) = tokio_postgres::connect(&url, connector)
            .await
            .expect("Could not connect to database");
        tokio::spawn(async move {
            if let Err(e) = connection.await {
                eprintln!("connection error: {}", e);
            }
        });
        AsyncPgConnection::try_from(client).await
    })
    .boxed()
}

fn parse_and_clean_db_url(url: &str) -> (String, Option<String>) {
    let mut db_url = url::Url::parse(url).expect("Could not parse database url");
    let mut cert_path = None;

    let mut query = "".to_string();
    db_url.query_pairs().for_each(|(k, v)| {
        if k == "sslrootcert" {
            cert_path = Some(v.parse().unwrap());
        } else {
            query.push_str(&format!("{}={}&", k, v));
        }
    });
    db_url.set_query(Some(&query));

    (db_url.to_string(), cert_path)
}

pub async fn new_db_pool(database_url: &str, max_pool_size: u32) -> ArcDbPool {
    let mut config = ManagerConfig::<AsyncPgConnection>::default();
    config.custom_setup = Box::new(|conn| Box::pin(establish_connection(conn)));
    let manager =
        AsyncDieselConnectionManager::<AsyncPgConnection>::new_with_config(database_url, config);

    let pool = Pool::builder()
        .max_size(max_pool_size)
        .build(manager)
        .await
        .expect("Failed to create db pool");

    Arc::new(pool)
}

pub async fn get_db_connection(pool: &ArcDbPool) -> Result<DbPoolConnection, ProcessorError> {
    pool.get().await.map_err(|e| {
        tracing::error!("Error getting connection from DB pool: {:?}", e);
        ProcessorError::DBStoreError {
            message: format!("Failed to get connection from pool: {}", e),
        }
    })
}
