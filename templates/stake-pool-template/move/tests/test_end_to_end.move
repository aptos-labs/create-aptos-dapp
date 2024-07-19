#[test_only]
module stake_pool_addr::test_end_to_end {
    use std::signer;

    use aptos_std::debug;
    use aptos_std::string_utils;

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
        let reward_amount = 1000;
        let staker1_stake_amount = 200;
        let staker2_stake_amount = 300;
        stake_pool::init_module_for_test(
            aptos_framework,
            sender,
            initial_reward_creator,
            staker1,
            staker2,
            reward_amount,
            staker1_stake_amount,
            staker2_stake_amount
        );

        let sender_addr = signer::address_of(sender);
        let initial_reward_creator_addr = signer::address_of(initial_reward_creator);
        let staker1_addr = signer::address_of(staker1);
        let staker2_addr = signer::address_of(staker2);

        let (_, reward_fa_metadata_object, _, _) = stake_pool::get_stake_pool_data();

        stake_pool::create_reward_schedule(initial_reward_creator, 10, 100);

        timestamp::update_global_time_for_test_secs(20);
        stake_pool::stake(staker1, 200);

        // staking2::claim_reward(staker1);
        // staking2::claim_reward(staker2);

        timestamp::update_global_time_for_test_secs(60);
        stake_pool::stake(staker2, 300);

        // staking2::claim_reward(staker1);
        // staking2::claim_reward(staker2);

        timestamp::update_global_time_for_test_secs(80);

        // staking2::claim_reward(staker1);
        // staking2::claim_reward(staker2);

        stake_pool::unstake(staker1, 100);

        // staking2::claim_reward(staker1);
        // staking2::claim_reward(staker2);

        timestamp::update_global_time_for_test_secs(100);

        stake_pool::claim_reward(staker1);
        stake_pool::claim_reward(staker2);

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

        let (_, _, _, total_stakes) = stake_pool::get_stake_pool_data();
        debug::print(&string_utils::format1(&b"total_stakes: {}", total_stakes));

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

        let staker1_reward_balance = primary_fungible_store::balance(staker1_addr, reward_fa_metadata_object);
        assert!(staker1_reward_balance == 529, staker1_reward_balance); // 529 = 400 + 80 + 50
        let staker2_reward_balance = primary_fungible_store::balance(staker2_addr, reward_fa_metadata_object);
        assert!(staker2_reward_balance == 269, staker2_reward_balance); // 269 = 120 + 150
    }
}
