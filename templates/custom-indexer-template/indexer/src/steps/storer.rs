use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::{
    traits::{async_step::AsyncRunType, AsyncStep, NamedStep, Processable},
    types::transaction_context::TransactionContext,
    utils::errors::ProcessorError,
};
use async_trait::async_trait;

use super::{
    extractor::{ContractEvent, ContractUpgradeChange, TransactionContextData},
    storers::{
        create_message_event_storer::process_create_message_events,
        update_message_event_storer::process_update_message_events,
        upgrade_module_change_storer::process_upgrade_module_changes,
        upgrade_package_change_storer::process_upgrade_package_changes,
    },
};
use crate::utils::database_utils::ArcDbPool;

/// Storer is a step that inserts events in the database.
pub struct Storer
where
    Self: Sized + Send + 'static,
{
    pool: ArcDbPool,
}

impl AsyncStep for Storer {}

impl NamedStep for Storer {
    fn name(&self) -> String {
        "Storer".to_string()
    }
}

impl Storer {
    pub fn new(pool: ArcDbPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl Processable for Storer {
    type Input = TransactionContextData;
    type Output = TransactionContextData;
    type RunType = AsyncRunType;

    async fn process(
        &mut self,
        transaction_context_data: TransactionContext<TransactionContextData>,
    ) -> Result<Option<TransactionContext<TransactionContextData>>, ProcessorError> {
        let per_table_chunk_sizes: AHashMap<String, usize> = AHashMap::new();
        let data = transaction_context_data.data.clone();
        let (create_events, update_events) = data.events.into_iter().fold(
            (vec![], vec![]),
            |(mut create_events, mut update_events), event| {
                match event {
                    ContractEvent::CreateMessageEvent(message) => {
                        create_events.push(message);
                    }
                    ContractEvent::UpdateMessageEvent(message) => {
                        update_events.push(message);
                    }
                }
                (create_events, update_events)
            },
        );

        process_create_message_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            create_events,
        )
        .await?;

        process_update_message_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            update_events,
        )
        .await?;

        let (module_upgrades, package_upgrades) = data.changes.into_iter().fold(
            (vec![], vec![]),
            |(mut module_upgrades, mut package_upgrades), upgrade_change| {
                match upgrade_change {
                    ContractUpgradeChange::ModuleUpgradeChange(module_upgrade) => {
                        module_upgrades.push(module_upgrade);
                    }
                    ContractUpgradeChange::PackageUpgradeChange(package_upgrade) => {
                        package_upgrades.push(package_upgrade);
                    }
                }
                (module_upgrades, package_upgrades)
            },
        );

        process_upgrade_module_changes(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            module_upgrades,
        )
        .await?;

        process_upgrade_package_changes(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            package_upgrades,
        )
        .await?;

        Ok(Some(transaction_context_data))
    }
}
