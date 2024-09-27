# Only Contract Template

This template provides a starting point for a dapp with all necessary infrastructure and implements a simple on-chain message board functionality.

## Read the Boilerplate Template Documentation
To get started with the Boilerplate template and learn more about its features and usage, visit [Boilerplate Template Documentation](https://aptos.dev/en/build/create-aptos-dapp/templates/boilerplate)

## The Contract Template Provides:

- **File Structure** - A pre-made dapp file structure, including the `contract` folder.
- **Dapp Infrastructure** - All dependencies needed to build on the Aptos network.
- **Message Board Functionality** - A pre-made `message` component for sending and reading messages on-chain.

## What Tools Does the Template Use?

- Aptos TS SDK
- Node-based Move commands

## Available Move Commands

This tool leverages the [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli), allowing us to run Aptos CLI in a Node environment.

Some commands are pre-built into the template and can be run as npm scripts, such as:

- `npm run move:publish` - Command to publish Move contracts
- `npm run move:test` - Command to run Move unit tests
- `npm run move:compile` - Command to compile Move contracts
- `npm run move:upgrade` - Command to upgrade Move contracts

To see all available CLI commands, you can run `npx aptos` and view the list of all available commands.