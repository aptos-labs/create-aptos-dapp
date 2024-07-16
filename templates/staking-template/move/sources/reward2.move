/// An example module that manages rewards for multiple tokens on a per-epoch basis. Rewards can be added for multiple
/// tokens by anyone for any epoch but only friended modules can increase/decrease claimer shares.
///
/// This module is designed to be integrated into a complete system that manages epochs and rewards.
///
/// The flow works as below:
/// 1. A rewards pool is created with a set of reward tokens (fungible assets). If coins are to be used as rewards,
/// developers can use the coin_wrapper module from move-examples/swap to convert coins into fungible assets.
/// 2. Anyone can add rewards to the pool for any epoch for multiple tokens by calling add_rewards.
/// 3. Friended modules can increase/decrease claimer shares for current epoch by calling increase_allocation and
/// decrease_allocation.
/// 4. Claimers can claim their rewards in all tokens for any epoch that has ended by calling claim_rewards, which
/// return a vector of all the rewards. Claiming also removes the claimer's shares from that epoch's rewards as their
/// rewards have all been claimed.
///
/// Although claimers have to be signers, this module can be easily modified to support objects (e.g. NFTs) as claimers.
module staking_addr::reward2 {
    use std::option::{Self, Option};
    use std::signer;
    use std::vector;

    use aptos_framework::fungible_asset::{Self, FungibleAsset, FungibleStore, Metadata};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::object::{Self, Object, ExtendRef};

    use aptos_std::pool_u64_unbound::{Self as pool_u64, Pool};
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_std::smart_table::{Self, SmartTable};

    /// The rewards pool does not support the given reward token type.
    const EREWARD_TOKEN_NOT_SUPPORTED: u64 = 2;

    /// Data regarding the store object for a specific reward token.
    struct RewardStore has store {
        /// The fungible store for this reward token.
        store: Object<FungibleStore>,
        /// We need to keep the fungible store's extend ref to be able to transfer rewards from it during claiming.
        store_extend_ref: ExtendRef,
    }

    struct Reward has store {
        amount: u64,
        duration_seconds: u64,
        begin_time: u64,
    }

    struct RewardsPool has key {
        /// Total amount of rewards for each reward token added to this epoch.
        total_amounts: SimpleMap<Object<Metadata>, u64>,
        /// Pool representing the claimer shares in this epoch.
        claimer_pool: Pool,
        /// The stores where rewards are kept.
        reward_stores: SimpleMap<Object<Metadata>, RewardStore>,
    }

    /// Global per contract
    struct Config has key {
        // creator can add reward
        reward_creator_addr: address,
        // admin can set pending admin, accept admin, update mint fee collector, create FA and update creator
        admin_addr: address,
        pending_admin_addr: Option<address>,
    }

