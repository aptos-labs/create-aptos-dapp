#[test_only]
module staking_addr::test_end_to_end {
    use std::signer;
    use staking_addr::staking2;

    #[test(aptos_framework = @0x1, sender = @staking_addr, initial_reward_creator = @0x100, staker1 = @0x101, staker2 = @0x102)]
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

        staking2::init_module_for_test(aptos_framework, sender, initial_reward_creator, staker1, staker2);
    }
}
