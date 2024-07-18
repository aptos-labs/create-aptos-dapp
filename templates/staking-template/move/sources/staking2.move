module staking_addr::staking {
    use std::option;
    use std::option::Option;
    use std::signer;

    use aptos_std::math64;
    use aptos_std::table::{Self, Table};

    use aptos_framework::fungible_asset::{Self, Metadata, FungibleStore};
    use aptos_framework::object::{Self, Object, ExtendRef, ObjectCore};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::timestamp;

    // ================================= Errors ================================= //
    /// user tries to stake more than owned
    const ERR_NOT_ENOUGH_BALANCE_TO_STAKE: u64 = 1;
    /// user tries to unstake more than staked
    const ERR_NOT_ENOUGH_BALANCE_TO_UNSTAKE: u64 = 2;
    /// User does not have any stake
    const ERR_USER_DOESN_NOT_HAVE_STAKE: u64 = 3;
    /// Reward schedule already exists
    const ERR_REWARD_SCHEDULE_ALREADY_EXISTS: u64 = 4;
    /// Only reward creator can add reward
    const ERR_ONLY_REWARD_CREATOR_CAN_ADD_REWARD: u64 = 5;
    /// Only admin can set pending admin
    const ERR_ONLY_ADMIN_CAN_SET_PENDING_ADMIN: u64 = 6;
    /// Only pending admin can accept admin
    const ERR_ONLY_PENDING_ADMIN_CAN_ACCEPT_ADMIN: u64 = 7;

    struct UserStake has store, drop {
        stake_store: Object<FungibleStore>,
        last_claim_ts: u64,
        amount: u64,
        index: u128,
    }

    struct RewardSchedule has store, drop {
        index: u128,
        rps: u64,
        last_update_ts: u64,
        start_ts: u64,
        end_ts: u64,
    }

    struct StakePool has key {
        // fungible asset stakers are staking
        staked_fa_metadata_object: Object<Metadata>,
        // fungible asset stakers are earning rewards in
        reward_fa_metadata_object: Object<Metadata>,
        reward_store: Object<FungibleStore>,
        // key is staker address, value is stake data
        user_stakes: Table<address, UserStake>,
        // total stake in the contract
        total_stake: u64,
        reward_schedule: Option<RewardSchedule>,
    }

    /// Global per contract
    struct RewardStoreController has key {
        extend_ref: ExtendRef,
    }

    /// Global per contract
    struct Config has key {
        // creator can add reward
        reward_creator: address,
        // admin can set pending admin, accept admin, update mint fee collector, create FA and update creator
        admin: address,
        // pending admin can accept admin
        pending_admin: Option<address>,
    }


    /// If you deploy the module under an object, sender is the object's signer
    /// If you deploy the module under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        let sender_addr = signer::address_of(sender);
        move_to(sender, Config {
            reward_creator: @initial_reward_creator_addr,
            admin: sender_addr,
            pending_admin: option::none(),
        });

        let reward_store_constructor_ref = &object::create_object(sender_addr);
        move_to(sender, RewardStoreController {
            extend_ref: object::generate_extend_ref(reward_store_constructor_ref),
        });

        move_to(sender, StakePool {
            staked_fa_metadata_object: object::address_to_object<Metadata>(@staked_fa_obj_addr),
            reward_fa_metadata_object: object::address_to_object<Metadata>(@reward_fa_obj_addr),
            reward_store: fungible_asset::create_store(
                reward_store_constructor_ref,
                object::address_to_object<Metadata>(@reward_fa_obj_addr)
            ),
            user_stakes: table::new(),
            total_stake: 0,
            reward_schedule: option::none(),
        });
    }

    // ================================= Entry Functions ================================= //

    /// Set pending admin of the contract, then pending admin can call accept_admin to become admin
    public entry fun set_pending_admin(sender: &signer, new_admin: address) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@staking_addr);
        assert!(is_admin(config, sender_addr), ERR_ONLY_ADMIN_CAN_SET_PENDING_ADMIN);
        config.pending_admin = option::some(new_admin);
    }

    /// Accept admin of the contract
    public entry fun accept_admin(sender: &signer) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@staking_addr);
        assert!(config.pending_admin == option::some(sender_addr), ERR_ONLY_PENDING_ADMIN_CAN_ACCEPT_ADMIN);
        config.admin = sender_addr;
        config.pending_admin = option::none();
    }

    public entry fun create_reward_schedule(
        sender: &signer,
        rps: u64,
        start_ts: u64,
        end_ts: u64
    ) acquires StakePool, Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global<Config>(@staking_addr);
        assert!(config.reward_creator == sender_addr, ERR_ONLY_REWARD_CREATOR_CAN_ADD_REWARD);

        let stake_pool_mut = borrow_global_mut<StakePool>(@staking_addr);
        assert!(option::is_none(&stake_pool_mut.reward_schedule), ERR_REWARD_SCHEDULE_ALREADY_EXISTS);

        stake_pool_mut.reward_schedule = option::some(RewardSchedule {
            index: 0,
            rps,
            last_update_ts: start_ts,
            start_ts,
            end_ts,
        });
    }

    public entry fun claim_reward(sender: &signer) acquires StakePool, RewardStoreController {
        let current_ts = timestamp::now_seconds();
        let sender_addr = signer::address_of(sender);
        let claimable_reward = get_claimable_reward(sender_addr);
        if (claimable_reward == 0) {
            return
        };

        let stake_pool_mut = borrow_global_mut<StakePool>(@staking_addr);
        let reward_schedule_mut = option::borrow_mut(&mut stake_pool_mut.reward_schedule);
        let user_stake_mut = table::borrow_mut(&mut stake_pool_mut.user_stakes, sender_addr);

        fungible_asset::transfer(
            &object::generate_signer_for_extending(&borrow_global<RewardStoreController>(@staking_addr).extend_ref),
            stake_pool_mut.reward_store,
            primary_fungible_store::primary_store(sender_addr, stake_pool_mut.reward_fa_metadata_object),
            claimable_reward
        );

        let new_reward_index = calculate_new_reward_index(
            reward_schedule_mut,
            current_ts,
            stake_pool_mut.total_stake
        );
        user_stake_mut.last_claim_ts = current_ts;
        user_stake_mut.index = new_reward_index;
        reward_schedule_mut.last_update_ts = current_ts;
        reward_schedule_mut.index = new_reward_index;
    }

    public entry fun stake(sender: &signer, amount: u64) acquires StakePool, RewardStoreController {
        let current_ts = timestamp::now_seconds();
        let sender_addr = signer::address_of(sender);
        assert!(
            primary_fungible_store::balance(sender_addr, get_staked_fa_metadata_object()) >= amount,
            ERR_NOT_ENOUGH_BALANCE_TO_STAKE
        );

        let claimable_reward = get_claimable_reward(sender_addr);

        let stake_pool = borrow_global<StakePool>(@staking_addr);
        if (claimable_reward > 0) {
            fungible_asset::transfer(
                &object::generate_signer_for_extending(&borrow_global<RewardStoreController>(@staking_addr).extend_ref),
                stake_pool.reward_store,
                primary_fungible_store::primary_store(sender_addr, stake_pool.reward_fa_metadata_object),
                claimable_reward
            );
        };

        let stake_pool_mut = borrow_global_mut<StakePool>(@staking_addr);
        if (!table::contains(&stake_pool_mut.user_stakes, sender_addr)) {
            let stake_store_object_constructor_ref = &object::create_object(sender_addr);
            let stake_store = fungible_asset::create_store(
                stake_store_object_constructor_ref,
                stake_pool_mut.staked_fa_metadata_object,
            );
            table::add(&mut stake_pool_mut.user_stakes, sender_addr, UserStake {
                stake_store,
                last_claim_ts: current_ts,
                amount: 0,
                index: 0,
            });
        };
        let user_stake_mut = table::borrow_mut(&mut stake_pool_mut.user_stakes, sender_addr);
        let reward_schedule_mut = option::borrow_mut(&mut stake_pool_mut.reward_schedule);

        let new_reward_index = calculate_new_reward_index(
            reward_schedule_mut,
            current_ts,
            stake_pool_mut.total_stake
        );
        stake_pool_mut.total_stake = stake_pool_mut.total_stake + amount;
        reward_schedule_mut.last_update_ts = current_ts;
        reward_schedule_mut.index = new_reward_index;
        user_stake_mut.last_claim_ts = current_ts;
        user_stake_mut.index = new_reward_index;
        user_stake_mut.amount = user_stake_mut.amount + amount;

        fungible_asset::transfer(
            sender,
            primary_fungible_store::primary_store(sender_addr, stake_pool_mut.staked_fa_metadata_object),
            user_stake_mut.stake_store,
            amount
        );
    }

    public entry fun unstake(sender: &signer, amount: u64) acquires StakePool, RewardStoreController {
        let current_ts = timestamp::now_seconds();
        let sender_addr = signer::address_of(sender);
        let claimable_reward = get_claimable_reward(sender_addr);

        let stake_pool = borrow_global<StakePool>(@staking_addr);
        assert!(table::contains(&stake_pool.user_stakes, sender_addr), ERR_USER_DOESN_NOT_HAVE_STAKE);

        if (claimable_reward > 0) {
            fungible_asset::transfer(
                &object::generate_signer_for_extending(&borrow_global<RewardStoreController>(@staking_addr).extend_ref),
                stake_pool.reward_store,
                primary_fungible_store::primary_store(sender_addr, stake_pool.reward_fa_metadata_object),
                claimable_reward
            );
        };

        let stake_pool_mut = borrow_global_mut<StakePool>(@staking_addr);
        let user_stake_mut = table::borrow_mut(&mut stake_pool_mut.user_stakes, sender_addr);
        assert!(user_stake_mut.amount >= amount, ERR_NOT_ENOUGH_BALANCE_TO_UNSTAKE);
        let reward_schedule = option::borrow_mut(&mut stake_pool_mut.reward_schedule);

        let new_reward_index = calculate_new_reward_index(
            reward_schedule,
            current_ts,
            stake_pool_mut.total_stake
        );
        stake_pool_mut.total_stake = stake_pool_mut.total_stake - amount;
        reward_schedule.last_update_ts = current_ts;
        reward_schedule.index = new_reward_index;
        if (user_stake_mut.amount > amount) {
            user_stake_mut.last_claim_ts = current_ts;
            user_stake_mut.index = new_reward_index;
            user_stake_mut.amount = user_stake_mut.amount - amount;
        };

        fungible_asset::transfer(
            sender,
            user_stake_mut.stake_store,
            primary_fungible_store::primary_store(signer::address_of(sender), stake_pool_mut.staked_fa_metadata_object),
            amount
        );

        if (user_stake_mut.amount == amount) {
            table::remove(&mut stake_pool_mut.user_stakes, sender_addr);
        };
    }

    // ================================= View Functions ================================= //

    #[view]
    public fun get_staked_fa_metadata_object(): Object<Metadata> acquires StakePool {
        let staking = borrow_global<StakePool>(@staking_addr);
        staking.staked_fa_metadata_object
    }

    #[view]
    public fun get_reward_fa_metadata_object(): Object<Metadata> acquires StakePool {
        let staking = borrow_global<StakePool>(@staking_addr);
        staking.reward_fa_metadata_object
    }

    #[view]
    public fun get_staked_balance(user_addr: address): u64 acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@staking_addr);
        if (table::contains(&stake_pool.user_stakes, user_addr)) {
            table::borrow(&stake_pool.user_stakes, user_addr).amount
        } else {
            0
        }
    }

    #[view]
    public fun get_total_stake(): u64 acquires StakePool {
        borrow_global<StakePool>(@staking_addr).total_stake
    }

    #[view]
    public fun get_claimable_reward(user_addr: address): u64 acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@staking_addr);
        if (option::is_none(&stake_pool.reward_schedule)) {
            return 0
        };
        let reward_schedule = option::borrow(&stake_pool.reward_schedule);
        let current_ts = timestamp::now_seconds();
        if (current_ts < reward_schedule.start_ts) {
            return 0
        };
        if (!table::contains(&stake_pool.user_stakes, user_addr)) {
            return 0
        };

        let updated_reward_index = calculate_new_reward_index(
            reward_schedule,
            current_ts,
            stake_pool.total_stake
        );

        let user_stake = table::borrow(&stake_pool.user_stakes, user_addr);

        (((user_stake.amount as u128) * (updated_reward_index - user_stake.index)) as u64)
    }

    // ================================= Helper Functions ================================= //

    /// Check if sender is admin or owner of the object when package is published to object
    fun is_admin(config: &Config, sender: address): bool {
        if (sender == config.admin) {
            true
        } else {
            if (object::is_object(@staking_addr)) {
                let obj = object::address_to_object<ObjectCore>(@staking_addr);
                object::is_owner(obj, sender)
            } else {
                false
            }
        }
    }

    fun calculate_new_reward_index(
        reward_schedule: &RewardSchedule,
        current_ts: u64,
        total_stake: u64
    ): u128 {
        reward_schedule.index +
            (((math64::min(
                current_ts,
                reward_schedule.end_ts
            ) - reward_schedule.last_update_ts) * reward_schedule.rps / total_stake) as u128)
    }

    // ================================= Unit Tests ================================= //
    // #[test_only]
    // use aptos_framework::account;

    #[test(aptos_framework = @0x1, sender = @staking_addr)]
    fun test_happy_path(
        aptos_framework: &signer,
        sender: &signer,
    ) {
        let _sender_addr = signer::address_of(sender);
        init_module(sender);
    }
}
