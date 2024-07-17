module staking_addr::staking_astro {
    use std::option::{Self, Option};
    use std::signer;
    use std::vector;

    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_std::table::{Self, Table};

    use aptos_framework::fungible_asset::{Self, Metadata, FungibleStore};
    use aptos_framework::object::{Self, Object, ExtendRef, ObjectCore};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::timestamp;

    // ================================= Errors ================================= //
    /// Only admin can set pending admin
    const EONLY_ADMIN_CAN_SET_PENDING_ADMIN: u64 = 1;
    /// Only pending admin can accept admin
    const ENOT_PENDING_ADMIN: u64 = 2;
    /// Only reward creator can add reward
    const EONLY_REWARD_CREATOR_CAN_ADD_REWARD: u64 = 3;
    /// Schedule duration must be greater than 0 and less than 6 months
    const EINVALID_DURATION_LENGTH: u64 = 4;
    /// Reward per second must not be zero
    const EREWARD_PER_SECOND_MUST_NOT_BE_ZERO: u64 = 5;
    /// user tries to add more reward than owned
    const ENOT_ENOUGH_BALANCE_TO_ADD_REWARD: u64 = 6;
    /// user tries to stake more than owned
    const ENOT_ENOUGH_BALANCE_TO_STAKE: u64 = 7;
    /// user tries to unstake more than staked
    const ENOT_ENOUGH_BALANCE_TO_UNSTAKE: u64 = 8;
    /// User does not have any stake
    const EUSER_DOESN_NOT_HAVE_STAKE: u64 = 9;

    /// incentives schedules must be normalized to 1 week
    const EPOCH_LENGTH: u64 = 86400 * 7;
    /// incentives schedules aligned to start on Monday. First date: Mon Oct 9 00:00:00 UTC 2023
    const EPOCHS_START: u64 = 1696809600;
    /// Maximum allowed reward schedule duration (~6 month)
    const MAX_PERIODS: u64 = 25;

    struct RewardSchedule {
        /// Schedule start time (matches with epoch start time i.e. on Monday)
        next_epoch_start_ts: u64,
        /// Schedule end time (matches with epoch start time i.e. on Monday)
        end_ts: u64,
        /// Reward per second for the whole schedule
        rps: u64,
        total_reward_amount: u64,
    }

    struct UserLastReward has store {
        /// Time when next schedule should start
        next_update_ts: u64,
        /// Last checkpointed reward per LP token
        index: u128,
    }

    struct UserInfo has store {
        /// Fungible asset store where user's tokens are staked
        staked_fa_store: Object<FungibleStore>,
        /// Amount of tokens staked
        amount: u64,
        /// Last reward info
        last_reward_info: Option<UserLastReward>,
        /// The last time user claimed rewards
        last_claim_time: u64,
    }

    struct RewardInfo has store {
        /// Last checkpointed reward per LP token
        index: u128,
        /// Orphaned rewards might appear between the time when pool
        /// gets incentivized and the time when first user stakes
        orphaned: u64,
        /// Reward tokens per second for the whole pool
        rps: u64,
        /// Time when next schedule should start
        next_update_ts: u64,
    }

    /// Global per contract
    struct StakePool has key {
        /// fungible asset stakers are staking
        staked_fa_metadata_object: Object<Metadata>,
        /// fungible asset reward is paid in
        reward_fa_metadata_object: Object<Metadata>,
        reward_store: Object<FungibleStore>,
        /// key is staker address, value is stake data
        user_stakes: Table<address, UserInfo>,
        /// total stake in the contract
        total_stakes: u64,
        /// Last time when reward index was updated
        last_update_ts: u64,
        /// Current reward schedule
        current_reward: Option<RewardInfo>,
        /// key is schedule end point, value is reward per second for that schedule
        live_reward_schedules: SimpleMap<u64, u64>,
        /// key is deregistration timestamp, value is reward index
        finished_reward_indexes: SimpleMap<u64, u128>,
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

    /// Global per contract
    struct RewardStoreController has key {
        extend_ref: ExtendRef,
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
            total_stakes: 0,
            last_update_ts: 0,
            current_reward: option::none(),
            live_reward_schedules: simple_map::new(),
            finished_reward_indexes: simple_map::new(),
        });
    }

    // ================================= Entry Functions ================================= //

    /// Set pending admin of the contract, then pending admin can call accept_admin to become admin
    public entry fun set_pending_admin(sender: &signer, new_admin: address) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@staking_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_SET_PENDING_ADMIN);
        config.pending_admin = option::some(new_admin);
    }

    /// Accept admin of the contract
    public entry fun accept_admin(sender: &signer) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@staking_addr);
        assert!(config.pending_admin == option::some(sender_addr), ENOT_PENDING_ADMIN);
        config.admin = sender_addr;
        config.pending_admin = option::none();
    }

    /// Only reward creator can create new reward schedule
    public entry fun create_new_reward_schedule(
        sender: &signer,
        new_schedule_rps: u64,
        // in weeks
        new_schedule_duration_periods: u64
    ) acquires Config, StakePool {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global<Config>(@staking_addr);
        assert!(config.reward_creator == sender_addr, EONLY_REWARD_CREATOR_CAN_ADD_REWARD);

        let stake_pool = borrow_global_mut<StakePool>(@staking_addr);
        update_existing_reward(stake_pool);

        let new_schedule = convert_to_reward_schedule(new_schedule_duration_periods, new_schedule_rps);
        create_new_reward_schedule_internal(stake_pool, new_schedule);

        assert!(
            primary_fungible_store::balance(
                sender_addr,
                stake_pool.reward_fa_metadata_object
            ) >= new_schedule.total_reward_amount,
            ENOT_ENOUGH_BALANCE_TO_ADD_REWARD
        );
        fungible_asset::transfer(
            sender,
            primary_fungible_store::primary_store(sender_addr, stake_pool.reward_fa_metadata_object),
            stake_pool.reward_store,
            new_schedule.total_reward_amount
        );
    }

    public entry fun claim_reward(sender: &signer) acquires StakePool, RewardStoreController {
        let sender_addr = signer::address_of(sender);
        let stake_pool = borrow_global_mut<StakePool>(@staking_addr);
        assert!(table::contains(&stake_pool.user_stakes, sender_addr), EUSER_DOESN_NOT_HAVE_STAKE);
        let user_info = table::borrow_mut(&mut stake_pool.user_stakes, sender_addr);

        update_existing_reward(stake_pool);

        claim_reward_internal(stake_pool, sender_addr, user_info);
        reset_user_index(stake_pool, user_info);
        update_and_sync_positions(stake_pool, user_info);
    }

    public entry fun stake(sender: &signer, amount: u64) acquires StakePool, RewardStoreController {
        let sender_addr = signer::address_of(sender);
        let staked_fa_metadata_object = get_staked_fa_metadata_object();
        assert!(
            primary_fungible_store::balance(sender_addr, staked_fa_metadata_object) >= amount,
            ENOT_ENOUGH_BALANCE_TO_STAKE
        );

        let stake_pool = borrow_global_mut<StakePool>(@staking_addr);
        let user_stakes = &mut stake_pool.user_stakes;
        let user_info = table::borrow_mut(&mut stake_pool.user_stakes, sender_addr);

        if (table::contains(user_stakes, sender_addr)) {
            let user_info = table::borrow(user_stakes, sender_addr);
            fungible_asset::transfer(
                sender,
                primary_fungible_store::primary_store(sender_addr, staked_fa_metadata_object),
                user_info.staked_fa_store,
                amount
            );
        } else {
            let fungible_store_object_constructor_ref = &object::create_object(sender_addr);
            let fungible_store = fungible_asset::create_store(
                fungible_store_object_constructor_ref,
                staked_fa_metadata_object
            );
            fungible_asset::transfer(
                sender,
                primary_fungible_store::primary_store(sender_addr, staked_fa_metadata_object),
                fungible_store,
                amount
            );
            table::add(user_stakes, sender_addr, UserInfo {
                staked_fa_store: fungible_store,
                amount: 0,
                last_reward_info: option::none(),
                last_claim_time: timestamp::now_seconds(),
            });
        };

        update_existing_reward(stake_pool);

        claim_reward_internal(stake_pool, sender_addr, user_info);
        reset_user_index(stake_pool, user_info);

        stake_pool.total_stakes = stake_pool.total_stakes + amount;
        user_info.amount = user_info.amount + amount;
        update_and_sync_positions(stake_pool, user_info);
    }

    public entry fun unstake(sender: &signer, amount: u64) acquires StakePool, RewardStoreController {
        let sender_addr = signer::address_of(sender);
        let staked_fa_metadata_object = get_staked_fa_metadata_object();

        let stake_pool = borrow_global_mut<StakePool>(@staking_addr);
        let user_stakes = &mut stake_pool.user_stakes;
        assert!(table::contains(user_stakes, sender_addr), EUSER_DOESN_NOT_HAVE_STAKE);

        let user_info = table::borrow_mut(user_stakes, sender_addr);
        assert!(fungible_asset::balance(user_info.staked_fa_store) >= amount, ENOT_ENOUGH_BALANCE_TO_UNSTAKE);

        fungible_asset::transfer(
            sender,
            user_info.staked_fa_store,
            primary_fungible_store::primary_store(sender_addr, staked_fa_metadata_object),
            amount
        );

        update_existing_reward(stake_pool);

        claim_reward_internal(stake_pool, sender_addr, user_info);
        reset_user_index(stake_pool, user_info);

        stake_pool.total_stakes = stake_pool.total_stakes - amount;
        user_info.amount = user_info.amount - amount;
        update_and_sync_positions(stake_pool, user_info);

        if (user_info.amount == 0) {
            table::remove(user_stakes, sender_addr);
        };
    }

    // ================================= View Functions ================================= //

    #[view]
    public fun get_staked_fa_metadata_object(): Object<Metadata> acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@staking_addr);
        stake_pool.staked_fa_metadata_object
    }

    #[view]
    public fun get_staked_balance(user_addr: address): u64 acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@staking_addr);
        if (table::contains(&stake_pool.user_stakes, user_addr)) {
            let fungible_store = table::borrow(&stake_pool.user_stakes, user_addr).staked_fa_store;
            fungible_asset::balance(fungible_store)
        } else {
            0
        }
    }

    #[view]
    public fun get_total_stake(): u64 acquires StakePool {
        borrow_global<StakePool>(@staking_addr).total_stakes
    }

    #[view]
    public fun calculate_staker_reward(user_addr: address): (u64, u64) acquires StakePool {
        let stake_pool = borrow_global<StakePool>(@staking_addr);
        let user_info = table::borrow(&stake_pool.user_stakes, user_addr);
        let finished_reward = calculate_staker_finished_reward(stake_pool, user_info);
        let new_reward = calculate_staker_new_reward(stake_pool, user_info);
        (finished_reward, new_reward)
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

    fun convert_to_reward_schedule(duration_periods: u64, rps: u64): RewardSchedule {
        assert!(duration_periods > 0 && duration_periods <= MAX_PERIODS, EINVALID_DURATION_LENGTH);
        assert!(rps > 0, EREWARD_PER_SECOND_MUST_NOT_BE_ZERO);

        let block_ts = timestamp::now_seconds();
        let rem = block_ts % EPOCHS_START;
        let next_epoch_start_ts = if (rem % EPOCH_LENGTH == 0) {
            // Hit at the beginning of the current epoch
            block_ts
        } else {
            // Hit somewhere in the middle.
            // Partially distribute rewards for the current epoch and add input.duration_periods periods more
            EPOCHS_START + (rem / EPOCH_LENGTH + 1) * EPOCH_LENGTH
        };
        let end_ts = next_epoch_start_ts + duration_periods * EPOCH_LENGTH;
        let total_reward_amount = (end_ts - block_ts) * rps;

        RewardSchedule {
            next_epoch_start_ts,
            end_ts,
            rps,
            total_reward_amount,
        }
    }

    /// update reward index according to the amount of LP tokens staked and rewards per second.
    /// If multiple schedules for a specific reward passed since the last update, aggregate all rewards.
    /// Move to the next schedule if it's time to do so or remove reward from pool info if there are no more schedules left.
    fun update_existing_reward(stake_pool: &mut StakePool) {
        let block_ts = timestamp::now_seconds();
        let time_passed = block_ts - stake_pool.last_update_ts;
        if (time_passed == 0 || option::is_none(&stake_pool.current_reward)) {
            return;
        };

        let need_remove = false;
        let collected_rewards = 0;
        let time_passed_inner = time_passed;

        let reward_info = option::borrow_mut(&mut stake_pool.current_reward);
        let next_update_ts = reward_info.next_update_ts;

        // time to move to next schedule
        if (next_update_ts <= block_ts) {
            collected_rewards = collected_rewards + reward_info.rps * (next_update_ts - stake_pool.last_update_ts);

            // find which passed schedules should be processed
            let schedules = &vector::filter(
                simple_map::keys(&stake_pool.live_reward_schedules),
                |ts| *ts > next_update_ts
            );

            for (idx in 0..vector::length(schedules)) {
                let update_ts = *vector::borrow(schedules, idx);
                // we found a schedule which should be active now
                if (update_ts > block_ts) {
                    reward_info.rps = *simple_map::borrow(&stake_pool.live_reward_schedules, &update_ts);
                    reward_info.next_update_ts = update_ts;
                    time_passed_inner = block_ts - next_update_ts;
                    next_update_ts = update_ts;
                    break;
                } else {
                    collected_rewards = collected_rewards + *simple_map::borrow(
                        &stake_pool.live_reward_schedules,
                        &update_ts
                    ) * (update_ts - next_update_ts);
                    next_update_ts = update_ts;
                };
            };

            // there is neither active schedule nor upcoming schedule
            if (next_update_ts <= block_ts) {
                need_remove = true;
                reward_info.rps = 0;
            }
        };

        collected_rewards = collected_rewards + reward_info.rps * time_passed_inner;

        if (stake_pool.total_stakes == 0) {
            reward_info.orphaned = reward_info.orphaned + collected_rewards;
        } else {
            // allowing the first depositor to claim orphaned rewards
            reward_info.index = reward_info.index + (reward_info.orphaned as u128) + (collected_rewards as u128) / (stake_pool.total_stakes as u128);
            reward_info.orphaned = 0;
        };

        if (need_remove) {
            stake_pool.current_reward = option::none();
        };
        stake_pool.last_update_ts = timestamp::now_seconds();
    }

    /// Update or create new reward schedule.
    /// Complexity O(n), where n is number of schedules that new schedule intersects.
    /// The idea is to walk through all schedules and increase them by new reward per second.
    ///
    /// ## Algorithm description
    /// New schedule (start_x, end_x, rps_x).
    /// Schedule always takes effect from the current block.
    /// rps - rewards per second
    ///
    /// Reward in PoolInfo contains schedule (start_s, rps_s). start_s is point when the next schedule should be picked up.
    ///   - Add rps_x to current active rps_s;
    ///   - Fetch all schedules from EXTERNAL_REWARD_SCHEDULES (array of pairs (end_s, rps_s)) where end_s > start_x;
    ///   - If end_s >= end_x then new schedule is fully covered by the first one. Set point (end_x, rps_s + rps_x);
    ///   - Otherwise loop over all schedules and update them until end_s >= end_x or until all schedules passed.
    fun create_new_reward_schedule_internal(stake_pool: &mut StakePool, new_schedule: RewardSchedule) {
        if (option::is_none(&stake_pool.current_reward)) {
            stake_pool.current_reward = option::some(RewardInfo {
                index: 0,
                orphaned: 0,
                rps: new_schedule.rps,
                next_update_ts: new_schedule.end_ts,
            });
            return;
        };

        let active_schedule = option::borrow_mut(&mut stake_pool.current_reward);
        let next_update_ts = active_schedule.next_update_ts;
        let to_save = &mut vector[];

        if (next_update_ts >= new_schedule.end_ts) {
            if (next_update_ts > new_schedule.end_ts) {
                vector::push_back(to_save, (next_update_ts, active_schedule.rps));
            };
            active_schedule.next_update_ts = new_schedule.end_ts;
        } else {
            let overlapping_schedules = &vector::filter(
                simple_map::keys(&stake_pool.live_reward_schedules),
                |ts| *ts > new_schedule.next_epoch_start_ts
            );
            // Add rps to next overlapping schedules.
            for (idx in 0..vector::length(overlapping_schedules)) {
                let end_ts = *vector::borrow(overlapping_schedules, idx);
                if (end_ts >= new_schedule.end_ts) {
                    vector::push_back(
                        to_save,
                        (new_schedule.end_ts, *simple_map::borrow(
                            &stake_pool.live_reward_schedules,
                            &end_ts
                        ) + new_schedule.rps)
                    );
                    break;
                } else {
                    vector::push_back(
                        to_save,
                        (end_ts, *simple_map::borrow(
                            &stake_pool.live_reward_schedules,
                            &end_ts
                        ) + new_schedule.rps)
                    );
                }
            };
            vector::push_back(to_save, (new_schedule.end_ts, new_schedule.rps));
        };

        // TODO: test do we need to empty all schedules then add to_save?
        for (idx in 0..vector::length(to_save)) {
            let (schedule_end_ts, reward_per_second) = *vector::borrow(to_save, idx);
            simple_map::upsert(&mut stake_pool.live_reward_schedules, schedule_end_ts, reward_per_second);
        };

        // New schedule anyway hits an active one
        active_schedule.rps = active_schedule.rps + new_schedule.rps;
    }

    /// This function calculates all outstanding rewards from finished schedules for a specific user position.
    /// The idea is as follows:
    /// - get all finished rewards from FINISHED_REWARDS_INDEXES which were deregistered after last claim time
    /// - merge them with rewards_to_remove
    /// - iterate over all user indexes and find differences. If user doesn't have index for deregistered reward then
    /// they never claimed it and their index defaults to 0.
    fun calculate_staker_finished_reward(stake_pool: &StakePool, user_info: &UserInfo): u64 {
        let finished_reward_indexes = &vector::filter(
            simple_map::keys(&stake_pool.finished_reward_indexes),
            |ts| *ts > user_info.last_claim_time
        );

        let amount = 0;
        for (idx in 0..vector::length(finished_reward_indexes)) {
            let finished_index = *simple_map::borrow(
                &stake_pool.finished_reward_indexes,
                vector::borrow(finished_reward_indexes, idx)
            );
            let user_reward_index = if (option::is_some(&user_info.last_reward_info)) {
                option::borrow(&user_info.last_reward_info).index
            } else {
                0
            };
            if (idx == 0) {
                amount = amount + ((finished_index - user_reward_index) as u64) * user_info.amount;
            } else {
                // Subsequent finished schedules consider user never claimed rewards
                // thus their index was 0
                amount = amount + (finished_index as u64) * user_info.amount;
            }
        };
        amount
    }

    /// This function is tightly coupled with [`UserInfo`] structure. It iterates over all user's
    /// reward indexes and tries to find the one that matches current reward info. If found, it
    /// calculates the reward amount.
    /// Otherwise it assumes user never claimed this particular reward and their reward index is 0.
    /// Their position will be synced with pool indexes later on.
    fun calculate_staker_new_reward(stake_pool: &StakePool, user_info: &UserInfo): u64 {
        if (option::is_none(&stake_pool.current_reward)) {
            0
        } else {
            let current_reward= option::borrow(&stake_pool.current_reward);
            if (option::is_some(&user_info.last_reward_info)) {
                let last_reward_info = option::borrow(&user_info.last_reward_info);
                if (last_reward_info.index > current_reward.index) {
                    (current_reward.index * (user_info.amount as u128) as u64)
                } else {
                    ((current_reward.index - last_reward_info.index) * (user_info.amount as u128) as u64)
                }
            } else {
                (current_reward.index * (user_info.amount as u128) as u64)
            }
        }
    }

    fun claim_reward_internal(stake_pool: &StakePool, user_addr: address, user_info: &UserInfo) acquires RewardStoreController {
        let finished_reward = calculate_staker_finished_reward(stake_pool, user_info);
        let new_reward = calculate_staker_new_reward(stake_pool, user_info);
        fungible_asset::transfer(
            &object::generate_signer_for_extending(&borrow_global<RewardStoreController>(@staking_addr).extend_ref),
            stake_pool.reward_store,
            primary_fungible_store::primary_store(user_addr, stake_pool.reward_fa_metadata_object),
            finished_reward + new_reward
        );
    }

    /// Reset user index for all finished rewards.
    /// This function is called after processing finished schedules and before processing active
    /// schedules for a specific user.
    /// The idea is as follows:
    /// - get all finished rewards from FINISHED_REWARDS_INDEXES which finished after last time when user claimed rewards
    /// - merge them with rewards_to_remove
    /// - iterate over all finished rewards and set user index to 0.
    fun reset_user_index(stake_pool: &mut StakePool, user_info: &mut UserInfo) {
        let finished_reward = vector::filter(
            simple_map::keys(&stake_pool.finished_reward_indexes),
            |ts| *ts > user_info.last_claim_time
        );
        if (vector::length(&finished_reward) == 0) {
            return;
        };
        if (option::is_some(&user_info.last_reward_info)) {
            let user_reward = option::borrow_mut(&mut user_info.last_reward_info);
            user_reward.index = 0;
        }
    }

    /// Add/remove LP tokens from user position and pool info.
    /// Sync reward indexes and set last claim time.
    fun update_and_sync_positions(stake_pool: &mut StakePool, user_info: &mut UserInfo) {
        user_info.last_reward_info = if (option::is_some(&stake_pool.current_reward)) {
            option::some(UserLastReward {
                next_update_ts: option::borrow(&stake_pool.current_reward).next_update_ts,
                index: option::borrow(&stake_pool.current_reward).index,
            })
        } else {
            option::none()
        };
        user_info.last_claim_time = stake_pool.last_update_ts;
    }

    // ================================= Unit Tests ================================= //
}
