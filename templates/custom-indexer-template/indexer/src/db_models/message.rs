use aptos_indexer_processor_sdk::utils::convert::standardize_address;
use diesel::{AsChangeset, Insertable};
use field_count::FieldCount;
use serde::{Deserialize, Serialize};

use crate::schema::messages;

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

impl CreateMessageEventOnChain {
    pub fn to_db_message(&self) -> Message {
        let creation_timestamp = self.message.creation_timestamp.parse().unwrap();
        Message {
            message_obj_addr: standardize_address(&self.message_obj_addr),
            creator_addr: standardize_address(self.message.creator.as_str()),
            creation_timestamp,
            content: self.message.content.clone(),
            last_update_timestamp: creation_timestamp,
            last_update_event_idx: 0,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a message update event
pub struct UpdateMessageEventOnChain {
    pub message_obj_addr: String,
    pub message: MessageOnChain,
}

impl UpdateMessageEventOnChain {
    pub fn to_db_message(&self, last_update_event_idx: i64) -> Message {
        Message {
            message_obj_addr: standardize_address(&self.message_obj_addr),
            content: self.message.content.clone(),
            creator_addr: standardize_address(self.message.creator.as_str()),
            creation_timestamp: self.message.creation_timestamp.parse().unwrap(),
            last_update_timestamp: self.message.last_update_timestamp.parse().unwrap(),
            last_update_event_idx,
        }
    }
}
