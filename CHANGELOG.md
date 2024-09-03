# create-aptos-dapp Changelog

All notable changes to the create-aptos-dapp tool will be captured in this file. This changelog is written by hand for now. It adheres to the format set out by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

# Unreleased

- Add 2 telegram mini app templates, one using wallet adapter and the other using mizu sdk core directly to achieve seamless signing experience
- Support Nextjs framework for Boilerplate template

# 0.0.24 (2024-09-04)

- Code cleanup, always use env var from constants
- Rename `collection_id` to `collection_address` in the NFT minting template
- Move `collection_address` and `fa_address` from `config.ts` to the `.env` file in the minting templates
- Rename template `move` folder to `contract`
- Update next steps instructions when generating a template to follow README file
- Make sure each template README file mentions the template doc on aptos.dev
- Add new view function to minting template that returns user mint balance and display that on UI
- Add a minting enabled / disabled flag to nft minting template and token minting template
- Add 2 telegram mini app templates, one using wallet adapter and the other using mizu sdk core directly to achieve seamless signing experience

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
