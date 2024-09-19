use crate::schema::messages;
use aptos_indexer_processor_sdk::{
    aptos_protos::transaction::v1::Event as EventPB, utils::convert::standardize_address,
};
use diesel::{AsChangeset, Insertable};
use field_count::FieldCount;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a message
pub struct MessageOnChain {
    pub creator: String,
    pub content: String,
    pub creation_timestamp: String,
    pub last_update_timestamp: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a message creation event
pub struct CreateMessageEventOnChain {
    pub message_obj_addr: String,
    pub message: MessageOnChain,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a message update event
pub struct UpdateMessageEventOnChain {
    pub message_obj_addr: String,
    pub message: MessageOnChain,
}

#[derive(AsChangeset, Clone, Debug, Deserialize, FieldCount, Insertable, Serialize)]
#[diesel(table_name = messages)]
/// Database representation of a message
pub struct Message {
    pub message_obj_addr: String,
    pub creator_addr: String,
    pub creation_timestamp: i64,
    pub last_update_timestamp: i64,
    pub last_update_event_idx: i64,
    pub content: String,
}

#[derive(Debug, Clone)]
pub enum ContractEvent {
    CreateMessageEvent(Message),
    UpdateMessageEvent(Message),
}

impl ContractEvent {
    pub fn from_event(contract_address: &str, event_idx: usize, event: &EventPB) -> Option<Self> {
        let t: &str = event.type_str.as_ref();
        let should_include = t.starts_with(contract_address);

        if should_include {
            if t.starts_with(
                format!("{}::message_board::CreateMessageEvent", contract_address).as_str(),
            ) {
                println!("CreateMessageEvent {}", event.data.as_str());
                let create_message_event_on_chain: CreateMessageEventOnChain =
                    serde_json::from_str(event.data.as_str()).expect(
                        format!(
                            "Failed to parse CreateMessageEvent, {}",
                            event.data.as_str()
                        )
                        .as_str(),
                    );
                let creation_timestamp = create_message_event_on_chain
                    .message
                    .creation_timestamp
                    .parse()
                    .unwrap();
                let message = Message {
                    message_obj_addr: standardize_address(
                        &create_message_event_on_chain.message_obj_addr,
                    ),
                    creator_addr: standardize_address(
                        create_message_event_on_chain.message.creator.as_str(),
                    ),
                    creation_timestamp,
                    content: create_message_event_on_chain.message.content,
                    last_update_timestamp: creation_timestamp,
                    last_update_event_idx: 0,
                };
                Some(ContractEvent::CreateMessageEvent(message))
            } else if t.starts_with(
                format!("{}::message_board::UpdateMessageEvent", contract_address).as_str(),
            ) {
                println!("UpdateMessageEvent {}", event.data.as_str());
                let update_message_event_on_chain: UpdateMessageEventOnChain =
                    serde_json::from_str(event.data.as_str()).expect(
                        format!(
                            "Failed to parse UpdateMessageEvent, {}",
                            event.data.as_str()
                        )
                        .as_str(),
                    );
                let message = Message {
                    message_obj_addr: standardize_address(
                        &update_message_event_on_chain.message_obj_addr,
                    ),
                    content: update_message_event_on_chain.message.content,
                    creator_addr: standardize_address(
                        update_message_event_on_chain.message.creator.as_str(),
                    ),
                    creation_timestamp: update_message_event_on_chain
                        .message
                        .creation_timestamp
                        .parse()
                        .unwrap(),
                    last_update_timestamp: update_message_event_on_chain
                        .message
                        .last_update_timestamp
                        .parse()
                        .unwrap(),
                    last_update_event_idx: event_idx as i64,
                };
                Some(ContractEvent::UpdateMessageEvent(message))
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
