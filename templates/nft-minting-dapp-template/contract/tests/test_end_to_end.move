#[test_only]
module launchpad_addr::test_end_to_end {
    use std::option;
    use std::signer;
    use std::string;
    use std::vector;

    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_framework::timestamp;

    use aptos_token_objects::collection;

    use launchpad_addr::launchpad;

    /// Category for allowlist mint stage
    const ALLOWLIST_MINT_STAGE_CATEGORY: vector<u8> = b"Allowlist mint stage";
    /// Category for public mint stage
    const PUBLIC_MINT_MINT_STAGE_CATEGORY: vector<u8> = b"Public mint stage";

    #[test(aptos_framework = @0x1, sender = @launchpad_addr, user1 = @0x200, user2 = @0x201)]
    fun test_happy_path(
        aptos_framework: &signer,
        sender: &signer,
        user1: &signer,
        user2: &signer,
    ) {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);

        // current timestamp is 0 after initialization
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(user1_addr);
        account::create_account_for_test(user2_addr);
        coin::register<AptosCoin>(user1);

        launchpad::init_module_for_test(sender);

        launchpad::create_collection(
            sender,
            string::utf8(b"description"),
            string::utf8(b"name"),
            string::utf8(b"https://gateway.irys.xyz/manifest_id/collection.json"),
            10,
            option::some(10),
            option::some(3),
            option::some(vector[user1_addr]),
            option::some(timestamp::now_seconds()),
            option::some(timestamp::now_seconds() + 100),
            option::some(3),
            option::some(5),
            option::some(timestamp::now_seconds() + 200),
            option::some(timestamp::now_seconds() + 300),
            option::some(2),
            option::some(10),
        );
        let registry = launchpad::get_registry();
        let collection_1 = *vector::borrow(&registry, vector::length(&registry) - 1);
        assert!(collection::count(collection_1) == option::some(3), 1);

        let mint_fee = launchpad::get_mint_fee(collection_1, string::utf8(ALLOWLIST_MINT_STAGE_CATEGORY), 1);
        aptos_coin::mint(aptos_framework, user1_addr, mint_fee);

        launchpad::mint_nft(user1, collection_1, 1);

        let active_or_next_stage = launchpad::get_active_or_next_mint_stage(collection_1);
        assert!(active_or_next_stage == option::some(string::utf8(ALLOWLIST_MINT_STAGE_CATEGORY)), 3);
        let (start_time, end_time) = launchpad::get_mint_stage_start_and_end_time(
            collection_1,
            string::utf8(ALLOWLIST_MINT_STAGE_CATEGORY)
        );
        assert!(start_time == 0, 4);
        assert!(end_time == 100, 5);

        // bump global timestamp to 150 so allowlist stage is over but public mint stage is not started yet
        timestamp::update_global_time_for_test_secs(150);
        let active_or_next_stage = launchpad::get_active_or_next_mint_stage(collection_1);
        assert!(active_or_next_stage == option::some(string::utf8(PUBLIC_MINT_MINT_STAGE_CATEGORY)), 6);
        let (start_time, end_time) = launchpad::get_mint_stage_start_and_end_time(
            collection_1,
            string::utf8(PUBLIC_MINT_MINT_STAGE_CATEGORY)
        );
        assert!(start_time == 200, 7);
        assert!(end_time == 300, 8);

        // bump global timestamp to 250 so public mint stage is active
        timestamp::update_global_time_for_test_secs(250);
        let active_or_next_stage = launchpad::get_active_or_next_mint_stage(collection_1);
        assert!(active_or_next_stage == option::some(string::utf8(PUBLIC_MINT_MINT_STAGE_CATEGORY)), 9);
        let (start_time, end_time) = launchpad::get_mint_stage_start_and_end_time(
            collection_1,
            string::utf8(PUBLIC_MINT_MINT_STAGE_CATEGORY)
        );
        assert!(start_time == 200, 10);
        assert!(end_time == 300, 11);

