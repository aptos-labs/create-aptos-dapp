# create-aptos-dapp Changelog

All notable changes to the create-aptos-dapp tool will be captured in this file. This changelog is written by hand for now. It adheres to the format set out by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

# Unreleased

# 0.1.2 (2025-08-14)

- Fix surf in vite boilerplate template by adding polyfills for Node.js core modules

# 0.1.1 (2025-05-13)

- Remove `VitePWA` plugin from Boilerplate templates
- Update move dependencies to use framework instead of aptos-core

# 0.1.0 (2025-05-06)

- Remove telegram mini app template and mizu wallet given telegram mini app only supports Ton chain now
- Bump `@aptos-labs/ts-sdk` version to `2.0.0`
- Override `@noble/curves` to use `1.6.0` as later versions break build
- Bump `@aptos-labs/wallet-adapter-react` version to `6.0.1` in all templates
- Bump `@thalalabs/surf` version to `1.9.6`

# 0.0.44 (2025-02-24)

- Include all wallets in the wallet selector on each template by default

# 0.0.43 (2025-02-24)

- Bump Aptos dependencies

# 0.0.42 (2025-02-24)

- Fix mint stage calculate in nft minting dapp template

# 0.0.41 (2025-02-04)

- Only index successful transaction in the indexer template

# 0.0.40 (2024-12-18)

- Show a message to fund a module publisher account on Testnet through the faucet web view

# 0.0.39 (2024-11-18)

- Add support to define a client API Key
- Remove `uniqueHolders` from token minting dapp live example due to inefficient indexer query

# 0.0.37 (2024-11-04)

- [Fix] Generate Boilerplate template without Surf errors out because of a wrong file path
- Support PWA in the boilerplate template

# 0.0.36 (2024-10-28)

- Remove `uniqueHolders` from NFT minting dapp template due to inefficient indexer query
- Upgrade to the new Irys SDK
- Fix indexer template not working due to address padding and wrong module name

# 0.0.35 (2024-10-23)

- Use Aptos Learn for create-aptos-dapp docs

# 0.0.34 (2024-10-22)

- Upgrade `@aptos-labs/ts-sdk` dependency to `^1.30.0`
- `npx aptos` command is not updated automatically on every run
- Add example to parse write set change to custom indexer template

# 0.0.33 (2024-10-10)

- Fix creating contract only template

# 0.0.32 (2024-10-08)

- Update indexer template's indexer sdk dependency
- Install Aptos CLI after dependencies are installed
- Add description to network options
- Add Surf option to boilerplate template

# 0.0.31 (2024-09-30)

- Add new custom indexer template
- Fix NFT and Token minting dapps navigation UI issues
- Install the Aptos CLI as part of the wizard setup
- Handle module publisher account creation failure by prompting the user to fill out the .env file manually
- Add a `TopBanner` component to all templates to show the user the template docs

# 0.0.30 (2024-09-26)

- Cleanup NPM release

# 0.0.29 (2024-09-26)

- Fixed npm release

# 0.0.28 (2024-09-26)

- Fixed npm release

# 0.0.27 (2024-09-26)

- Add new contract-only template.
- Remove seamless signing option from telegram mini app templates.

# 0.0.26 (2024-09-19)

- Add a `WrongNetworkAlert` component to all examples to show when the user is on the wrong network
- Support popular wallets in the wallet selector by default
- Rename contract directory from `move` to `contract` in aptos-friend example
- Upgrade aptos `@aptos-labs/ts-sdk` dependency to `^1.28.0`

# 0.0.25 (2024-09-11)

- Support Nextjs framework for Boilerplate template
- Add new telegram mini app templates, we have 2 options, one using `Aptos Wallet Adapter` for explicit signing like other dapps, and the other using `Mizu Wallet SDK Core` for seamless signing experience.
- Update NFT template Move scripts to dynamically use the correct token minter module address
- Add a `WrongNetworkAlert` component to all templates to show when the user is on the wrong network
- Add 2 new examples, `aptogotchi-keyless` and `aptogotchi-random-mint`

# 0.0.24 (2024-09-04)

- Code cleanup, always use env var from constants
- Rename `collection_id` to `collection_address` in the NFT minting template
- Move `collection_address` and `fa_address` from `config.ts` to the `.env` file in the minting templates
- Rename template `move` folder to `contract`
- Update next steps instructions when generating a template to follow README file
- Make sure each template README file mentions the template doc on aptos.dev
- Add new view function to minting template that returns user mint balance and display that on UI
- Add a minting enabled / disabled flag to nft minting template and token minting template

# 0.0.23 (2024-08-21)

- Add Token Staking template walkthrough video
- Change Token minting template walkthrough video
- Support a `--verbose` flag to run wizard with std out

# 0.0.22 (2024-08-19)

- Fix latest release with updated files

# 0.0.21 (2024-08-16)

- Add a minimal contract to the boilerplate template

# 0.0.20 (2024-08-16)

- Upgrade dapp dependencies
- Handle Move scripts issues by throwing meaningful errors

# 0.0.19 (2024-08-16)

- A release to fix broken previous release

# 0.0.18 (2024-08-15)

- Add a production ready Staking template
- Add a npm deploy command `npm run deploy`
- Improve instruction on the CLI UI

# 0.0.17 (2024-08-02)

- Support an `--example` command to generate a specific example
- Add `aptos-friend` example
- Change `asset_id` to `fa_address` on the token minting dapp template

# 0.0.16 (2024-07-19)

- Fix next step numbering and typos

# 0.0.15 (2024-07-18)

- Add functionality that wasn't included in the previous release due to issue in a build (no changes)

# 0.0.14 (2024-07-18)

- Add a telemetry tool integration
- Rename `Digital Asset Template` to `NFT minting dapp template`
- Rename `Fungible Asset Template` to `Token minting dapp template`
- Update template doc URLs
- Fix type in Boilerplate template

# 0.0.13 (2024-07-15)

- Add `dotenv` dev dependency to the `Boilerplate` template
- Add entry and view function examples to the `Boilerplate` template

# 0.0.12 (2024-07-10)

- Add a `Boilerplate Template` option
- Support `Devnet` as a network option for the boilerplate template
- [`Fix`] `AptosConnect` to show on any public page
- Move the template doc link prompt to show up before the `npm run dev` command on the `next steps` section
- Add the `AptosConnect` educational screen on the wallet selector component on each template

# 0.0.11 (2024-06-24)

- Add a `Digital Asset Template` option
- Add a `Fungible Asset Template` option
- Remove boilerplate, node and web templates

# 0.0.2 (2024-01-30)

- Add a confirmation step in the wizard flow
- Migrate to `create-aptos-dapp`
