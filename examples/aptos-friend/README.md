## Aptos Friend Example

This example is created from the boilerplate template in create-aptos-dapp.

The Boilerplate template provides a starter dapp with all necessary dapp infrastructure and a simple wallet info implementation.

The Boilerplate template provides:

- **Folder structure** - A pre-made dapp folder structure with a `frontend` and `move` folders.
- **Dapp infrastructure** - All required dependencies a dapp needs to start building on the Aptos network.
- **Wallet Info implementation** - Pre-made `WalletInfo` components to demonstrate how one can use to read a connected Wallet info.

### What tools the template uses?

- React framework
- Vite development tool
- shadcn/ui + tailwind for styling
- Aptos TS SDK
- Aptos Wallet Adapter
- Node based Move commands

### What Move commands are available?

The tool utilizes [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) that lets us run Aptos CLI in a Node environment.

Some commands are built-in the template and can be ran as a npm script, for example:

- `npm run move:init` - a command to initialize an account to publish the Move contract and to configure the development environment
- `npm run move:publish` - a command to publish the Move contract
- `npm run move:test` - a command to run Move unit tests
- `npm run move:compile` - a command to compile the Move contract

For all other available CLI commands, can run `npx aptos` and see a list of all available commands.

### Aptos Friend Overview

Anyone can issue its own share, buy and sell shares issued by anyone.

Issuer data is stored in Object where seed is contract address + issuer address.

Holding data is stored in Object where seed is contract address + issuer address + holder address.

Additionally, to make the contract easier to query without an indexer, we created registry for all issuers, all holders for each issuer and all holdings for each user.
In production, we would use off-chain indexer to store the registry so it's more performant.
