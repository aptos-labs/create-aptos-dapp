module stake_pool_addr::stake_pool {
    use std::option;
    use std::option::Option;
    use std::signer;

    use aptos_std::fixed_point64::{Self, FixedPoint64};
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
    const ERR_USER_DOES_NOT_HAVE_STAKE: u64 = 3;
    /// Reward schedule already exists
    const ERR_REWARD_SCHEDULE_ALREADY_EXISTS: u64 = 4;
    /// Only reward creator can add reward
    const ERR_ONLY_REWARD_CREATOR_CAN_ADD_REWARD: u64 = 5;
    /// Only admin can set pending admin
    const ERR_ONLY_ADMIN_CAN_SET_PENDING_ADMIN: u64 = 6;
    /// Only pending admin can accept admin
    const ERR_ONLY_PENDING_ADMIN_CAN_ACCEPT_ADMIN: u64 = 7;
    /// Not enough balance to add reward
    const ERR_NOT_ENOUGH_BALANCE_TO_ADD_REWARD: u64 = 8;
    /// Only admin can update reward creator
    const ERR_ONLY_ADMIN_CAN_UPDATE_REWARD_CREATOR: u64 = 9;

    /// Unique per user
    struct UserStake has store, drop {
        // Fungible store to hold user stake
        stake_store: Object<FungibleStore>,
        // Last time user claimed reward
        last_claim_ts: u64,
        // Amount of stake
        amount: u64,
        // Reward index at last claim
        index: FixedPoint64,
    }

    /// Global per contract
    struct RewardSchedule has store, drop {
        // Reward per second
        rps: u64,
        // Reward index at last update
        index: FixedPoint64,
        // Last time reward index updated
        last_update_ts: u64,
        // Start time of reward schedule
        start_ts: u64,
        // End time of reward schedule
        end_ts: u64,
    }

    struct StakePool has key {
        // Fungible asset stakers are staking
        staked_fa_metadata_object: Object<Metadata>,
        // Fungible asset stakers are earning rewards in
        reward_fa_metadata_object: Object<Metadata>,
        // Fungible store to hold rewards
        reward_store: Object<FungibleStore>,
        // Key is user address, value is user stake data
        user_stakes: Table<address, UserStake>,
        // Total stake in the contract
        total_stake: u64,
        // Reward schedule if there exists one
        reward_schedule: Option<RewardSchedule>,
    }

    /// Global per contract
    /// Generate signer to send reward from reward store to user
    struct RewardStoreController has key {
        extend_ref: ExtendRef,
    }

    /// Global per contract
    struct Config has key {
        // Creator can add reward
        reward_creator: address,
        // Admin can set pending admin, accept admin, update mint fee collector, create FA and update creator
        admin: address,
        // Pending admin can accept admin
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
        let config = borrow_global_mut<Config>(@stake_pool_addr);
        assert!(is_admin(config, sender_addr), ERR_ONLY_ADMIN_CAN_SET_PENDING_ADMIN);
        config.pending_admin = option::some(new_admin);
    }

    /// Accept admin of the contract
    public entry fun accept_admin(sender: &signer) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@stake_pool_addr);
        assert!(config.pending_admin == option::some(sender_addr), ERR_ONLY_PENDING_ADMIN_CAN_ACCEPT_ADMIN);
        config.admin = sender_addr;
        config.pending_admin = option::none();
    }

    /// Update reward creator
    public entry fun update_reward_creator(sender: &signer, new_reward_creator: address) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@stake_pool_addr);
        assert!(is_admin(config, sender_addr), ERR_ONLY_ADMIN_CAN_UPDATE_REWARD_CREATOR);
        config.reward_creator = new_reward_creator;
    }

    /// Create new reward schedule
    /// Only reward creator can call
    /// Abort if reward schedule already exists
    public entry fun create_reward_schedule(
        sender: &signer,
        rps: u64,
        duration_seconds: u64
    ) acquires StakePool, Config {
        let current_ts = timestamp::now_seconds();
        let sender_addr = signer::address_of(sender);
        let config = borrow_global<Config>(@stake_pool_addr);
        assert!(config.reward_creator == sender_addr, ERR_ONLY_REWARD_CREATOR_CAN_ADD_REWARD);

        let total_reward_amount  = rps * duration_seconds;
        let stake_pool_mut = borrow_global_mut<StakePool>(@stake_pool_addr);
        assert!(option::is_none(&stake_pool_mut.reward_schedule), ERR_REWARD_SCHEDULE_ALREADY_EXISTS);
        assert!(primary_fungible_store::balance(sender_addr, stake_pool_mut.reward_fa_metadata_object) >= total_reward_amount, ERR_NOT_ENOUGH_BALANCE_TO_ADD_REWARD);

        stake_pool_mut.reward_schedule = option::some(RewardSchedule {
            index: fixed_point64::create_from_u128(0),
            rps,
            last_update_ts: current_ts,
            start_ts: current_ts,
            end_ts: current_ts + duration_seconds,
        });

        fungible_asset::transfer(
            sender,
            primary_fungible_store::primary_store(sender_addr, stake_pool_mut.reward_fa_metadata_object),
            stake_pool_mut.reward_store,
            total_reward_amount,
        );
    }

    /// Claim reward
    /// Any staker can call
    public entry fun claim_reward(sender: &signer) acquires StakePool, RewardStoreController {
        let current_ts = timestamp::now_seconds();
        let sender_addr = signer::address_of(sender);
        let stake_pool = borrow_global<StakePool>(@stake_pool_addr);
        let claimable_reward = get_claimable_reward_helper(stake_pool, sender_addr, current_ts);
        if (claimable_reward == 0) {
            return
        };
        transfer_reward_to_claimer(claimable_reward, sender_addr, stake_pool);
        update_reward_index_and_claim_ts(sender_addr, current_ts);
    }

    /// Stake, will auto claim before staking
    /// Anyone can call
    public entry fun stake(sender: &signer, amount: u64) acquires StakePool, RewardStoreController {
        let current_ts = timestamp::now_seconds();
        let sender_addr = signer::address_of(sender);
        let stake_pool = borrow_global<StakePool>(@stake_pool_addr);
        let claimable_reward = get_claimable_reward_helper(stake_pool, sender_addr, current_ts);
        if (claimable_reward > 0) {
            transfer_reward_to_claimer(claimable_reward, sender_addr, stake_pool);
        };

        assert!(
            primary_fungible_store::balance(sender_addr, stake_pool.staked_fa_metadata_object) >= amount,
            ERR_NOT_ENOUGH_BALANCE_TO_STAKE
        );
        let (stake_store, is_new_stake_store) = get_or_create_user_stake_store(
            &stake_pool.user_stakes,
            stake_pool.staked_fa_metadata_object,
            sender_addr,
        );
        fungible_asset::transfer(
            sender,
            primary_fungible_store::primary_store(signer::address_of(sender), stake_pool.staked_fa_metadata_object),
            stake_store,
            amount
        );

        if (is_new_stake_store) {
            create_new_user_stake_entry(sender_addr, stake_store, current_ts);
        };

        update_reward_index_and_claim_ts(sender_addr, current_ts);

        let stake_pool_mut = borrow_global_mut<StakePool>(@stake_pool_addr);
        let user_stake_mut = table::borrow_mut(&mut stake_pool_mut.user_stakes, sender_addr);
        user_stake_mut.amount = user_stake_mut.amount + amount;
        stake_pool_mut.total_stake = stake_pool_mut.total_stake + amount;
    }

    /// Unstake, will auto claim before unstaking
    /// Only existing stakers can call
    public entry fun unstake(sender: &signer, amount: u64) acquires StakePool, RewardStoreController {
        let current_ts = timestamp::now_seconds();
        let sender_addr = signer::address_of(sender);
        let stake_pool = borrow_global<StakePool>(@stake_pool_addr);
        assert!(table::contains(&stake_pool.user_stakes, sender_addr), ERR_USER_DOES_NOT_HAVE_STAKE);
        let claimable_reward = get_claimable_reward_helper(stake_pool, sender_addr, current_ts);
        if (claimable_reward > 0) {
            transfer_reward_to_claimer(claimable_reward, sender_addr, stake_pool);
        };

        let user_stake = table::borrow(&stake_pool.user_stakes, sender_addr);
        assert!(user_stake.amount >= amount, ERR_NOT_ENOUGH_BALANCE_TO_UNSTAKE);
        fungible_asset::transfer(
            sender,
            user_stake.stake_store,
            primary_fungible_store::primary_store(signer::address_of(sender), stake_pool.staked_fa_metadata_object),
            amount
        );

        update_reward_index_and_claim_ts(sender_addr, current_ts);

        let stake_pool_mut = borrow_global_mut<StakePool>(@stake_pool_addr);
        let user_stake_mut = table::borrow_mut(&mut stake_pool_mut.user_stakes, sender_addr);
        user_stake_mut.amount = user_stake_mut.amount - amount;
        stake_pool_mut.total_stake = stake_pool_mut.total_stake - amount;

        if (user_stake_mut.amount == 0) {
            table::remove(&mut stake_pool_mut.user_stakes, sender_addr);
        };
    }

    // ================================= View Functions ================================= //

    #[view]
    /// Get stake pool data
    public fun get_stake_pool_data(): (
        Object<Metadata>,
        Object<Metadata>,
        Object<FungibleStore>,
        u64
    ) acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@stake_pool_addr);
        (
            stake_pool.staked_fa_metadata_object,
            stake_pool.reward_fa_metadata_object,
            stake_pool.reward_store,
            stake_pool.total_stake
        )
    }

    #[view]
    /// Whether reward schedule exists
    public fun exists_reward_schedule(): bool acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@stake_pool_addr);
        option::is_some(&stake_pool.reward_schedule)
    }

    #[view]
    /// Get reward schedule data
    public fun get_reward_schedule(): (
        FixedPoint64,
        u64,
        u64,
        u64,
        u64
    ) acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@stake_pool_addr);
        let reward_schedule = option::borrow(&stake_pool.reward_schedule);
        (
            reward_schedule.index,
            reward_schedule.rps,
            reward_schedule.last_update_ts,
            reward_schedule.start_ts,
            reward_schedule.end_ts
        )
    }

    #[view]
    /// Whether user has stake
    public fun exists_user_stake(user_addr: address): bool acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@stake_pool_addr);
        table::contains(&stake_pool.user_stakes, user_addr)
    }

    #[view]
    /// Get user stake data
    public fun get_user_stake_data(user_addr: address): (
        u64,
        u64,
        FixedPoint64,
    ) acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@stake_pool_addr);
        let user_stake = table::borrow(&stake_pool.user_stakes, user_addr);
        (
            user_stake.amount,
            user_stake.last_claim_ts,
            user_stake.index,
        )
    }

    #[view]
    /// Get claimable reward
    public fun get_claimable_reward(user_addr: address): u64 acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@stake_pool_addr);
        get_claimable_reward_helper(stake_pool, user_addr, timestamp::now_seconds())
    }

    // ================================= Helper Functions ================================= //

    /// Check if sender is admin or owner of the object when package is published to object
    fun is_admin(config: &Config, sender: address): bool {
        if (sender == config.admin) {
            true
        } else {
            if (object::is_object(@stake_pool_addr)) {
                let obj = object::address_to_object<ObjectCore>(@stake_pool_addr);
                object::is_owner(obj, sender)
            } else {
                false
            }
        }
    }

    /// Calculate new reward index
    /// Core logic is new_index = old_index + (current_ts - last_update_ts) * rps / total_stake
    fun calculate_new_reward_index(
        reward_schedule: &Option<RewardSchedule>,
        current_ts: u64,
        total_stake: u64
    ): FixedPoint64 {
        if (option::is_none(reward_schedule) || total_stake == 0) {
            fixed_point64::create_from_u128(0)
        } else {
            let reward_schedule = option::borrow(reward_schedule);
            fixed_point64::add(
                reward_schedule.index,
                fixed_point64::create_from_rational(((math64::min(
                    current_ts,
                    reward_schedule.end_ts
                ) - reward_schedule.last_update_ts) * reward_schedule.rps as u128), (total_stake as u128)))
        }
    }

    /// Get claimable reward
    /// Core logic is claimable_reward = (current_index - user_index) * user_stake_amount
    fun get_claimable_reward_helper(stake_pool: &StakePool, user_addr: address, current_ts: u64): u64 {
        if (option::is_none(&stake_pool.reward_schedule)) {
            return 0
        };
        let reward_schedule = option::borrow(&stake_pool.reward_schedule);
        if (current_ts < reward_schedule.start_ts) {
            return 0
        };
        if (!table::contains(&stake_pool.user_stakes, user_addr)) {
            return 0
        };

        let updated_reward_index = calculate_new_reward_index(
            &stake_pool.reward_schedule,
            current_ts,
            stake_pool.total_stake
        );

        let user_stake = table::borrow(&stake_pool.user_stakes, user_addr);

        (fixed_point64::multiply_u128(
            (user_stake.amount as u128),
            fixed_point64::sub(updated_reward_index, user_stake.index)
        ) as u64)
    }

    /// Get or create user stake store
    /// If user does not have stake store, create one
    fun get_or_create_user_stake_store(
        user_stakes: &Table<address, UserStake>,
        staked_fa_metadata_object: Object<Metadata>,
        sender_addr: address,
    ): (Object<FungibleStore>, bool) {
        if (!table::contains(user_stakes, sender_addr)) {
            let stake_store_object_constructor_ref = &object::create_object(sender_addr);
            let stake_store = fungible_asset::create_store(
                stake_store_object_constructor_ref,
                staked_fa_metadata_object,
            );
            (stake_store, true)
        } else {
            let user_stake = table::borrow(user_stakes, sender_addr);
            (user_stake.stake_store, false)
        }
    }

    /// Transfer reward from reward store to claimer
    fun transfer_reward_to_claimer(
        claimable_reward: u64,
        sender_addr: address,
        stake_pool: &StakePool
    ) acquires RewardStoreController {
        primary_fungible_store::ensure_primary_store_exists(sender_addr, stake_pool.reward_fa_metadata_object);
        fungible_asset::transfer(
            &object::generate_signer_for_extending(&borrow_global<RewardStoreController>(@stake_pool_addr).extend_ref),
            stake_pool.reward_store,
            primary_fungible_store::primary_store(sender_addr, stake_pool.reward_fa_metadata_object),
            claimable_reward
        );
    }

    /// Update reward index and claim ts
    fun update_reward_index_and_claim_ts(sender_addr: address, current_ts: u64) acquires StakePool {
        let stake_pool_mut = borrow_global_mut<StakePool>(@stake_pool_addr);
        let user_stake_mut = table::borrow_mut(&mut stake_pool_mut.user_stakes, sender_addr);
        if (option::is_none(&stake_pool_mut.reward_schedule)) {
            return
        };
        let new_reward_index = calculate_new_reward_index(
            &stake_pool_mut.reward_schedule,
            current_ts,
            stake_pool_mut.total_stake
        );

        let reward_schedule_mut = option::borrow_mut(&mut stake_pool_mut.reward_schedule);
        reward_schedule_mut.last_update_ts = current_ts;
        reward_schedule_mut.index = new_reward_index;

        user_stake_mut.last_claim_ts = current_ts;
        user_stake_mut.index = new_reward_index;
    }

    /// Create new user stake entry with default values
    fun create_new_user_stake_entry(
        sender_addr: address,
        stake_store: Object<FungibleStore>,
        current_ts: u64
    ) acquires StakePool {
        let stake_pool_mut = borrow_global_mut<StakePool>(@stake_pool_addr);
        table::add(&mut stake_pool_mut.user_stakes, sender_addr, UserStake {
            stake_store,
            last_claim_ts: current_ts,
            amount: 0,
            index: fixed_point64::create_from_u128(0),
        });
    }

    // ================================= Unit Tests ================================= //

    #[test_only]
    use std::string;

    #[test_only]
    public fun init_module_for_test(
        aptos_framework: &signer,
        sender: &signer,
        initial_reward_creator: &signer,
        staker1: &signer,
        staker2: &signer,
        reward_amount: u64,
        staker1_stake_amount: u64,
        staker2_stake_amount: u64,
    ) {
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let sender_addr = signer::address_of(sender);
        let stake_fa_obj_constructor_ref = &object::create_sticky_object(sender_addr);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            stake_fa_obj_constructor_ref,
            option::none(),
            string::utf8(b"Test FA for staking"),
            string::utf8(b"TFAS"),
            8,
            string::utf8(b"url"),
            string::utf8(b"url"),
        );
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(stake_fa_obj_constructor_ref),
            signer::address_of(staker1),
            staker1_stake_amount
        );
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(stake_fa_obj_constructor_ref),
            signer::address_of(staker2),
            staker2_stake_amount
        );

        let reward_fa_obj_constructor_ref = &object::create_sticky_object(sender_addr);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            reward_fa_obj_constructor_ref,
            option::none(),
            string::utf8(b"Test FA for reward"),
            string::utf8(b"TFAR"),
            8,
            string::utf8(b"url"),
            string::utf8(b"url"),
        );
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(reward_fa_obj_constructor_ref),
            signer::address_of(initial_reward_creator),
            reward_amount
        );

        move_to(sender, Config {
            reward_creator: signer::address_of(initial_reward_creator),
            admin: sender_addr,
            pending_admin: option::none(),
        });

        let reward_store_constructor_ref = &object::create_object(sender_addr);
        move_to(sender, RewardStoreController {
            extend_ref: object::generate_extend_ref(reward_store_constructor_ref),
        });

        move_to(sender, StakePool {
            staked_fa_metadata_object: object::object_from_constructor_ref(stake_fa_obj_constructor_ref),
            reward_fa_metadata_object: object::object_from_constructor_ref(reward_fa_obj_constructor_ref),
            reward_store: fungible_asset::create_store(
                reward_store_constructor_ref,
                object::object_from_constructor_ref<Metadata>(reward_fa_obj_constructor_ref),
            ),
            user_stakes: table::new(),
            total_stake: 0,
            reward_schedule: option::none(),
        });
    }
}
