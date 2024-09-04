#[test_only]
module launchpad_addr::test_end_to_end {
    use std::option;
    use std::signer;
    use std::string;
    use std::vector;

    use aptos_framework::aptos_coin;
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_framework::fungible_asset;
    use aptos_framework::primary_fungible_store;

    use launchpad_addr::launchpad;

    #[test(aptos_framework = @0x1, sender = @launchpad_addr)]
    fun test_happy_path(
        aptos_framework: &signer,
        sender: &signer,
    ) {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let sender_addr = signer::address_of(sender);

        launchpad::init_module_for_test(sender);

        // create first FA

        launchpad::create_fa(
            sender,
            option::some(1000),
            string::utf8(b"FA1"),
            string::utf8(b"FA1"),
            2,
            string::utf8(b"icon_url"),
            string::utf8(b"project_url"),
            option::none(),
            option::none(),
            option::some(500)
        );
        let registry = launchpad::get_registry();
        let fa_1 = *vector::borrow(&registry, vector::length(&registry) - 1);
        assert!(fungible_asset::supply(fa_1) == option::some(0), 1);

        launchpad::mint_fa(sender, fa_1, 20);
        assert!(fungible_asset::supply(fa_1) == option::some(20), 2);
        assert!(primary_fungible_store::balance(sender_addr, fa_1) == 20, 3);

        // create second FA

        launchpad::create_fa(
            sender,
            option::some(1000),
            string::utf8(b"FA2"),
            string::utf8(b"FA2"),
            3,
            string::utf8(b"icon_url"),
            string::utf8(b"project_url"),
            option::some(1),
            option::none(),
            option::some(500)
        );
        let registry = launchpad::get_registry();
        let fa_2 = *vector::borrow(&registry, vector::length(&registry) - 1);
        assert!(fungible_asset::supply(fa_2) == option::some(0), 4);

        account::create_account_for_test(sender_addr);
        coin::register<aptos_coin::AptosCoin>(sender);
        let mint_fee = launchpad::get_mint_fee(fa_2, 300);
        aptos_coin::mint(aptos_framework, sender_addr, mint_fee);
        launchpad::mint_fa(sender, fa_2, 300);
        assert!(fungible_asset::supply(fa_2) == option::some(300), 5);
        assert!(primary_fungible_store::balance(sender_addr, fa_2) == 300, 6);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
