use anyhow::Result;
use aptos_indexer_processor_sdk_server_framework::ServerArgs;
use clap::Parser;
use indexer::{
    config::indexer_processor_config::IndexerProcessorConfig,
    health_check_server::{self, HealthServerConfig},
};

#[cfg(unix)]
#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;

async fn run_health_server() -> Result<()> {
    health_check_server::run(HealthServerConfig::default()).await
}

async fn run_indexer() -> Result<()> {
    ServerArgs::parse()
        .run::<IndexerProcessorConfig>(tokio::runtime::Handle::current())
        .await
}

fn main() -> Result<()> {
    let num_cpus = num_cpus::get();
    let worker_threads = (num_cpus).max(16);

    let mut builder = tokio::runtime::Builder::new_multi_thread();
    builder
        .disable_lifo_slot()
        .enable_all()
        .worker_threads(worker_threads)
        .build()
        .unwrap()
        .block_on(async {
            tokio::try_join!(run_health_server(), run_indexer())?;
            Ok(())
        })
}
