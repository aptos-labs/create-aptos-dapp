# Message board contract

This is a simple message board contract that allows users to post messages on-chain and read messages from the chain. For both `create` and `update` endpoints, contract emits Create event and Update event respectively, then indexer will parse these events and store the message in the database for frontend to query efficiently.

- `scripts` directory contains Move scripts that can batch multiple contract calls in 1 transaction.
- `tests` directory contains Move unit tests.
- `sources` directory contains the main contract code.
- `sh_scripts` directory contains shell scripts that can be used to test, publish, upgrade the contract, run Move scripts and generate TypeScript ABI. You can run them in this order:
  - `./sh_scripts/init.sh`: create a new wallet
  - `./sh_scripts/test.sh`: test the contract
  - `./sh_scripts/deploy.sh`: deploy the contract
  - `./sh_scripts/upgrade.sh`: upgrade the contract, you can only run this when you make compatible changes, changing existing structs and function signatures are considered incompatible changes. For incompatible changes, you need to deploy a new contract and migrate the data to new contract manually.
  - `./sh_scripts/get_abis.sh`: generate TypeScript ABI in the frontend directory and node scripts directory.
  - `./sh_scripts/run_create_2_messages_script.sh`: run Move script to create 2 messages in 1 transaction.
  - `./sh_scripts/run_update_message_script.sh`: run Move script to update a messages in 1 transaction.
