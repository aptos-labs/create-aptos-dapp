use diesel::{AsChangeset, Insertable, Queryable};
use field_count::FieldCount;
use serde::{Deserialize, Serialize};

use crate::schema::user_stats;

#[derive(AsChangeset, Clone, Debug, Deserialize, FieldCount, Insertable, Serialize, Queryable)]
#[diesel(table_name = user_stats)]
/// Database representation of a user's statistics
pub struct UserStat {
    pub user_addr: String,
    pub creation_timestamp: i64,
    pub last_update_timestamp: i64,
    pub created_messages: i64,
    pub updated_messages: i64,
    pub s1_points: i64,
    pub total_points: i64,
}
