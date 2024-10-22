-- Your SQL goes here
CREATE TABLE
    module_upgrade_history (
        module_addr VARCHAR(300) NOT NULL,
        module_name VARCHAR(300) NOT NULL,
        upgrade_number BIGINT NOT NULL,
        module_bytecode BYTEA NOT NULL,
        module_source_code TEXT NOT NULL,
        module_abi JSON NOT NULL,
        tx_version BIGINT NOT NULL,
        PRIMARY KEY (module_addr, module_name, upgrade_number)
    );