# Stake Pool Template

## Overview

- The stake pool template lets contract deployer choose an arbitrary fungible asset as the staked asset, and an arbitrary fungible asset as the reward asset.
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
