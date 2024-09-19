## Telegram Mini App Clicker Game Template

This template provides a ready to use clicker game dapp that can be run as a Telegram mini app. You can use this template to build your own Telegram mini app dapp on the Aptos network.

We provide 2 signing experience for the Telegram Mini App, you can choose when you create the dapp using the create-aptos-dapp cli:

- explicit signing - the user needs to sign each transaction, this is powered by Aptos Wallet Adapter similar to other dapps
  - [demo](https://t.me/aptos_explict_siging_bot/)
- seamless signing - the user doesn't need to sign each transaction because the approval is done in the background, this is powered by [Mizu Wallet SDK Core](https://docs.mizu.io/docs/api-connect/core)
  - [demo](https://t.me/seamless345_bot/)

## Read the template docs

To get started with the template and learn more about the functionality and usage, head over to the [template docs](https://aptos.dev/en/build/create-aptos-dapp/templates/clicker-game-tg-mini-app-template)

## The template provides:

- **Folder structure** - A pre-made dapp folder structure with a `frontend` and `contract` folders.
- **Dapp infrastructure** - All required dependencies a dapp needs to start building on the Aptos network.
- **Clicker game functionality implementation** - Pre-made `counter` components to read and increment the counter.
- **Telegram Mini App integration** - The app can be run as a Telegram mini app.

### What tools the template uses?

- React framework
- Vite development tool
- shadcn/ui + tailwind for styling
- Aptos TS SDK
- Aptos Wallet Adapter
- Node based Move commands
- Telegram mini app SDK
- [Mizu Wallet SDK Core](https://docs.mizu.io/docs/api-connect/core) if you choose seamless signing experience

### What Move commands are available?

The tool utilizes [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) that lets us run Aptos CLI in a Node environment.

Some commands are built-in the template and can be ran as a npm script, for example:

- `npm run move:test` - a command to run Move unit tests
- `npm run move:compile` - a command to compile the Move contract
- `npm run move:publish` - a command to publish the Move contract
- `npm run dev` - a command to run the frontend locally
- `npm run deploy` - a command to deploy the dapp to Vercel

For all other available CLI commands, can run `npx aptos` and see a list of all available commands.
