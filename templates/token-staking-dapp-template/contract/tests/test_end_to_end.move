#[test_only]
module stake_pool_addr::test_end_to_end {
    use std::option;
    use std::signer;
    use std::string;

    use aptos_std::debug;
    use aptos_std::string_utils;

    use aptos_framework::fungible_asset;
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::timestamp;

    use stake_pool_addr::stake_pool;

    #[test(
        aptos_framework = @0x1,
        sender = @stake_pool_addr,
        initial_reward_creator = @0x100,
        staker1 = @0x101,
        staker2 = @0x102
    )]
    fun test_happy_path(
        aptos_framework: &signer,
        sender: &signer,
        initial_reward_creator: &signer,
        staker1: &signer,
        staker2: &signer,
    ) {
        let sender_addr = signer::address_of(sender);
        let initial_reward_creator_addr = signer::address_of(initial_reward_creator);
        let staker1_addr = signer::address_of(staker1);
        let staker2_addr = signer::address_of(staker2);

        let rps = 100;
        let duration_seconds = 100;
        let staker1_stake_amount = 20000;
        let staker2_stake_amount = 30000;

        let fa_obj_constructor_ref = &object::create_sticky_object(sender_addr);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            fa_obj_constructor_ref,
            option::none(),
            string::utf8(b"Test FA for staking"),
            string::utf8(b"TFAS"),
            8,
            string::utf8(b"url"),
            string::utf8(b"url"),
        );
        let fa_metadata_object = object::object_from_constructor_ref(fa_obj_constructor_ref);
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            signer::address_of(staker1),
            staker1_stake_amount
        );
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            signer::address_of(staker2),
            staker2_stake_amount
        );
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            signer::address_of(initial_reward_creator),
            rps * duration_seconds
        );

        stake_pool::init_module_for_test(
            aptos_framework,
            sender,
            initial_reward_creator_addr,
            fa_metadata_object,
        );

        stake_pool::create_reward_schedule(initial_reward_creator, rps, duration_seconds);
        /*
        at this point, global reward index is 0, last update ts is 0, rps is 1, start ts is 0, end ts is 100, total stake is 0
        */

        timestamp::update_global_time_for_test_secs(20);
        stake_pool::stake(staker1, 20000);
        /*
        at this point, global reward index is 0, last update ts is 20, total stake is 20099
        staker1 reward index is 0, last claim ts is 20, stake = 20000
        */

        timestamp::update_global_time_for_test_secs(60);
        stake_pool::stake(staker2, 30000);
        /*
        at this point, global reward index is (60 - 20) * 100 / 200 = 20, last update ts is 60, total stake is 50000
        staker1 reward index is 0, last claim ts is 20, stake = 20000
        staker2 reward index is 20, last claim ts is 60, stake = 30000
        */

        timestamp::update_global_time_for_test_secs(80);
        stake_pool::unstake(staker1, option::some(10000));
        /*
        at this point, global reward index is 20 + (80 - 60) * 100 / 500 = 24, last update ts 80, total stake is 40000
        staker1 reward index is 24, last claim ts is 80, stake = 10000, claimed reward = 200 * (24 - 0) = 4800
        staker2 reward index is 20, last claim ts is 60, stake = 30000
        */

        timestamp::update_global_time_for_test_secs(150);

        {
            let (_, _, _, unique_stakers) = stake_pool::get_stake_pool_data();
            assert!(unique_stakers == 2, unique_stakers);
        };

        let (
            user_staked_amount,
            userlast_claim_ts,
            user_index,
        ) = stake_pool::get_user_stake_data(staker1_addr);
        let claimable_reward = stake_pool::get_claimable_reward(staker1_addr);
        debug::print(&string_utils::format1(&b"user_staked_amount: {}", user_staked_amount));
        debug::print(&string_utils::format1(&b"userlast_claim_ts: {}", userlast_claim_ts));
        debug::print(&string_utils::format1(&b"user_index: {}", user_index));
        debug::print(&string_utils::format1(&b"claimable_reward: {}", claimable_reward));

        stake_pool::unstake(staker1, option::none());
        /*
        at this point, global reward index is 24 + (100 - 80) * 100 / 400 = 29, last update ts 100, total stake is 40000
        staker1 reward index is 29, last claim ts is 100, stake = 10000, claimed reward = 100 * (29 - 24) = 500
        staker2 reward index is 20, last claim ts is 60, stake = 30000
        */
        stake_pool::unstake(staker2, option::none());
        /*
        at this point, global reward index is 29 + (100 - 100) * 100 / 400 = 29, last update ts 100, total stake is 40000
        staker1 reward index is 29, last claim ts is 100, stake = 10000
        staker2 reward index is 29, last claim ts is 100, stake = 30000, claimed reward = 30000 * (29 - 20) = 2700
        */

        {
            let (_, _, _, unique_stakers) = stake_pool::get_stake_pool_data();
            assert!(unique_stakers == 0, unique_stakers);
        };

        let (
            reward_schedule_index,
            reward_schedule_rps,
            reward_schedule_last_update_ts,
            reward_schedule_start_ts,
            reward_schedule_end_ts
        ) = stake_pool::get_reward_schedule();
        debug::print(&string_utils::format1(&b"reward_schedule_index: {}", reward_schedule_index));
        debug::print(&string_utils::format1(&b"reward_schedule_rps: {}", reward_schedule_rps));
        debug::print(&string_utils::format1(&b"reward_schedule_last_update_ts: {}", reward_schedule_last_update_ts));
        debug::print(&string_utils::format1(&b"reward_schedule_start_ts: {}", reward_schedule_start_ts));
        debug::print(&string_utils::format1(&b"reward_schedule_end_ts: {}", reward_schedule_end_ts));

        let staker1_reward_balance = primary_fungible_store::balance(staker1_addr, fa_metadata_object);
        assert!(staker1_reward_balance == 25298, staker1_reward_balance); // not 25300 because of the rounding
        let staker2_reward_balance = primary_fungible_store::balance(staker2_addr, fa_metadata_object);
        assert!(staker2_reward_balance == 32699, staker2_reward_balance); // not 32700 because of the rounding
    }

    #[test(
        aptos_framework = @0x1,
        sender = @stake_pool_addr,
        initial_reward_creator = @0x100,
        staker1 = @0x101,
        staker2 = @0x102
    )]
    fun test_compound(
        aptos_framework: &signer,
        sender: &signer,
        initial_reward_creator: &signer,
        staker1: &signer,
        staker2: &signer,
    ) {
        let sender_addr = signer::address_of(sender);
        let initial_reward_creator_addr = signer::address_of(initial_reward_creator);
        let staker1_addr = signer::address_of(staker1);
        let staker2_addr = signer::address_of(staker2);

        let rps = 400;
        let duration_seconds = 100;
        let staker1_stake_amount = 20000;
        let staker2_stake_amount = 20000;

        let fa_obj_constructor_ref = &object::create_sticky_object(sender_addr);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            fa_obj_constructor_ref,
            option::none(),
            string::utf8(b"Test FA"),
            string::utf8(b"TFA"),
            8,
            string::utf8(b"url"),
            string::utf8(b"url"),
        );
        let fa_metadata_object = object::object_from_constructor_ref(fa_obj_constructor_ref);
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            signer::address_of(staker1),
            staker1_stake_amount
        );
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            signer::address_of(staker2),
            staker2_stake_amount
        );
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            initial_reward_creator_addr,
            rps * duration_seconds
        );

        stake_pool::init_module_for_test(
            aptos_framework,
            sender,
            initial_reward_creator_addr,
            fa_metadata_object,
        );

        stake_pool::create_reward_schedule(initial_reward_creator, rps, duration_seconds);
        stake_pool::stake(staker1, 20000);
        stake_pool::stake(staker2, 20000);

        timestamp::update_global_time_for_test_secs(50);
        stake_pool::compound(staker1);

        timestamp::update_global_time_for_test_secs(100);
        stake_pool::unstake(staker1, option::none());
        stake_pool::unstake(staker2, option::none());

        let staker1_balance = primary_fungible_store::balance(staker1_addr, fa_metadata_object);
        assert!(staker1_balance == 41999, staker1_balance); // not 42000 because of the rounding
        let staker2_balance = primary_fungible_store::balance(staker2_addr, fa_metadata_object);
        assert!(staker2_balance == 37999, staker2_balance); // not 38000 because of the rounding
    }

    #[test(
        aptos_framework = @0x1,
        sender = @stake_pool_addr,
        initial_reward_creator = @0x100,
        staker1 = @0x101,
    )]
    #[expected_failure(abort_code = 10, location = stake_pool)]
    fun test_zero_stake(
        aptos_framework: &signer,
        sender: &signer,
        initial_reward_creator: &signer,
        staker1: &signer,
    ) {
        let sender_addr = signer::address_of(sender);
        let initial_reward_creator_addr = signer::address_of(initial_reward_creator);

        let rps = 400;
        let duration_seconds = 100;
        let staker1_stake_amount = 0;
        let fa_obj_constructor_ref = &object::create_sticky_object(sender_addr);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            fa_obj_constructor_ref,
            option::none(),
            string::utf8(b"Test FA"),
            string::utf8(b"TFA"),
            8,
            string::utf8(b"url"),
            string::utf8(b"url"),
        );
        let fa_metadata_object = object::object_from_constructor_ref(fa_obj_constructor_ref);
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            signer::address_of(staker1),
            staker1_stake_amount
        );
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            initial_reward_creator_addr,
            rps * duration_seconds
        );

        stake_pool::init_module_for_test(
            aptos_framework,
            sender,
            initial_reward_creator_addr,
            fa_metadata_object,
        );

        stake_pool::create_reward_schedule(initial_reward_creator, rps, duration_seconds);
        stake_pool::stake(staker1, 0);
    }

    #[test(
        aptos_framework = @0x1,
        sender = @stake_pool_addr,
        initial_reward_creator = @0x100,
        staker1 = @0x101,
    )]
    #[expected_failure(abort_code = 10, location = stake_pool)]
    fun test_zero_unstake(
        aptos_framework: &signer,
        sender: &signer,
        initial_reward_creator: &signer,
        staker1: &signer,
    ) {
        let sender_addr = signer::address_of(sender);
        let initial_reward_creator_addr = signer::address_of(initial_reward_creator);

        let rps = 400;
        let duration_seconds = 100;
        let staker1_stake_amount = 100;
        let fa_obj_constructor_ref = &object::create_sticky_object(sender_addr);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            fa_obj_constructor_ref,
            option::none(),
            string::utf8(b"Test FA"),
            string::utf8(b"TFA"),
            8,
            string::utf8(b"url"),
            string::utf8(b"url"),
        );
        let fa_metadata_object = object::object_from_constructor_ref(fa_obj_constructor_ref);
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            signer::address_of(staker1),
            staker1_stake_amount
        );
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            initial_reward_creator_addr,
            rps * duration_seconds
        );

        stake_pool::init_module_for_test(
            aptos_framework,
            sender,
            initial_reward_creator_addr,
            fa_metadata_object,
        );

        stake_pool::create_reward_schedule(initial_reward_creator, rps, duration_seconds);
        stake_pool::stake(staker1, staker1_stake_amount);
        timestamp::update_global_time_for_test_secs(50);
        stake_pool::unstake(staker1, option::some(0));
    }

    #[test(
        aptos_framework = @0x1,
        sender = @stake_pool_addr,
        initial_reward_creator = @0x100,
        staker1 = @0x101,
    )]
    #[expected_failure(abort_code = 11, location = stake_pool)]
    fun test_stake_after_reward_schedule_has_finished(
        aptos_framework: &signer,
        sender: &signer,
        initial_reward_creator: &signer,
        staker1: &signer,
    ) {
        let sender_addr = signer::address_of(sender);
        let initial_reward_creator_addr = signer::address_of(initial_reward_creator);

        let rps = 400;
        let duration_seconds = 100;
        let staker1_stake_amount = 0;
        let fa_obj_constructor_ref = &object::create_sticky_object(sender_addr);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            fa_obj_constructor_ref,
            option::none(),
            string::utf8(b"Test FA"),
            string::utf8(b"TFA"),
            8,
            string::utf8(b"url"),
            string::utf8(b"url"),
        );
        let fa_metadata_object = object::object_from_constructor_ref(fa_obj_constructor_ref);
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            signer::address_of(staker1),
            staker1_stake_amount
        );
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(fa_obj_constructor_ref),
            initial_reward_creator_addr,
            rps * duration_seconds
        );

        stake_pool::init_module_for_test(
            aptos_framework,
            sender,
            initial_reward_creator_addr,
            fa_metadata_object,
        );

        stake_pool::create_reward_schedule(initial_reward_creator, rps, duration_seconds);
        timestamp::update_global_time_for_test_secs(101);
        stake_pool::stake(staker1, 10);
    }
}
