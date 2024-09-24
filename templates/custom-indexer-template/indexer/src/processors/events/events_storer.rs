use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::{
    traits::{async_step::AsyncRunType, AsyncStep, NamedStep, Processable},
    types::transaction_context::TransactionContext,
    utils::errors::ProcessorError,
};
use async_trait::async_trait;

use super::{events_extractor::ContractEvent, storers::{
    create_message_event_storer::process_create_message_events,
    update_message_event_storer::process_update_message_events,
}};
use crate::utils::database_utils::ArcDbPool;

/// EventsStorer is a step that inserts events in the database.
pub struct EventsStorer
where
    Self: Sized + Send + 'static,
{
    pool: ArcDbPool,
}

impl AsyncStep for EventsStorer {}

impl NamedStep for EventsStorer {
    fn name(&self) -> String {
        "EventsStorer".to_string()
    }
}

impl EventsStorer {
    pub fn new(pool: ArcDbPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl Processable for EventsStorer {
    type Input = ContractEvent;
    type Output = ContractEvent;
    type RunType = AsyncRunType;

    async fn process(
        &mut self,
        events: TransactionContext<ContractEvent>,
    ) -> Result<Option<TransactionContext<ContractEvent>>, ProcessorError> {
        let per_table_chunk_sizes: AHashMap<String, usize> = AHashMap::new();
        let (create_events, update_events) = events.clone().data.into_iter().fold(
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

        Ok(Some(events))
    }
}
