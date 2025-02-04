use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::{
    aptos_protos::transaction::v1::{
        transaction::TxnData, write_set_change::Change, Event as EventPB, MoveModuleBytecode,
        Transaction, WriteSetChange,
    },
    traits::{async_step::AsyncRunType, AsyncStep, NamedStep, Processable},
    types::transaction_context::TransactionContext,
    utils::{convert::standardize_address, errors::ProcessorError},
};
use async_trait::async_trait;
use rayon::prelude::*;

use crate::db_models::{
    message::{CreateMessageEventOnChain, Message, UpdateMessageEventOnChain},
    module_upgrade::ModuleUpgrade,
    package_upgrade::{PackageUpgrade, PackageUpgradeChangeOnChain},
};

/// Extractor is a step that extracts events and their metadata from transactions.
pub struct Extractor
where
    Self: Sized + Send + 'static,
{
    contract_address: String,
}

impl Extractor {
    pub fn new(contract_address: String) -> Self {
        Self { contract_address }
    }
}

impl AsyncStep for Extractor {}

impl NamedStep for Extractor {
    fn name(&self) -> String {
        "Extractor".to_string()
    }
}

#[async_trait]
impl Processable for Extractor {
    type Input = Vec<Transaction>;
    type Output = TransactionContextData;
    type RunType = AsyncRunType;

    async fn process(
        &mut self,
        item: TransactionContext<Vec<Transaction>>,
    ) -> Result<Option<TransactionContext<TransactionContextData>>, ProcessorError> {
        let results: Vec<(Vec<ContractEvent>, Vec<ContractUpgradeChange>)> = item
            .data
            .par_iter()
            .map(|txn| {
                let txn_version = txn.version as i64;
                let txn_info = match txn.info.as_ref() {
                    Some(info) => {
                        if info.success {
                            info
                        } else {
                            return (vec![], vec![]);
                        }
                    }
                    None => {
                        tracing::warn!(
                            transaction_version = txn_version,
                            "Transaction info doesn't exist"
                        );
                        return (vec![], vec![]);
                    }
                };
                let txn_data = match txn.txn_data.as_ref() {
                    Some(data) => data,
                    None => {
                        tracing::warn!(
                            transaction_version = txn_version,
                            "Transaction data doesn't exist"
                        );
                        return (vec![], vec![]);
                    }
                };
                let raw_events = match txn_data {
                    TxnData::BlockMetadata(tx_inner) => &tx_inner.events,
                    TxnData::Genesis(tx_inner) => &tx_inner.events,
                    TxnData::User(tx_inner) => &tx_inner.events,
                    _ => &vec![],
                };

                let txn_events =
                    ContractEvent::from_events(self.contract_address.as_str(), raw_events);

                let txn_changes = ContractUpgradeChange::from_changes(
                    self.contract_address.as_str(),
                    txn_version,
                    txn_info.changes.as_slice(),
                );

                (txn_events, txn_changes)
            })
            .collect::<Vec<(Vec<ContractEvent>, Vec<ContractUpgradeChange>)>>();

        let (events, changes): (Vec<ContractEvent>, Vec<ContractUpgradeChange>) =
            results.into_iter().fold(
                (Vec::new(), Vec::new()),
                |(mut events_acc, mut changes_acc), (events, changes)| {
                    events_acc.extend(events);
                    changes_acc.extend(changes);
                    (events_acc, changes_acc)
                },
            );

        Ok(Some(TransactionContext {
            data: TransactionContextData { events, changes },
            metadata: item.metadata,
        }))
    }
}

#[derive(Debug, Clone)]
pub struct TransactionContextData {
    pub events: Vec<ContractEvent>,
    pub changes: Vec<ContractUpgradeChange>,
}

#[derive(Debug, Clone)]
pub enum ContractEvent {
    CreateMessageEvent(Message),
    UpdateMessageEvent(Message),
}

impl ContractEvent {
    fn from_event(contract_address: &str, event_idx: usize, event: &EventPB) -> Option<Self> {
        // use standardize_address to pad the address in event type before processing
        let parts = event.type_str.split("::").collect::<Vec<_>>();
        let t = standardize_address(parts[0]) + "::" + parts[1] + "::" + parts[2];
        let should_include = t.starts_with(contract_address);

        if should_include {
            if t.starts_with(
                format!(
                    "{}::custom_indexer_ex_message_board::CreateMessageEvent",
                    contract_address
                )
                .as_str(),
            ) {
                println!("CreateMessageEvent {}", event.data.as_str());
                let create_message_event_on_chain: CreateMessageEventOnChain =
                    serde_json::from_str(event.data.as_str()).unwrap_or_else(|_| {
                        panic!(
                            "Failed to parse CreateMessageEvent, {}",
                            event.data.as_str()
                        )
                    });
                Some(ContractEvent::CreateMessageEvent(
                    create_message_event_on_chain.to_db_message(),
                ))
            } else if t.starts_with(
                format!(
                    "{}::custom_indexer_ex_message_board::UpdateMessageEvent",
                    contract_address
                )
                .as_str(),
            ) {
                println!("UpdateMessageEvent {}", event.data.as_str());
                let update_message_event_on_chain: UpdateMessageEventOnChain =
                    serde_json::from_str(event.data.as_str()).unwrap_or_else(|_| {
                        panic!(
                            "Failed to parse UpdateMessageEvent, {}",
                            event.data.as_str()
                        )
                    });
                Some(ContractEvent::UpdateMessageEvent(
                    update_message_event_on_chain.to_db_message(event_idx as i64),
                ))
            } else {
                None
            }
        } else {
            None
        }
    }

