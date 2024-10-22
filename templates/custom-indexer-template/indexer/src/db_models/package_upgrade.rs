use diesel::{AsChangeset, Insertable};
use field_count::FieldCount;
use serde::{Deserialize, Serialize};

use crate::schema::package_upgrade_history;

#[derive(AsChangeset, Clone, Debug, Deserialize, FieldCount, Insertable, Serialize)]
#[diesel(table_name = package_upgrade_history)]
/// Database representation of a package upgrade change
pub struct PackageUpgrade {
    pub package_addr: String,
    pub package_name: String,
    pub upgrade_number: i64,
    pub upgrade_policy: i64,
    pub package_manifest: String,
    pub source_digest: String,
    pub tx_version: i64,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ModuleOnChain {
    pub name: String,
    // module source code, 0x if deployer chose to hide it
    pub source: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct UpgradePolicyOnChain {
    pub policy: i64,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct PackageOnChain {
    pub manifest: String,
    pub modules: Vec<ModuleOnChain>,
    pub name: String,
    pub source_digest: String,
    pub upgrade_number: String,
    pub upgrade_policy: UpgradePolicyOnChain,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a write module change
pub struct PackageUpgradeChangeOnChain {
    pub packages: Vec<PackageOnChain>,
}

impl PackageUpgradeChangeOnChain {
    pub fn to_db_package_upgrade(
        &self,
        tx_version: i64,
        package_addr: String,
    ) -> Vec<PackageUpgrade> {
        self.packages
            .iter()
            .map(|package| PackageUpgrade {
                package_addr: package_addr.clone(),
                package_name: package.name.clone(),
                upgrade_number: package.upgrade_number.parse().unwrap(),
                upgrade_policy: package.upgrade_policy.policy,
                package_manifest: package.manifest.clone(),
                source_digest: package.source_digest.clone(),
                tx_version,
            })
            .collect()
    }
}
