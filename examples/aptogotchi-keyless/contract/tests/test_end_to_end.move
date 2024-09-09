#[test_only]
module aptogotchi_addr::test_end_to_end {
    use std::signer;
    use std::string;

    use aptogotchi_addr::aptogotchi;

    const ENERGY_UPPER_BOUND: u64 = 10;

    // Test creating an Aptogotchi
    #[test(aptos_framework = @0x1, deployer = @aptogotchi_addr, user = @0x123)]
    fun test_create_aptogotchi(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer
    ) {
        aptogotchi::init_module_for_test(aptos_framework, deployer, user);

        aptogotchi::create_aptogotchi(user, string::utf8(b"test"), 1, 1, 1);

        let has_aptogotchi = aptogotchi::has_aptogotchi(signer::address_of(user));
        assert!(has_aptogotchi, 1);
    }

    // Test getting an Aptogotchi, when user has not minted
    #[test(aptos_framework = @0x1, deployer = @aptogotchi_addr, user = @0x123)]
    #[expected_failure(abort_code = 851969, location = aptogotchi_addr::aptogotchi)]
    fun test_get_aptogotchi_without_creation(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer
    ) {
        aptogotchi::init_module_for_test(aptos_framework, deployer, user);

        // get aptogotchi without creating it
        aptogotchi::get_aptogotchi(signer::address_of(user));
    }

    // Test getting an Aptogotchi, when user has not minted
    #[test(aptos_framework = @0x1, deployer = @aptogotchi_addr, user = @0x123)]
    fun test_feed_and_play(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer
    ) {
        aptogotchi::init_module_for_test(aptos_framework, deployer, user);
        let creator_address = signer::address_of(user);
        aptogotchi::create_aptogotchi(user, string::utf8(b"test"), 1, 1, 1);

        let (_, _, energe_point_1, _) = aptogotchi::get_aptogotchi(creator_address);
        assert!(energe_point_1 == ENERGY_UPPER_BOUND, 1);

        aptogotchi::play(user, 5);
        let (_, _, energe_point_2, _) = aptogotchi::get_aptogotchi(creator_address);
        assert!(energe_point_2 == ENERGY_UPPER_BOUND - 5, 1);

        aptogotchi::feed(user, 3);
        let (_, _, energe_point_3, _) = aptogotchi::get_aptogotchi(creator_address);
        assert!(energe_point_3 == ENERGY_UPPER_BOUND - 2, 1);
    }

    // Test getting an Aptogotchi, when user has not minted
    #[test(aptos_framework = @0x1, deployer = @aptogotchi_addr, user = @0x123)]
    #[expected_failure(abort_code = 524291, location = aptogotchi_addr::aptogotchi)]
    fun test_create_aptogotchi_twice(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer
    ) {
        aptogotchi::init_module_for_test(aptos_framework, deployer, user);

        aptogotchi::create_aptogotchi(user, string::utf8(b"test"), 1, 1, 1);
        aptogotchi::create_aptogotchi(user, string::utf8(b"test"), 1, 1, 1);
    }
}
