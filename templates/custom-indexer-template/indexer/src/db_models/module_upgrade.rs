use diesel::{AsChangeset, Insertable};
use field_count::FieldCount;
use serde::{Deserialize, Serialize};

use crate::schema::module_upgrade_history;

#[derive(AsChangeset, Clone, Debug, Deserialize, FieldCount, Insertable, Serialize)]
#[diesel(table_name = module_upgrade_history)]
/// Database representation of a module upgrade change
pub struct ModuleUpgrade {
    pub module_addr: String,
    pub module_name: String,
    pub upgrade_number: i64,
    pub module_bytecode: Vec<u8>,
    pub module_source_code: String,
    pub module_abi: serde_json::Value,
    pub tx_version: i64,
}
