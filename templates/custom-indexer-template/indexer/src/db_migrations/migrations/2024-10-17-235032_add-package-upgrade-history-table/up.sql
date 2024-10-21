-- Your SQL goes here
CREATE TABLE
    package_upgrade_history (
        package_addr VARCHAR(300) NOT NULL,
        package_name VARCHAR(300) NOT NULL,
        upgrade_number BIGINT NOT NULL,
        upgrade_policy BIGINT NOT NULL,
        package_manifest TEXT NOT NULL,
        source_digest TEXT NOT NULL,
        tx_version BIGINT NOT NULL,
        PRIMARY KEY (package_addr, package_name, upgrade_number)
    );