    /// If you deploy the module under an object, sender is the object's signer
    /// If you deploy the module under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        move_to(sender, Config {
            reward_creator_addr: @initial_reward_creator_addr,
            admin_addr: signer::address_of(sender),
            pending_admin_addr: option::none(),
        });

        move_to(sender, RewardsPool {
            total_amounts: simple_map::new(),
            claimer_pool: pool_u64::create(),
            reward_stores: simple_map::new(),
        });
    }

    // ================================= Entry Functions ================================= //

    /// Create a new rewards pool with the given reward tokens (fungible assets only)
    public entry fun create_entry(reward_tokens: vector<Object<Metadata>>) acquires RewardsPool {
        create(reward_tokens);
    }

    /// Create a new rewards pool with the given reward tokens (fungible assets only)
    public fun create(reward_tokens: vector<Object<Metadata>>) acquires RewardsPool {
        let reward_stores= borrow_global_mut<RewardsPool>(@staking_addr).reward_stores;
        // let reward_stores = simple_map::new();
        vector::for_each(reward_tokens, |reward_token| {
            let reward_token: Object<Metadata> = reward_token;
            let store_constructor_ref = &object::create_object(@staking_addr);
            let store = fungible_asset::create_store(store_constructor_ref, reward_token);
            simple_map::add(&mut reward_stores, reward_token, RewardStore {
                store,
                // The extend ref for the rewards store is kept so we can withdraw rewards from it later when
                // claimers claim their rewards.
                store_extend_ref: object::generate_extend_ref(store_constructor_ref),
            });
        });
    }

    /// Allow a claimer to claim the rewards for a past epoch.
    /// This returns a vector of rewards for all reward tokens.
    public entry fun claim_rewards_entry(
        claimer: &signer,
        rewards_pool: Object<RewardsPool>,
        epoch: u64,
    ) acquires RewardsPool {
        let rewards = claim_rewards(claimer, rewards_pool, epoch);
        let claimer_addr = signer::address_of(claimer);
        vector::for_each_reverse(rewards, |r| primary_fungible_store::deposit(claimer_addr, r));
    }

    /// Allow a claimer to claim the rewards for all tokens for a past epoch.
    /// This returns a vector of rewards for all reward tokens in the same order as the rewards tokens.
    /// If there's no reward for a specific reward token, the corresponding returned reward asset will be of zero
    /// amount (created via fungible_asset::zero).
    public fun claim_rewards(
        claimer: &signer,
        rewards_pool: Object<RewardsPool>,
    ): vector<FungibleAsset> acquires RewardsPool {
        let reward_tokens = reward_tokens(rewards_pool);
        let rewards = vector[];
        let claimer_addr = signer::address_of(claimer);
        let rewards_data = unchecked_mut_rewards_pool_data(&rewards_pool);
        vector::for_each(reward_tokens, |reward_token| {
            let reward = rewards(claimer_addr, rewards_data, reward_token);
            let reward_store = simple_map::borrow(&rewards_data.reward_stores, &reward_token);
            if (reward == 0) {
                vector::push_back(
                    &mut rewards,
                    fungible_asset::zero(fungible_asset::store_metadata(reward_store.store)),
                );
            } else {
                // Withdraw the reward from the corresponding store.
                let store_signer = &object::generate_signer_for_extending(&reward_store.store_extend_ref);
                vector::push_back(&mut rewards, fungible_asset::withdraw(store_signer, reward_store.store, reward));

                // Update the remaining amount of rewards for the epoch.
                let epoch_rewards = smart_table::borrow_mut(&mut rewards_data.epoch_rewards, epoch);
                let total_token_rewards = simple_map::borrow_mut(&mut epoch_rewards.total_amounts, &reward_token);
                *total_token_rewards = *total_token_rewards - reward;
            };
        });

        // Remove the claimer's allocation in the epoch as they have now claimed all rewards for that epoch.
        let epoch_rewards = smart_table::borrow_mut(&mut rewards_data.epoch_rewards, epoch);
        let all_shares = pool_u64::shares(&epoch_rewards.claimer_pool, claimer_addr);
        if (all_shares > 0) {
            pool_u64::redeem_shares(&mut epoch_rewards.claimer_pool, claimer_addr, all_shares);
        };

        rewards
    }

    /// Add rewards to the specified rewards pool. This can be called with multiple reward tokens.
    public fun add_rewards(
        rewards_pool: Object<RewardsPool>,
        fungible_assets: vector<FungibleAsset>,
        duration_seconds: u64,
    ) acquires RewardsPool {
        let rewards_data = unchecked_mut_rewards_pool_data(&rewards_pool);
        let reward_stores = &rewards_data.reward_stores;
        vector::for_each(fungible_assets, |fa| {
            let amount = fungible_asset::amount(&fa);
            let reward_token = fungible_asset::metadata_from_asset(&fa);
            assert!(simple_map::contains_key(reward_stores, &reward_token), EREWARD_TOKEN_NOT_SUPPORTED);

            // Deposit the rewards into the corresponding store.
            let reward_store = simple_map::borrow(reward_stores, &reward_token);
            fungible_asset::deposit(reward_store.store, fa);

            // Update total amount of rewards for this token for this epoch.
            let total_amounts = &mut epoch_rewards_or_default(&mut rewards_data.epoch_rewards, epoch).total_amounts;
            if (simple_map::contains_key(total_amounts, &reward_token)) {
                let current_amount = simple_map::borrow_mut(total_amounts, &reward_token);
                *current_amount = *current_amount + amount;
            } else {
                simple_map::add(total_amounts, reward_token, amount);
            };
        });
    }

    /// This should only be called by system modules to increase the shares of a claimer for the current epoch.
    public(friend) fun increase_allocation(
        claimer: address,
        rewards_pool: Object<RewardsPool>,
        amount: u64,
    ) acquires RewardsPool {
        let epoch_rewards = &mut unchecked_mut_rewards_pool_data(&rewards_pool).epoch_rewards;
        let current_epoch_rewards = epoch_rewards_or_default(epoch_rewards, epoch::now());
        pool_u64::buy_in(&mut current_epoch_rewards.claimer_pool, claimer, amount);
    }

    /// This should only be called by system modules to decrease the shares of a claimer for the current epoch.
    public(friend) fun decrease_allocation(
        claimer: address,
        rewards_pool: Object<RewardsPool>,
        amount: u64,
    ) acquires RewardsPool {
        let epoch_rewards = &mut unchecked_mut_rewards_pool_data(&rewards_pool).epoch_rewards;
        let current_epoch_rewards = epoch_rewards_or_default(epoch_rewards, epoch::now());
        pool_u64::redeem_shares(&mut current_epoch_rewards.claimer_pool, claimer, (amount as u128));
    }

    // ================================= View Functions ================================= //

    #[view]
    /// Return all the reward tokens supported by the rewards pool.
    public fun reward_tokens(rewards_pool: Object<RewardsPool>): vector<Object<Metadata>> acquires RewardsPool {
        simple_map::keys(&safe_rewards_pool_data(&rewards_pool).reward_stores)
    }

    #[view]
    /// Return the current shares and total shares of a given claimer for a given rewards pool and epoch.
    public fun claimer_shares(
        claimer: address,
        rewards_pool: Object<RewardsPool>,
        epoch: u64,
    ): (u64, u64) acquires RewardsPool {
        let epoch_rewards = smart_table::borrow(&safe_rewards_pool_data(&rewards_pool).epoch_rewards, epoch);
        let shares = (pool_u64::shares(&epoch_rewards.claimer_pool, claimer) as u64);
        let total_shares = (pool_u64::total_shares(&epoch_rewards.claimer_pool) as u64);
        (shares, total_shares)
    }

    #[view]
    /// Return the amounts of claimable rewards for a given claimer, rewards pool, and epoch.
    /// The return value is a vector of reward tokens and a vector of amounts.
    public fun claimable_rewards(
        claimer: address,
        rewards_pool: Object<RewardsPool>,
        epoch: u64,
    ): (vector<Object<Metadata>>, vector<u64>) acquires RewardsPool {
        assert!(epoch < epoch::now(), EREWARDS_CANNOT_BE_CLAIMED_FOR_CURRENT_EPOCH);
        let all_rewards_tokens = reward_tokens(rewards_pool);
        let non_empty_reward_tokens = vector[];
        let reward_per_tokens = vector[];
        let rewards_pool_data = safe_rewards_pool_data(&rewards_pool);
        vector::for_each(all_rewards_tokens, |reward_token| {
            let reward = rewards(claimer, rewards_pool_data, reward_token, epoch);
            if (reward > 0) {
                vector::push_back(&mut non_empty_reward_tokens, reward_token);
                vector::push_back(&mut reward_per_tokens, reward);
            };
        });
        (non_empty_reward_tokens, reward_per_tokens)
    }

    // ================================= Helper Functions ================================= //

    fun rewards(
        claimer: address,
        rewards_pool_data: &RewardsPool,
        reward_token: Object<Metadata>,
    ): u64 {
        // No rewards have been added for this reward token.
        if (!simple_map::contains_key(&rewards_pool_data.total_amounts, &reward_token)) {
            return 0
        };

        // Return the claimer's shares of the current total rewards for the epoch.
        let total_token_rewards = *simple_map::borrow(&rewards_pool_data.total_amounts, &reward_token);
        let claimer_shares = pool_u64::shares(&rewards_pool_data.claimer_pool, claimer);
        pool_u64::shares_to_amount_with_total_coins(&rewards_pool_data.claimer_pool, claimer_shares, total_token_rewards)
    }

    fun safe_rewards_pool_data(
        rewards_pool: &Object<RewardsPool>,
    ): &RewardsPool acquires RewardsPool {
        borrow_global<RewardsPool>(object::object_address(rewards_pool))
    }

    fun epoch_rewards_or_default(
        epoch_rewards: &mut SmartTable<u64, EpochRewards>,
        epoch: u64,
    ): &mut EpochRewards acquires RewardsPool {
        if (!smart_table::contains(epoch_rewards, epoch)) {
            smart_table::add(epoch_rewards, epoch, EpochRewards {
                total_amounts: simple_map::new(),
                claimer_pool: pool_u64::create(),
            });
        };
        smart_table::borrow_mut(epoch_rewards, epoch)
    }

    fun unchecked_mut_rewards_pool_data(
        rewards_pool: &Object<RewardsPool>,
    ): &mut RewardsPool acquires RewardsPool {
        borrow_global_mut<RewardsPool>(object::object_address(rewards_pool))
    }

    // ================================= Unit Tests ================================= //

    #[test_only]
    friend rewards_pool::rewards_pool_tests;
}
