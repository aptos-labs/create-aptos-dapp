//! This contains the health server, a basic server that for now always returns 200.
//! This is necessary to run the processor in Cloud Run, which expects to be able to
//! query a HTTP server to check for liveness.

use anyhow::{Context, Result};
use poem::{
    get, handler, http::Method, listener::TcpListener, middleware::Cors, EndpointExt, Route, Server,
};
use serde::{Deserialize, Serialize};
use std::net::{Ipv4Addr, SocketAddrV4};
use tracing::info;

/// This configures the health server.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(default)]
pub struct HealthServerConfig {
    pub listen_address: SocketAddrV4,
}

impl Default for HealthServerConfig {
    fn default() -> Self {
        Self {
            listen_address: SocketAddrV4::new(Ipv4Addr::new(0, 0, 0, 0), 8080),
        }
    }
}

pub async fn run(config: HealthServerConfig) -> Result<()> {
    info!("Health server starting at {}", config.listen_address);
    let cors = Cors::new().allow_methods(vec![Method::GET, Method::POST]);
    let route = Route::new().nest("/", get(root)).with(cors);
    Server::new(TcpListener::bind(config.listen_address))
        .name("health-server")
        .run(route)
        .await
        .context("Health server stopped running unexpectedly")
}

#[handler]
async fn root() -> String {
    "Hello from the root!!".to_string()
}