        // bump global timestamp to 350 so public mint stage is over
        timestamp::update_global_time_for_test_secs(350);
        let active_or_next_stage = launchpad::get_active_or_next_mint_stage(collection_1);
        assert!(active_or_next_stage == option::none(), 12);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, sender = @launchpad_addr, user1 = @0x200)]
    #[expected_failure(abort_code = 12, location = launchpad)]
    fun test_mint_disabled(
        aptos_framework: &signer,
        sender: &signer,
        user1: &signer,
    ) {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let user1_addr = signer::address_of(user1);

        // current timestamp is 0 after initialization
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(user1_addr);
        coin::register<AptosCoin>(user1);

        launchpad::init_module_for_test(sender);

        launchpad::create_collection(
            sender,
            string::utf8(b"description"),
            string::utf8(b"name"),
            string::utf8(b"https://gateway.irys.xyz/manifest_id/collection.json"),
            10,
            option::some(10),
            option::some(3),
            option::some(vector[user1_addr]),
            option::some(timestamp::now_seconds()),
            option::some(timestamp::now_seconds() + 100),
            option::some(3),
            option::some(5),
            option::some(timestamp::now_seconds() + 200),
            option::some(timestamp::now_seconds() + 300),
            option::some(2),
            option::some(10),
        );
        let registry = launchpad::get_registry();
        let collection_1 = *vector::borrow(&registry, vector::length(&registry) - 1);

        assert!(launchpad::is_mint_enabled(collection_1), 1);

        let mint_fee = launchpad::get_mint_fee(collection_1, string::utf8(ALLOWLIST_MINT_STAGE_CATEGORY), 1);
        aptos_coin::mint(aptos_framework, user1_addr, mint_fee);

        launchpad::mint_nft(user1, collection_1, 1);

        launchpad::update_mint_enabled(sender, collection_1, false);
        assert!(!launchpad::is_mint_enabled(collection_1), 2);

        launchpad::mint_nft(user1, collection_1, 1);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, sender = @launchpad_addr, user1 = @0x200, user2 = @0x201)]
    fun test_mint_stages_transition(
        aptos_framework: &signer,
        sender: &signer,
        user1: &signer,
        user2: &signer,
    ) {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);

        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(user1_addr);
        account::create_account_for_test(user2_addr);
        coin::register<AptosCoin>(user1);
        coin::register<AptosCoin>(user2);

        launchpad::init_module_for_test(sender);

        // Create collection with both allowlist and public stages
        launchpad::create_collection(
            sender,
            string::utf8(b"description"),
            string::utf8(b"name"),
            string::utf8(b"https://gateway.irys.xyz/manifest_id/collection.json"),
            10,
            option::some(10),
            option::some(0),
            option::some(vector[user1_addr]), // allowlist
            option::some(timestamp::now_seconds()),
            option::some(timestamp::now_seconds() + 100),
            option::some(2),
            option::some(10),
            option::some(timestamp::now_seconds() + 200), // public mint
            option::some(timestamp::now_seconds() + 300),
            option::some(3),
            option::some(20)
        );

        let registry = launchpad::get_registry();
        let collection = *vector::borrow(&registry, vector::length(&registry) - 1);

        // Test allowlist stage
        let mint_fee = launchpad::get_mint_fee(collection, string::utf8(ALLOWLIST_MINT_STAGE_CATEGORY), 1);
        aptos_coin::mint(aptos_framework, user1_addr, mint_fee);
        launchpad::mint_nft(user1, collection, 1);
        assert!(collection::count(collection) == option::some(1), 1);

        // Move to public stage
        timestamp::update_global_time_for_test_secs(250);
        let mint_fee = launchpad::get_mint_fee(collection, string::utf8(PUBLIC_MINT_MINT_STAGE_CATEGORY), 1);
        aptos_coin::mint(aptos_framework, user2_addr, mint_fee);
        launchpad::mint_nft(user2, collection, 1);
        assert!(collection::count(collection) == option::some(2), 2);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

        #[test(aptos_framework = @0x1, sender = @launchpad_addr, user1 = @0x200)]
    #[expected_failure(abort_code = 14, location = launchpad_addr::launchpad)]
    fun test_invalid_collection_uri(
        aptos_framework: &signer,
        sender: &signer,
        user1: &signer,
    ) {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let user1_addr = signer::address_of(user1);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(user1_addr);

        launchpad::init_module_for_test(sender);

        // Try to create collection with invalid URI (not ending in /collection.json)
        launchpad::create_collection(
            sender,
            string::utf8(b"description"),
            string::utf8(b"name"),
            string::utf8(b"https://gateway.irys.xyz/manifest_id/invalid.json"), // Invalid URI
            10,
            option::some(10),
            option::some(0),
            option::some(vector[user1_addr]),
            option::some(timestamp::now_seconds()),
            option::some(timestamp::now_seconds() + 100),
            option::some(2),
            option::some(10),
            option::some(timestamp::now_seconds() + 200),
            option::some(timestamp::now_seconds() + 300),
            option::some(3),
            option::some(20)
        );

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
