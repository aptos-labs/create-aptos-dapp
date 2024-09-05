## Telegram Mini App Clicker Game Template

This template is made from the [boilerplate template](https://github.com/aptos-labs/create-aptos-dapp/tree/main/templates/boilerplate-template), the difference is that we make this possible to run as a Telegram mini app, and we change the app to be a simple clicker game.

The difference between this template and the [tg-mini-app-seamless-signing-boilerplate-template](https://aptos.dev/en/build/create-aptos-dapp/templates/tg-mini-app-seamless-signing-boilerplate) is we are using Aptos wallet adapter instead of Mizu wallet sdk core, this way the UX is similar to all other dapps using the Wallet Adapter, i.e. users need to approve the transaction explicitly. Also since Mizu is the only Aptos wallet supports Telegram now, we removed other wallet options.

You can access a live demo of the mini app by starting a chat with the example bots

- [explicit signing version](https://t.me/aptos_explict_siging_bot/)
- [seamless signing version](https://t.me/seamless345_bot/)

To deploy your own mini app, you need to create a bot, deploy the dapp by following the [deployment guide](https://aptos.dev/en/build/create-aptos-dapp/templates/boilerplate#deploy-to-a-live-server), link the web app to the bot. You can follow a complete guide on the [mini app doc](https://docs.telegram-mini-apps.com/platform/creating-new-app).

To debug and test the mini app, follow the guide on [mini app doc](https://docs.telegram-mini-apps.com/platform/debugging).

## The Boilerplate template provides:

- **Folder structure** - A pre-made dapp folder structure with a `frontend` and `move` folders.
- **Dapp infrastructure** - All required dependencies a dapp needs to start building on the Aptos network.

### What tools the template uses?

- React framework
- Vite development tool
- shadcn/ui + tailwind for styling
- Aptos TS SDK
- Aptos Wallet Adapter
- Node based Move commands
- Telegram mini app SDK
- Mizu Wallet SDK Core if you choose to use seamless signing

### What Move commands are available?

The tool utilizes [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) that lets us run Aptos CLI in a Node environment.

Some commands are built-in the template and can be ran as a npm script, for example:

- `npm run move:init` - a command to initialize an account to publish the Move contract and to configure the development environment
- `npm run move:test` - a command to run Move unit tests
- `npm run move:compile` - a command to compile the Move contract
- `npm run move:publish` - a command to publish the Move contract
- `npm run deploy` - a command to deploy the dapp to Vercel

For all other available CLI commands, can run `npx aptos` and see a list of all available commands.
