use anyhow::Result;
use aptos_indexer_processor_sdk::{
    aptos_protos::transaction::v1::{transaction::TxnData, Event as EventPB, Transaction},
    traits::{async_step::AsyncRunType, AsyncStep, NamedStep, Processable},
    types::transaction_context::TransactionContext,
    utils::errors::ProcessorError,
};
use async_trait::async_trait;
use rayon::prelude::*;

use crate::db_models::message::{CreateMessageEventOnChain, Message, UpdateMessageEventOnChain};

/// EventsExtractor is a step that extracts events and their metadata from transactions.
pub struct EventsExtractor
where
    Self: Sized + Send + 'static,
{
    contract_address: String,
}

impl EventsExtractor {
    pub fn new(contract_address: String) -> Self {
        Self { contract_address }
    }
}

impl AsyncStep for EventsExtractor {}

impl NamedStep for EventsExtractor {
    fn name(&self) -> String {
        "EventsExtractor".to_string()
    }
}

#[async_trait]
impl Processable for EventsExtractor {
    type Input = Vec<Transaction>;
    type Output = Vec<ContractEvent>;
    type RunType = AsyncRunType;

    async fn process(
        &mut self,
        item: TransactionContext<Vec<Transaction>>,
    ) -> Result<Option<TransactionContext<Vec<ContractEvent>>>, ProcessorError> {
        let events = item
            .data
            .par_iter()
            .map(|txn| {
                let mut events = vec![];
                let txn_version = txn.version as i64;
                let txn_data = match txn.txn_data.as_ref() {
                    Some(data) => data,
                    None => {
                        tracing::warn!(
                            transaction_version = txn_version,
                            "Transaction data doesn't exist"
                        );
                        return vec![];
                    }
                };
                let default = vec![];
                let raw_events = match txn_data {
                    TxnData::BlockMetadata(tx_inner) => &tx_inner.events,
                    TxnData::Genesis(tx_inner) => &tx_inner.events,
                    TxnData::User(tx_inner) => &tx_inner.events,
                    _ => &default,
                };

                let txn_events =
                    ContractEvent::from_events(self.contract_address.as_str(), raw_events);
                events.extend(txn_events);
                events
            })
            .flatten()
            .collect::<Vec<ContractEvent>>();
        Ok(Some(TransactionContext {
            data: events,
            metadata: item.metadata,
        }))
    }
}

#[derive(Debug, Clone)]
pub enum ContractEvent {
    CreateMessageEvent(Message),
    UpdateMessageEvent(Message),
}

impl ContractEvent {
    fn from_event(contract_address: &str, event_idx: usize, event: &EventPB) -> Option<Self> {
        let t: &str = event.type_str.as_ref();
        let should_include = t.starts_with(contract_address);

        if should_include {
            if t.starts_with(
                format!("{}::message_board::CreateMessageEvent", contract_address).as_str(),
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
                format!("{}::message_board::UpdateMessageEvent", contract_address).as_str(),
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
