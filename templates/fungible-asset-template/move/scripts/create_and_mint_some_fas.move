script {
    use std::option;
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::fungible_asset;
    use aptos_framework::primary_fungible_store;
    use launchpad_addr::fa_launchpad;

    fun create_and_mint_some_fas(sender: &signer) {
        let sender_addr = signer::address_of(sender);

        // create first FA

        fa_launchpad::create_fa(
            sender,
            option::some(1000),
            string::utf8(b"FA1"),
            string::utf8(b"FA1"),
            2,
            string::utf8(b"icon_url"),
            string::utf8(b"project_url"),
            1,
            0,
            option::some(500),
        );
        let registry = fa_launchpad::get_registry();
        let fa_1 = *vector::borrow(&registry, vector::length(&registry) - 1);
        assert!(fungible_asset::supply(fa_1) == option::some(0), 1);

        fa_launchpad::mint_fa(sender, fa_1, 20);
        assert!(fungible_asset::supply(fa_1) == option::some(20), 2);
        assert!(primary_fungible_store::balance(sender_addr, fa_1) == 20, 3);

        // create second FA

        fa_launchpad::create_fa(
            sender,
            option::some(500),
            string::utf8(b"FA2"),
            string::utf8(b"FA2"),
            3,
            string::utf8(b"icon_url"),
            string::utf8(b"project_url"),
            1,
            0,
            option::some(500),
        );
        let registry = fa_launchpad::get_registry();
        let fa_2 = *vector::borrow(&registry, vector::length(&registry) - 1);
        assert!(fungible_asset::supply(fa_2) == option::some(0), 4);

        fa_launchpad::mint_fa(sender, fa_2, 300);
        assert!(fungible_asset::supply(fa_2) == option::some(300), 5);
        assert!(primary_fungible_store::balance(sender_addr, fa_2) == 300, 6);
    }
}
