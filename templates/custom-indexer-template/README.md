## Create Aptos Dapp Custom Indexer Template

The custom indexer template provides a starter dapp with all components to run a full-stack app with indexer support.

## Read the Custom Indexer template docs

To get started with the Custom Indexer template and learn more about the template functionality and usage, head over to the [Custom Indexer template docs](https://learn.aptoslabs.com/en/dapp-templates/custom-indexer-template)

## The Custom Indexer template provides:

- **Folder structure** - A pre-made dapp folder structure with `src` for frontend, `contract` for Move contract and `indexer` for custom indexer.
- **Dapp infrastructure** - All required dependencies a dapp needs to start building on the Aptos network.
- **Wallet Info implementation** - Pre-made `WalletInfo` components to demonstrate how one can use to read a connected Wallet info.
- **Message board functionality implementation** - Pre-made `MessageBoard` component to create, update and read messages from the Move smart contract.
- **Analytics dashboard** - Pre-made `Analytics` component to show the number of messages created and updated.
- **Point program** - Minimal example to show you how to define a point program based on events (e.g. create message, update message) and show that on the analytics dashboard, with sorting support.

## What tools the template uses?

- React framework
- shadcn/ui + tailwind for styling
- Aptos TS SDK
- Aptos Wallet Adapter
- Node based Move commands
- Rust based Aptos Indexer SDK

## What Move commands are available?

The tool utilizes [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) that lets us run Aptos CLI in a Node environment.

Some commands are built-in the template and can be ran as a npm script, for example:

- `npm run move:publish` - a command to publish the Move contract
- `npm run move:test` - a command to run Move unit tests
- `npm run move:compile` - a command to compile the Move contract
- `npm run move:upgrade` - a command to upgrade the Move contract
- `npm run dev` - a command to run the frontend locally
- `npm run deploy` - a command to deploy the dapp to Vercel

For all other available CLI commands, can run `npx aptos` and see a list of all available commands.

## Running the Custom Indexer template

Please refer to the [Custom Indexer template docs](https://learn.aptoslabs.com/en/dapp-templates/custom-indexer-template) for more information on how to run the Custom Indexer template.
