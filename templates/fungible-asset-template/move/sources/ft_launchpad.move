module launchpad_addr::fa_launchpad {
    use std::option;
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::fungible_asset;
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;

    /// Sender is not admin
    const E_NOT_ADMIN: u64 = 1;

    #[event]
    struct CreateFAEvent has store, drop {
        creator_addr: address,
        fa_owner_obj_addr: address,
        fa_obj_addr: address,
        max_supply: option::Option<u128>,
        name: string::String,
        symbol: string::String,
        decimals: u8,
        icon_uri: string::String,
        project_uri: string::String,
        mint_fee_per_fa: u64,
    }

    #[event]
    struct MintFAEvent has store, drop {
        fa_obj_addr: address,
        amount: u64,
        recipient_addr: address,
        total_mint_fee: u64,
    }

    /// Unique per FA
    /// We need this object to own the FA object instead of contract directly owns the FA object
    /// This helps us avoid address collision when we create multiple FAs with same name
    struct FAOwnerObjConfig has key {
        /// Only thing it stores is the link to FA object
        fa_obj: object::Object<fungible_asset::Metadata>
    }

    /// Unique per FA
    struct FAController has key {
        mint_ref: fungible_asset::MintRef,
        burn_ref: fungible_asset::BurnRef,
        transfer_ref: fungible_asset::TransferRef,
    }

    /// Unique per FA
    struct FAConfig has key {
        /// Mint fee per FA denominated in oapt (smallest unit of APT, i.e. 1e-8 APT)
        mint_fee_per_fa: u64,
    }

    /// Global per contract
    struct Registry has key {
        fa_owner_objects: vector<object::Object<FAOwnerObjConfig>>,
    }

    /// Global per contract
    struct Config has key {
        admin_addr: address,
        mint_fee_collector_addr: address,
    }

    // If you deploy the module under an object, sender is the object's signer
    // If you deploy the moduelr under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        move_to(sender, Registry {
            fa_owner_objects: vector::empty()
        });
        move_to(sender, Config {
            admin_addr: signer::address_of(sender),
            mint_fee_collector_addr: signer::address_of(sender),
        });
    }

    // ================================= Entry Functions ================================= //

    public entry fun update_admin(sender: &signer, new_admin: address) acquires Config {
        assert!(is_admin(signer::address_of(sender)), E_NOT_ADMIN);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        config.admin_addr = new_admin;
    }

    public entry fun update_mint_fee_collector(sender: &signer, new_mint_fee_collector: address) acquires Config {
        assert!(is_admin(signer::address_of(sender)), E_NOT_ADMIN);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        config.mint_fee_collector_addr = new_mint_fee_collector;
    }

    public entry fun create_fa(
        sender: &signer,
        max_supply: option::Option<u128>,
        name: string::String,
        symbol: string::String,
        decimals: u8,
        icon_uri: string::String,
        project_uri: string::String,
        mint_fee_per_fa: u64
    ) acquires Registry, Config {
        assert!(is_admin(signer::address_of(sender)), E_NOT_ADMIN);

        let fa_owner_obj_constructor_ref = &object::create_object(@launchpad_addr);
        let fa_owner_obj_signer = object::generate_signer(fa_owner_obj_constructor_ref);
        let fa_owner_obj_addr = signer::address_of(&fa_owner_obj_signer);

        let fa_obj_constructor_ref = &object::create_named_object(
            &fa_owner_obj_signer,
            *string::bytes(&name),
        );
        let fa_obj_signer = object::generate_signer(fa_obj_constructor_ref);
        let fa_obj_addr = signer::address_of(&fa_obj_signer);

        move_to(&fa_owner_obj_signer, FAOwnerObjConfig {
            fa_obj: object::address_to_object(fa_obj_addr),
        });

        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            fa_obj_constructor_ref,
            max_supply,
            name,
            symbol,
            decimals,
            icon_uri,
            project_uri
        );
        let mint_ref = fungible_asset::generate_mint_ref(fa_obj_constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(fa_obj_constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(fa_obj_constructor_ref);
        move_to(&fa_obj_signer, FAController {
            mint_ref,
            burn_ref,
            transfer_ref,
        });
        move_to(&fa_obj_signer, FAConfig {
            mint_fee_per_fa,
        });

        let registry = borrow_global_mut<Registry>(@launchpad_addr);
        vector::push_back(&mut registry.fa_owner_objects, object::address_to_object(fa_obj_addr));

        event::emit(CreateFAEvent {
            creator_addr: signer::address_of(sender),
            fa_owner_obj_addr,
            fa_obj_addr,
            max_supply,
            name,
            symbol,
            decimals,
            icon_uri,
            project_uri,
            mint_fee_per_fa,
        });
    }

    public entry fun mint_fa(
        sender: &signer,
        fa: object::Object<fungible_asset::Metadata>,
        amount: u64
    ) acquires FAController, FAConfig, Config {
        let config = borrow_global<Config>(@launchpad_addr);
        let sender_addr = signer::address_of(sender);
        let fa_obj_addr = object::object_address(&fa);

        let fa_controller = borrow_global<FAController>(fa_obj_addr);
        primary_fungible_store::mint(&fa_controller.mint_ref, sender_addr, amount);

        let fa_config = borrow_global<FAConfig>(fa_obj_addr);
        let total_mint_fee = fa_config.mint_fee_per_fa * amount;
        aptos_account::transfer(sender, config.mint_fee_collector_addr, total_mint_fee);

        event::emit(MintFAEvent {
            fa_obj_addr,
            amount,
            recipient_addr: sender_addr,
            total_mint_fee,
        });
    }

    // ================================= View Functions ================================== //

    #[view]
    public fun get_admin(): address acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        config.admin_addr
    }

    #[view]
    public fun get_mint_fee_collector(): address acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        config.mint_fee_collector_addr
    }

    #[view]
    public fun get_registry(): vector<object::Object<FAOwnerObjConfig>> acquires Registry {
        let registry = borrow_global<Registry>(@launchpad_addr);
        registry.fa_owner_objects
    }

    #[view]
    public fun get_fa_obj(
        fa_owner_obj: object::Object<FAOwnerObjConfig>,
    ): object::Object<fungible_asset::Metadata> acquires FAOwnerObjConfig {
        let fa_owner_obj = borrow_global<FAOwnerObjConfig>(object::object_address(&fa_owner_obj));
        fa_owner_obj.fa_obj
    }

    #[view]
    public fun get_total_mint_fee(fa: object::Object<fungible_asset::Metadata>, amount: u64): u64 acquires FAConfig {
        let fa_config = borrow_global<FAConfig>(object::object_address(&fa));
        fa_config.mint_fee_per_fa * amount
    }

    // ================================= Helper Functions ================================== //

    fun is_admin(sender: address): bool acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        if (object::is_object(@launchpad_addr)) {
            let obj = object::address_to_object<object::ObjectCore>(@launchpad_addr);
            object::is_owner(obj, sender)
        } else {
            sender == config.admin_addr
        }
    }

    // ================================= Tests ================================== //

    #[test_only]
    use aptos_framework::aptos_coin;
    #[test_only]
    use aptos_framework::coin;

    #[test(aptos_framework = @0x1, sender = @launchpad_addr)]
    fun test_happy_path(
        aptos_framework: &signer,
        sender: &signer,
    ) acquires Registry, FAController, Config, FAConfig, FAOwnerObjConfig {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let sender_addr = signer::address_of(sender);

        init_module(sender);

        // create first FA

        create_fa(
            sender,
            option::some(1000),
            string::utf8(b"FA1"),
            string::utf8(b"FA1"),
            2,
            string::utf8(b"icon_url"),
            string::utf8(b"project_url"),
            0,
        );
        let registry = get_registry();
        let fa_1_owner = *vector::borrow(&registry, vector::length(&registry) - 1);
        let fa_1 = get_fa_obj(fa_1_owner);
        assert!(fungible_asset::supply(fa_1) == option::some(0), 1);

        mint_fa(sender, fa_1, 20);
        assert!(fungible_asset::supply(fa_1) == option::some(20), 2);
        assert!(primary_fungible_store::balance(sender_addr, fa_1) == 20, 3);

        // create second FA

        create_fa(
            sender,
            option::some(1000),
            string::utf8(b"FA2"),
            string::utf8(b"FA2"),
            3,
            string::utf8(b"icon_url"),
            string::utf8(b"project_url"),
            1
        );
        let registry = get_registry();
        let fa_2_owner = *vector::borrow(&registry, vector::length(&registry) - 1);
        let fa_2 = get_fa_obj(fa_2_owner);
        assert!(fungible_asset::supply(fa_2) == option::some(0), 4);

        let mint_fee = get_total_mint_fee(fa_2, 300);
        aptos_coin::mint(aptos_framework, sender_addr, mint_fee);
        mint_fa(sender, fa_2, 300);
        assert!(fungible_asset::supply(fa_2) == option::some(300), 5);
        assert!(primary_fungible_store::balance(sender_addr, fa_2) == 300, 6);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
