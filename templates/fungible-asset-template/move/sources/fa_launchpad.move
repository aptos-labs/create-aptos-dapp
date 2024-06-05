module launchpad_addr::fa_launchpad {
    use std::option;
    use std::signer;
    use std::string::{String, Self};
    use std::vector;

    use aptos_std::smart_table;

    use aptos_framework::object::{Self, Object};
    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::fungible_asset;
    use aptos_framework::primary_fungible_store;

    /// Sender is not admin
    const ENOT_ADMIN: u64 = 1;
    /// Sender is not pending admin
    const ENOT_PENDING_ADMIN: u64 = 2;
    /// Only admin can update mint fee collector
    const EONLY_ADMIN_CAN_UPDATE_MINT_FEE_COLLECTOR: u64 = 3;
    /// Only admin can create FA
    const EONLY_ADMIN_CAN_CREATE_FA: u64 = 4;
    /// No mint limit
    const ENO_MINT_LIMIT: u64 = 5;
    /// Mint limit reached
    const EMINT_LIMIT_REACHED: u64 = 6;

    #[event]
    struct CreateFAEvent has store, drop {
        creator_addr: address,
        fa_owner_obj: Object<FAOwnerObjConfig>,
        fa_obj: Object<fungible_asset::Metadata>,
        max_supply: option::Option<u128>,
        name: String,
        symbol: String,
        decimals: u8,
        icon_uri: String,
        project_uri: String,
        mint_fee_per_fa: u64,
        pre_mint_amount: u64,
        mint_limit_per_addr: option::Option<u64>,
    }

    #[event]
    struct MintFAEvent has store, drop {
        fa_obj: Object<fungible_asset::Metadata>,
        amount: u64,
        recipient_addr: address,
        total_mint_fee: u64,
    }

    /// Unique per FA
    /// We need this object to own the FA object instead of contract directly owns the FA object
    /// This helps us avoid address collision when we create multiple FAs with same name
    struct FAOwnerObjConfig has key {
        /// Only thing it stores is the link to FA object
        fa_obj: Object<fungible_asset::Metadata>
    }

    /// Unique per FA
    struct FAController has key {
        mint_ref: fungible_asset::MintRef,
        burn_ref: fungible_asset::BurnRef,
        transfer_ref: fungible_asset::TransferRef,
    }

    /// Tracks mint limit per address
    /// Initial supply (minted at creation) is not counted towards mint limit
    struct MintLimit has store {
        limit: u64,
        mint_tracker: smart_table::SmartTable<address, u64>,
    }

    /// Unique per FA
    struct FAConfig has key {
        /// Mint fee per FA denominated in oapt (smallest unit of APT, i.e. 1e-8 APT)
        mint_fee_per_fa: u64,
        mint_limit: option::Option<MintLimit>,
        fa_owner_obj: Object<FAOwnerObjConfig>,
    }

    /// Global per contract
    struct Registry has key {
        fa_objects: vector<Object<fungible_asset::Metadata>>,
    }

    /// Global per contract
    struct Config has key {
        admin_addr: address,
        pending_admin_addr: option::Option<address>,
        mint_fee_collector_addr: address,
    }

    // If you deploy the module under an object, sender is the object's signer
    // If you deploy the moduelr under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        move_to(sender, Registry {
            fa_objects: vector::empty()
        });
        move_to(sender, Config {
            admin_addr: signer::address_of(sender),
            pending_admin_addr: option::none(),
            mint_fee_collector_addr: signer::address_of(sender),
        });
    }

    // ================================= Entry Functions ================================= //

    public entry fun set_pending_admin(sender: &signer, new_admin: address) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), ENOT_ADMIN);
        config.pending_admin_addr = option::some(new_admin);
    }

    public entry fun accept_admin(sender: &signer) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(is_pending_admin(config, sender_addr), ENOT_PENDING_ADMIN);
        config.admin_addr = sender_addr;
        config.pending_admin_addr = option::none();
    }

    public entry fun update_mint_fee_collector(sender: &signer, new_mint_fee_collector: address) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_UPDATE_MINT_FEE_COLLECTOR);
        config.mint_fee_collector_addr = new_mint_fee_collector;
    }

    public entry fun create_fa(
        sender: &signer,
        max_supply: option::Option<u128>,
        name: String,
        symbol: String,
        decimals: u8,
        icon_uri: String,
        project_uri: String,
        mint_fee_per_fa: u64,
        pre_mint_amount: u64,
        mint_limit_per_addr: option::Option<u64>,
    ) acquires Registry, Config, FAController {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_CREATE_FA);

        let fa_owner_obj_constructor_ref = &object::create_object(@launchpad_addr);
        let fa_owner_obj_signer = &object::generate_signer(fa_owner_obj_constructor_ref);

        let fa_obj_constructor_ref = &object::create_named_object(
            fa_owner_obj_signer,
            *string::bytes(&name),
        );
        let fa_obj_signer = &object::generate_signer(fa_obj_constructor_ref);

        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            fa_obj_constructor_ref,
            max_supply,
            name,
            symbol,
            decimals,
            icon_uri,
            project_uri
        );
        let fa_obj = object::object_from_constructor_ref<>(fa_obj_constructor_ref);
        move_to(fa_owner_obj_signer, FAOwnerObjConfig {
            fa_obj,
        });
        let fa_owner_obj = object::object_from_constructor_ref(fa_owner_obj_constructor_ref);
        let mint_ref = fungible_asset::generate_mint_ref(fa_obj_constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(fa_obj_constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(fa_obj_constructor_ref);
        move_to(fa_obj_signer, FAController {
            mint_ref,
            burn_ref,
            transfer_ref,
        });
        move_to(fa_obj_signer, FAConfig {
            mint_fee_per_fa,
            mint_limit: if (option::is_some(&mint_limit_per_addr)) {
                option::some(MintLimit {
                    limit: *option::borrow(&mint_limit_per_addr),
                    mint_tracker: smart_table::new()
                })
            } else {
                option::none()
            },
            fa_owner_obj,
        });

        let registry = borrow_global_mut<Registry>(@launchpad_addr);
        vector::push_back(&mut registry.fa_objects, fa_obj);

        event::emit(CreateFAEvent {
            creator_addr: sender_addr,
            fa_owner_obj,
            fa_obj,
            max_supply,
            name,
            symbol,
            decimals,
            icon_uri,
            project_uri,
            mint_fee_per_fa,
            pre_mint_amount,
            mint_limit_per_addr,
        });

        if (pre_mint_amount > 0) {
            mint_fa_internal(sender, fa_obj, pre_mint_amount, 0)
        }
    }

    public entry fun mint_fa(
        sender: &signer,
        fa_obj: Object<fungible_asset::Metadata>,
        amount: u64
    ) acquires FAController, FAConfig, Config {
        let sender_addr = signer::address_of(sender);
        check_mint_limit_and_update_mint_tracker(sender_addr, fa_obj, amount);
        let total_mint_fee = get_total_mint_fee(fa_obj, amount);
        pay_for_mint(sender, total_mint_fee);
        mint_fa_internal(sender, fa_obj, amount, total_mint_fee);
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
    public fun get_registry(): vector<Object<fungible_asset::Metadata>> acquires Registry {
        let registry = borrow_global<Registry>(@launchpad_addr);
        registry.fa_objects
    }

    #[view]
    public fun get_mint_limit(
        fa_obj: Object<fungible_asset::Metadata>,
    ): option::Option<u64> acquires FAConfig {
        let fa_config = borrow_global<FAConfig>(object::object_address(&fa_obj));
        if (option::is_some(&fa_config.mint_limit)) {
            option::some(option::borrow(&fa_config.mint_limit).limit)
        } else {
            option::none()
        }
    }

    #[view]
    public fun get_current_minted_amount(
        fa_obj: Object<fungible_asset::Metadata>,
        addr: address
    ): u64 acquires FAConfig {
        let fa_config = borrow_global<FAConfig>(object::object_address((&fa_obj)));
        assert!(option::is_some(&fa_config.mint_limit), ENO_MINT_LIMIT);
        let mint_limit = option::borrow(&fa_config.mint_limit);
        let mint_tracker = &mint_limit.mint_tracker;
        *smart_table::borrow_with_default(mint_tracker, addr, &0)
    }

    #[view]
    public fun get_total_mint_fee(
        fa_obj: Object<fungible_asset::Metadata>,
        amount: u64
    ): u64 acquires FAConfig {
        let fa_config = borrow_global<FAConfig>(object::object_address((&fa_obj)));
        fa_config.mint_fee_per_fa * amount
    }

    // ================================= Helper Functions ================================== //

    fun is_admin(config: &Config, sender: address): bool {
        if (sender == config.admin_addr) {
            true
        } else {
            if (object::is_object(@launchpad_addr)) {
                let obj = object::address_to_object<object::ObjectCore>(@launchpad_addr);
                object::is_owner(obj, sender)
            } else {
                false
            }
        }
    }

    fun is_pending_admin(config: &Config, sender: address): bool {
        config.pending_admin_addr == option::some(sender)
    }

    fun check_mint_limit_and_update_mint_tracker(
        sender: address,
        fa_obj: Object<fungible_asset::Metadata>,
        amount: u64,
    ) acquires FAConfig {
        let mint_limit = get_mint_limit(fa_obj);
        if (option::is_some(&mint_limit)) {
            let old_amount = get_current_minted_amount(fa_obj, sender);
            assert!(
                old_amount + amount <= *option::borrow(&mint_limit),
                EMINT_LIMIT_REACHED,
            );
            let fa_config = borrow_global_mut<FAConfig>(object::object_address(&fa_obj));
            let mint_limit = option::borrow_mut(&mut fa_config.mint_limit);
            smart_table::upsert(&mut mint_limit.mint_tracker, sender, old_amount + amount)
        }
    }

    fun mint_fa_internal(
        sender: &signer,
        fa_obj: Object<fungible_asset::Metadata>,
        amount: u64,
        total_mint_fee: u64,
    ) acquires FAController {
        let sender_addr = signer::address_of(sender);
        let fa_obj_addr = object::object_address((&fa_obj));

        let fa_controller = borrow_global<FAController>(fa_obj_addr);
        primary_fungible_store::mint(&fa_controller.mint_ref, sender_addr, amount);

        event::emit(MintFAEvent {
            fa_obj,
            amount,
            recipient_addr: sender_addr,
            total_mint_fee,
        });
    }

    fun pay_for_mint(
        sender: &signer,
        total_mint_fee: u64
    ) acquires Config {
        if (total_mint_fee > 0) {
            let config = borrow_global<Config>(@launchpad_addr);
            aptos_account::transfer(sender, config.mint_fee_collector_addr, total_mint_fee)
        }
    }

    // ================================= Uint Tests ================================== //

    #[test_only]
    use aptos_framework::aptos_coin;
    #[test_only]
    use aptos_framework::coin;
    #[test_only]
    use aptos_framework::account;

    #[test(aptos_framework = @0x1, sender = @launchpad_addr)]
    fun test_happy_path(
        aptos_framework: &signer,
        sender: &signer,
    ) acquires Registry, FAController, Config, FAConfig {
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
            0,
            option::some(500)
        );
        let registry = get_registry();
        let fa_1 = *vector::borrow(&registry, vector::length(&registry) - 1);
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
            1,
            0,
            option::some(500)
        );
        let registry = get_registry();
        let fa_2 = *vector::borrow(&registry, vector::length(&registry) - 1);
        assert!(fungible_asset::supply(fa_2) == option::some(0), 4);

        account::create_account_for_test(sender_addr);
        coin::register<aptos_coin::AptosCoin>(sender);
        let mint_fee = get_total_mint_fee(fa_2, 300);
        aptos_coin::mint(aptos_framework, sender_addr, mint_fee);
        mint_fa(sender, fa_2, 300);
        assert!(fungible_asset::supply(fa_2) == option::some(300), 5);
        assert!(primary_fungible_store::balance(sender_addr, fa_2) == 300, 6);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