    pub fn from_events(contract_address: &str, events: &[EventPB]) -> Vec<Self> {
        events
            .iter()
            .enumerate()
            .filter_map(|(idx, event)| Self::from_event(contract_address, idx, event))
            .collect()
    }
}

#[derive(Debug, Clone)]
pub enum ContractUpgradeChange {
    ModuleUpgradeChange(ModuleUpgrade),
    PackageUpgradeChange(PackageUpgrade),
}

impl ContractUpgradeChange {
    pub fn from_changes(
        contract_address: &str,
        txn_version: i64,
        changes: &[WriteSetChange],
    ) -> Vec<Self> {
        let mut raw_module_changes: AHashMap<(String, String), MoveModuleBytecode> =
            AHashMap::new();
        let mut raw_package_changes: Vec<PackageUpgradeChangeOnChain> = vec![];

        changes
            .iter()
            .for_each(|change| match change.change.as_ref() {
                Some(change) => match change {
                    Change::WriteModule(write_module_change) => {
                        if standardize_address(write_module_change.address.as_str())
                            == contract_address
                        {
                            raw_module_changes.insert(
                                (
                                    standardize_address(write_module_change.address.as_str()),
                                    write_module_change
                                        .data
                                        .clone()
                                        .unwrap_or_else(|| {
                                            panic!("MoveModuleBytecode data is missing",)
                                        })
                                        .abi
                                        .clone()
                                        .unwrap_or_else(|| {
                                            panic!("MoveModuleBytecode abi is missing",)
                                        })
                                        .name,
                                ),
                                write_module_change.data.clone().unwrap(),
                            );
                        }
                    }
                    Change::WriteResource(write_resource_change) => {
                        if standardize_address(write_resource_change.address.as_str())
                            == contract_address
                            && write_resource_change.type_str == "0x1::code::PackageRegistry"
                        {
                            let package_upgrade: PackageUpgradeChangeOnChain =
                                serde_json::from_str(write_resource_change.data.as_str())
                                    .unwrap_or_else(|_| {
                                        panic!(
                                            "Failed to parse PackageUpgradeChangeOnChain, {}",
                                            write_resource_change.data.as_str()
                                        )
                                    });
                            raw_package_changes.push(package_upgrade);
                        }
                    }
                    _ => {}
                },
                None => {}
            });

        let package_changes = raw_package_changes
            .iter()
            .flat_map(|package_change| {
                package_change.to_db_package_upgrade(txn_version, contract_address.to_string())
            })
            .collect::<Vec<PackageUpgrade>>();

        let module_changes = raw_package_changes
            .iter()
            .flat_map(|package_change| package_change.packages.clone())
            .map(|package| {
                package
                    .modules
                    .iter()
                    .map(|module| {
                        let raw_module = raw_module_changes
                            .get(&(contract_address.to_string(), module.name.clone()))
                            .unwrap_or_else(|| {
                                panic!("Module bytecode not found for module {}", module.name)
                            });
                        ModuleUpgrade {
                            module_addr: contract_address.to_string(),
                            module_name: module.name.clone(),
                            upgrade_number: package.upgrade_number.parse().unwrap(),
                            module_bytecode: raw_module.bytecode.clone(),
                            module_source_code: module.source.clone(),
                            module_abi: serde_json::json!(raw_module.abi.clone().unwrap_or_else(
                                || { panic!("Module abi is missing for module {}", module.name) }
                            )),
                            tx_version: txn_version,
                        }
                    })
                    .collect::<Vec<ModuleUpgrade>>()
            })
            .flatten()
            .collect::<Vec<ModuleUpgrade>>();

        module_changes
            .into_iter()
            .map(ContractUpgradeChange::ModuleUpgradeChange)
            .chain(
                package_changes
                    .into_iter()
                    .map(ContractUpgradeChange::PackageUpgradeChange),
            )
            .collect()
    }
}
