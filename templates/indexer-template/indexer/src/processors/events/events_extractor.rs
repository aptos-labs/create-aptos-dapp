use crate::db_models::events_models::ContractEvent;
use anyhow::Result;
use aptos_indexer_processor_sdk::{
    aptos_protos::transaction::v1::{transaction::TxnData, Transaction},
    traits::{async_step::AsyncRunType, AsyncStep, NamedStep, Processable},
    types::transaction_context::TransactionContext,
    utils::errors::ProcessorError,
};
use async_trait::async_trait;
use rayon::prelude::*;
use tracing::warn;

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

#[async_trait]
impl Processable for EventsExtractor {
    type Input = Transaction;
    type Output = ContractEvent;
    type RunType = AsyncRunType;

    async fn process(
        &mut self,
        item: TransactionContext<Transaction>,
    ) -> Result<Option<TransactionContext<ContractEvent>>, ProcessorError> {
        let events = item
            .data
            .par_iter()
            .map(|txn| {
                let mut events = vec![];
                let txn_version = txn.version as i64;
                let txn_data = match txn.txn_data.as_ref() {
                    Some(data) => data,
                    None => {
                        warn!(
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
            start_version: item.start_version,
            end_version: item.end_version,
            start_transaction_timestamp: item.start_transaction_timestamp,
            end_transaction_timestamp: item.end_transaction_timestamp,
            total_size_in_bytes: item.total_size_in_bytes,
        }))
    }
}

impl AsyncStep for EventsExtractor {}

impl NamedStep for EventsExtractor {
    fn name(&self) -> String {
        "EventsExtractor".to_string()
    }
}
