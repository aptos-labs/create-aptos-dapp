## Telegram Mini App Clicker Game Template

This template provides a ready to use clicker game dapp that can be run as a Telegram Mini App. It uese the Aptos Wallet Adapter to give you out of the box support. Under the hood, it’s powered by [Mizu Wallet](https://mizu.io/).

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
