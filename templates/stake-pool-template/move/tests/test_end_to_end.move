#[test_only]
module stake_pool_addr::test_end_to_end {
    use std::option;
    use std::signer;
    use std::string;

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
        let _initial_reward_creator_addr = signer::address_of(initial_reward_creator);
        let staker1_addr = signer::address_of(staker1);
        let staker2_addr = signer::address_of(staker2);

        let rps = 100;
        let duration_seconds = 100;
        let staker1_stake_amount = 200;
        let staker2_stake_amount = 300;

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
        let stake_fa_metadata_obj = object::object_from_constructor_ref(stake_fa_obj_constructor_ref);
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
        let reward_fa_metadata_obj = object::object_from_constructor_ref(reward_fa_obj_constructor_ref);
        primary_fungible_store::mint(
            &fungible_asset::generate_mint_ref(reward_fa_obj_constructor_ref),
            signer::address_of(initial_reward_creator),
            rps * duration_seconds
        );

        stake_pool::init_module_for_test(
            aptos_framework,
            sender,
            initial_reward_creator,
            stake_fa_metadata_obj,
            reward_fa_metadata_obj,
        );

        stake_pool::create_reward_schedule(initial_reward_creator, rps, duration_seconds);
        /*
        at this point, global reward index is 0, last update ts is 0, rps is 10, start ts is 0, end ts is 100, total stake is 0
        */

        timestamp::update_global_time_for_test_secs(20);
        stake_pool::stake(staker1, 200);
        /*
        at this point, global reward index is 0, last update ts is 20, total stake is 200
        staker1 reward index is 0, last claim ts is 20, stake = 200
        */

        timestamp::update_global_time_for_test_secs(60);
        stake_pool::stake(staker2, 300,);
        /*
        at this point, global reward index is (60 - 20) * 100 / 200 = 20, last update ts is 60, total stake is 500
        staker1 reward index is 0, last claim ts is 20, stake = 200
        staker2 reward index is 20, last claim ts is 60, stake = 300
        */

        timestamp::update_global_time_for_test_secs(80);
        stake_pool::unstake(staker1, option::some(100));
        /*
        at this point, global reward index is 2 + (80 - 60) * 100 / 500 = 24, last update ts 80, total stake is 400
        staker1 reward index is 24, last claim ts is 80, stake = 100, claimed reward = 200 * (24 - 0) = 4800
        staker2 reward index is 20, last claim ts is 60, stake = 300
        */

        timestamp::update_global_time_for_test_secs(100);

        timestamp::update_global_time_for_test_secs(150);

        stake_pool::claim_reward(staker1);
        /*
        at this point, global reward index is 24 + (100 - 80) * 100 / 400 = 29, last update ts 100, total stake is 400
        staker1 reward index is 29, last claim ts is 100, stake = 100, claimed reward = 100 * (29 - 24) = 500
        staker2 reward index is 29, last claim ts is 100, stake = 300
        */
        stake_pool::claim_reward(staker2);
        /*
        at this point, global reward index is 29 + (100 - 100) * 10 /400 = 2.9, last update ts 100, total stake is 400
        staker1 reward index is 29, last claim ts is 100, stake = 100
        staker2 reward index is 29, last claim ts is 100, stake = 300, claimed reward = 300 * (29 - 20) = 2700
        */

        // let (
        //     user_staked_amount,
        //     userlast_claim_ts,
        //     user_index,
        // ) = staking2::get_user_stake_data(staker1_addr);
        // let claimable_reward = staking2::get_claimable_reward(staker1_addr);
        // debug::print(&string_utils::format1( &b"user_staked_amount: {}", user_staked_amount));
        // debug::print(&string_utils::format1( &b"userlast_claim_ts: {}", userlast_claim_ts));
        // debug::print(&string_utils::format1( &b"user_index: {}", user_index));
        // debug::print(&string_utils::format1( &b"claimable_reward: {}", claimable_reward));

        // let (
        //     reward_schedule_index,
        //     reward_schedule_rps,
        //     reward_schedule_last_update_ts,
        //     reward_schedule_start_ts,
        //     reward_schedule_end_ts
        // ) = staking2::get_reward_schedule();
        // debug::print(&string_utils::format1( &b"reward_schedule_index: {}", reward_schedule_index));
        // debug::print(&string_utils::format1( &b"reward_schedule_rps: {}", reward_schedule_rps));
        // debug::print(&string_utils::format1( &b"reward_schedule_last_update_ts: {}", reward_schedule_last_update_ts));
        // debug::print(&string_utils::format1( &b"reward_schedule_start_ts: {}", reward_schedule_start_ts));
        // debug::print(&string_utils::format1( &b"reward_schedule_end_ts: {}", reward_schedule_end_ts));

        let staker1_reward_balance = primary_fungible_store::balance(staker1_addr, reward_fa_metadata_obj);
        assert!(staker1_reward_balance == 5300, staker1_reward_balance);
        let staker2_reward_balance = primary_fungible_store::balance(staker2_addr, reward_fa_metadata_obj);
        assert!(staker2_reward_balance == 2700, staker2_reward_balance);
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

        let rps = 4;
        let duration_seconds = 100;
        let staker1_stake_amount = 200;
        let staker2_stake_amount = 200;

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
            initial_reward_creator,
            fa_metadata_object,
            fa_metadata_object,
        );

        stake_pool::create_reward_schedule(initial_reward_creator, rps, duration_seconds);
        stake_pool::stake(staker1, 200);
        stake_pool::stake(staker2, 200);

        timestamp::update_global_time_for_test_secs(50);
        stake_pool::compound(staker1);

        timestamp::update_global_time_for_test_secs(100);
        stake_pool::unstake(staker1, option::none());
        stake_pool::unstake(staker2, option::none());

        let staker1_balance = primary_fungible_store::balance(staker1_addr, fa_metadata_object);
        assert!(staker1_balance == 419, staker1_balance); // not 420 because of the rounding
        let staker2_balance = primary_fungible_store::balance(staker2_addr, fa_metadata_object);
        assert!(staker2_balance == 379, staker2_balance); // not 380 because of the rounding
    }
}
