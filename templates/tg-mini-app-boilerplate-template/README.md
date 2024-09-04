## Overview

This template is made from the [boilerplate template](https://github.com/aptos-labs/create-aptos-dapp/tree/main/templates/boilerplate-template), the difference is that we make this possible to run as a Telegram mini app.

You can access a live demo of the mini app by starting a chat with the example bot https://t.me/aptos_explict_siging_bot/.

To deploy your own mini app, you need to create a bot, deploy the dapp by following the [deployment guide](https://aptos.dev/en/build/create-aptos-dapp/templates/boilerplate#deploy-to-a-live-server), link the web app to the bot. You can follow a complete guide on the [mini app doc](https://docs.telegram-mini-apps.com/platform/creating-new-app).

To debug and test the mini app, follow the guide on [mini app doc](https://docs.telegram-mini-apps.com/platform/debugging).

## Create Aptos Dapp Boilerplate Template

The Boilerplate template provides a starter dapp with all necessary dapp infrastructure and a simple wallet info implementation.

## The Boilerplate template provides:

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
- Surf for Move contract type checking in TypeScript
- Telegram min app SDK

### What Move commands are available?

The tool utilizes [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) that lets us run Aptos CLI in a Node environment.

Some commands are built-in the template and can be ran as a npm script, for example:

- `npm run move:init` - a command to initialize an account to publish the Move contract and to configure the development environment
- `npm run move:test` - a command to run Move unit tests
- `npm run move:compile` - a command to compile the Move contract
- `npm run move:publish` - a command to publish the Move contract
- `npm run move:get-abi`: a command to get the Move contract ABI to be used by the frontend
- `npm run deploy` - a command to deploy the dapp to Vercel

For all other available CLI commands, can run `npx aptos` and see a list of all available commands.
