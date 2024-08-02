# Create Aptos Dapp Token Staking Template

## Overview

- The token staking dapp template lets contract deployer choose an arbitrary fungible asset as the staked asset and the reward asset.
- The reward creator set in config can create reward schedules with a reward per second (RPS) rate and a duration in seconds.
  - Note: in current implementation, only 1 reward schedule is allowed. If you want to create multiple reward schedules, you need to deploy multiple stake pools.
- Users can stake their assets in the pool and claim rewards based on the reward schedule.

## Reward calculation

- We first calculate reward index, reward index is amount of reward per staked asset.
  ```
  reward index = old_index + (current_ts - last_update_ts) * rps / total_stake
  ```
- Then we calculate reward for a user
  ```
  reward = user_stake * (reward_index - user_index_at_last_claim)
  ```

## Limitation

For simplicity of the template, we didn't implement the function for the reward provider to claim back any orphaned reward after the duration has passed. There are are multiple ways to implement this, the simplest way is to transfer all the reward left from reward store after the duration has passed, but this makes anyone who still has pending claim reward have no reward to claim.

## The Token Staking Template provides:

- **Stake Fungible Asset Page** - A page for anyone to stake a token
- **Claim Staking Rewards** - A component for any staker to claim the staking rewards
- **Unstake Fungible Asset** - A component for any staker to unstake
- **Create an incentivize pool of a Fungible Asset** - A component for a defined creator to create an incentivize (rewards) pool of a fungible asset

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
