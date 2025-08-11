module launchpad_addr::launchpad {
    use std::option::{Self, Option};
    use std::signer;
    use std::string::String;
    use std::vector;

    use aptos_std::table::{Self, Table};

    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::fungible_asset::{Self, Metadata};
    use aptos_framework::object::{Self, Object, ObjectCore, ExtendRef};
    use aptos_framework::primary_fungible_store;

    /// Only admin can update creator
    const EONLY_ADMIN_CAN_UPDATE_CREATOR: u64 = 1;
    /// Only admin can set pending admin
    const EONLY_ADMIN_CAN_SET_PENDING_ADMIN: u64 = 2;
    /// Sender is not pending admin
    const ENOT_PENDING_ADMIN: u64 = 3;
    /// Only admin can update mint fee collector
    const EONLY_ADMIN_CAN_UPDATE_MINT_FEE_COLLECTOR: u64 = 4;
    /// Only admin or creator can create fungible asset
    const EONLY_ADMIN_OR_CREATOR_CAN_CREATE_FA: u64 = 5;
    /// No mint limit
    const ENO_MINT_LIMIT: u64 = 6;
    /// Mint limit reached
    const EMINT_LIMIT_REACHED: u64 = 7;
    /// Only admin can update mint enabled
    const EONLY_ADMIN_CAN_UPDATE_MINT_ENABLED: u64 = 8;
    /// Mint is disabled
    const EMINT_IS_DISABLED: u64 = 9;
    /// Cannot mint 0 amount
    const ECANNOT_MINT_ZERO: u64 = 10;

    /// Default to mint 0 amount to creator when creating FA
    const DEFAULT_PRE_MINT_AMOUNT: u64 = 0;
    /// Default mint fee per smallest unit of FA denominated in oapt (smallest unit of APT, i.e. 1e-8 APT)
    const DEFAULT_MINT_FEE_PER_SMALLEST_UNIT_OF_FA: u64 = 0;

    #[event]
    struct CreateFAEvent has store, drop {
        creator_addr: address,
        fa_obj: Object<Metadata>,
        max_supply: Option<u128>,
        name: String,
        symbol: String,
        decimals: u8,
        icon_uri: String,
        project_uri: String,
        mint_fee_per_smallest_unit_of_fa: u64,
        pre_mint_amount: u64,
        mint_limit_per_addr: Option<u64>
    }

    #[event]
    struct MintFAEvent has store, drop {
        fa_obj: Object<Metadata>,
        amount: u64,
        recipient_addr: address,
        total_mint_fee: u64
    }

    /// Unique per FA
    struct FAController has key {
        mint_ref: fungible_asset::MintRef,
        burn_ref: fungible_asset::BurnRef,
        transfer_ref: fungible_asset::TransferRef
    }

    /// Unique per FA
    struct MintLimit has store {
        limit: u64,
        // key is minter address, value is how many tokens minter left to mint
        // e.g. mint limit is 3, minter has minted 2, mint balance should be 1
        mint_balance_tracker: Table<address, u64>
    }

    /// Unique per FA
    struct FAConfig has key {
        // Mint fee per FA denominated in oapt (smallest unit of APT, i.e. 1e-8 APT)
        mint_fee_per_smallest_unit_of_fa: u64,
        mint_limit: Option<MintLimit>,
        mint_enabled: bool,
        extend_ref: ExtendRef
    }

    /// Global per contract
    struct Registry has key {
        fa_objects: vector<Object<Metadata>>
    }

    /// Global per contract
    struct Config has key {
        // creator can create FA
        creator_addr: address,
        // admin can set pending admin, accept admin, update mint fee collector, create FA and update creator
        admin_addr: address,
        pending_admin_addr: Option<address>,
        mint_fee_collector_addr: address
    }

    /// If you deploy the module under an object, sender is the object's signer
    /// If you deploy the moduelr under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        move_to(sender, Registry { fa_objects: vector::empty() });
        move_to(
            sender,
            Config {
                creator_addr: @initial_creator_addr,
                admin_addr: signer::address_of(sender),
                pending_admin_addr: option::none(),
                mint_fee_collector_addr: signer::address_of(sender)
            }
        );
    }

    // ================================= Entry Functions ================================= //

    /// Update creator address
    public entry fun update_creator(sender: &signer, new_creator: address) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_UPDATE_CREATOR);
        config.creator_addr = new_creator;
    }

    /// Set pending admin of the contract, then pending admin can call accept_admin to become admin
    public entry fun set_pending_admin(
        sender: &signer, new_admin: address
    ) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_SET_PENDING_ADMIN);
        config.pending_admin_addr = option::some(new_admin);
    }

    /// Accept admin of the contract
    public entry fun accept_admin(sender: &signer) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(
            config.pending_admin_addr == option::some(sender_addr), ENOT_PENDING_ADMIN
        );
        config.admin_addr = sender_addr;
        config.pending_admin_addr = option::none();
    }

    /// Update mint fee collector address
    public entry fun update_mint_fee_collector(
        sender: &signer, new_mint_fee_collector: address
    ) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(
            is_admin(config, sender_addr), EONLY_ADMIN_CAN_UPDATE_MINT_FEE_COLLECTOR
        );
        config.mint_fee_collector_addr = new_mint_fee_collector;
    }

    /// Update mint enabled
    public entry fun update_mint_enabled(
        sender: &signer, fa_obj: Object<Metadata>, enabled: bool
    ) acquires Config, FAConfig {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_UPDATE_MINT_ENABLED);
        let fa_obj_addr = object::object_address(&fa_obj);
        let fa_config = borrow_global_mut<FAConfig>(fa_obj_addr);
        fa_config.mint_enabled = enabled;
    }

    /// Create a fungible asset, only admin or creator can create FA
    public entry fun create_fa(
        sender: &signer,
        max_supply: Option<u128>,
        name: String,
        symbol: String,
        // Number of decimal places, i.e. APT has 8 decimal places, so decimals = 8, 1 APT = 1e-8 oapt
        decimals: u8,
        icon_uri: String,
        project_uri: String,
        // Mint fee per smallest unit of FA denominated in oapt (smallest unit of APT, i.e. 1e-8 APT)
        mint_fee_per_smallest_unit_of_fa: Option<u64>,
        // Amount in smallest unit of FA
        pre_mint_amount: Option<u64>,
        // Limit of minting per address in smallest unit of FA
        mint_limit_per_addr: Option<u64>
    ) acquires Registry, Config, FAController {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global<Config>(@launchpad_addr);
        assert!(
            is_admin(config, sender_addr) || is_creator(config, sender_addr),
            EONLY_ADMIN_OR_CREATOR_CAN_CREATE_FA
        );

        let fa_obj_constructor_ref = &object::create_sticky_object(@launchpad_addr);
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
        let fa_obj = object::object_from_constructor_ref(fa_obj_constructor_ref);

        let mint_ref = fungible_asset::generate_mint_ref(fa_obj_constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(fa_obj_constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(fa_obj_constructor_ref);
        move_to(
            fa_obj_signer,
            FAController { mint_ref, burn_ref, transfer_ref }
        );
        move_to(
            fa_obj_signer,
            FAConfig {
                mint_fee_per_smallest_unit_of_fa: *mint_fee_per_smallest_unit_of_fa.borrow_with_default(
                    &DEFAULT_MINT_FEE_PER_SMALLEST_UNIT_OF_FA
                ),
                mint_limit: if (mint_limit_per_addr.is_some()) {
                    option::some(
                        MintLimit {
                            limit: *mint_limit_per_addr.borrow(),
                            mint_balance_tracker: table::new()
                        }
                    )
                } else {
                    option::none()
                },
                mint_enabled: true,
                extend_ref: object::generate_extend_ref(fa_obj_constructor_ref)
            }
        );

        let registry = borrow_global_mut<Registry>(@launchpad_addr);
        registry.fa_objects.push_back(fa_obj);

        event::emit(
            CreateFAEvent {
                creator_addr: sender_addr,
                fa_obj,
                max_supply,
                name,
                symbol,
                decimals,
                icon_uri,
                project_uri,
                mint_fee_per_smallest_unit_of_fa: *mint_fee_per_smallest_unit_of_fa.borrow_with_default(
                    &DEFAULT_MINT_FEE_PER_SMALLEST_UNIT_OF_FA
                ),
                pre_mint_amount: *pre_mint_amount.borrow_with_default(
                    &DEFAULT_PRE_MINT_AMOUNT
                ),
                mint_limit_per_addr
            }
        );

        if (*pre_mint_amount.borrow_with_default(&DEFAULT_PRE_MINT_AMOUNT) > 0) {
            let amount = *pre_mint_amount.borrow();
            mint_fa_internal(sender, fa_obj, amount, 0);
        }
    }

    /// Mint fungible asset, anyone with enough mint fee and has not reached mint limit can mint FA
    public entry fun mint_fa(
        sender: &signer, fa_obj: Object<Metadata>, amount: u64
    ) acquires FAController, FAConfig, Config {
        assert!(amount > 0, ECANNOT_MINT_ZERO);
        assert!(is_mint_enabled(fa_obj), EMINT_IS_DISABLED);
        let sender_addr = signer::address_of(sender);
        check_mint_limit_and_update_mint_tracker(sender_addr, fa_obj, amount);
        let total_mint_fee = get_mint_fee(fa_obj, amount);
        pay_for_mint(sender, total_mint_fee);
        mint_fa_internal(sender, fa_obj, amount, total_mint_fee);
    }

    // ================================= View Functions ================================== //

    #[view]
    /// Get creator, creator is the address that is allowed to create FAs
    public fun get_creator(): address acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        config.creator_addr
    }

    #[view]
    /// Get contract admin
    public fun get_admin(): address acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        config.admin_addr
    }

    #[view]
    /// Get contract pending admin
    public fun get_pending_admin(): Option<address> acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        config.pending_admin_addr
    }

    #[view]
    /// Get mint fee collector address
    public fun get_mint_fee_collector(): address acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        config.mint_fee_collector_addr
    }

    #[view]
    /// Get all fungible assets created using this contract
    public fun get_registry(): vector<Object<Metadata>> acquires Registry {
        let registry = borrow_global<Registry>(@launchpad_addr);
        registry.fa_objects
    }

    #[view]
    /// Get fungible asset metadata
    public fun get_fa_object_metadata(fa_obj: Object<Metadata>): (String, String, u8) {
        let name = fungible_asset::name(fa_obj);
        let symbol = fungible_asset::symbol(fa_obj);
        let decimals = fungible_asset::decimals(fa_obj);
        (symbol, name, decimals)
    }

    #[view]
    /// Get mint limit per address
    public fun get_mint_limit(fa_obj: Object<Metadata>): Option<u64> acquires FAConfig {
        let fa_config = borrow_global<FAConfig>(object::object_address(&fa_obj));
        if (fa_config.mint_limit.is_some()) {
            option::some(fa_config.mint_limit.borrow().limit)
        } else {
            option::none()
        }
    }

    #[view]
    /// Get mint balance, i.e. how many tokens user can mint
    /// e.g. If the mint limit is 1, user has already minted 1, balance is 0
    public fun get_mint_balance(fa_obj: Object<Metadata>, addr: address): u64 acquires FAConfig {
        let fa_config = borrow_global<FAConfig>(object::object_address(&fa_obj));
        assert!(fa_config.mint_limit.is_some(), ENO_MINT_LIMIT);
        let mint_limit = fa_config.mint_limit.borrow();
        let mint_tracker = &mint_limit.mint_balance_tracker;
        *mint_tracker.borrow_with_default(addr, &mint_limit.limit)
    }

    #[view]
    /// Get mint fee denominated in oapt (smallest unit of APT, i.e. 1e-8 APT)
    public fun get_mint_fee(
        fa_obj: Object<Metadata>,
        // Amount in smallest unit of FA
        amount: u64
    ): u64 acquires FAConfig {
        let fa_config = borrow_global<FAConfig>(object::object_address(&fa_obj));
        amount * fa_config.mint_fee_per_smallest_unit_of_fa
    }

    #[view]
    /// Is mint enabled for the fa
    public fun is_mint_enabled(fa_obj: Object<Metadata>): bool acquires FAConfig {
        let fa_addr = object::object_address(&fa_obj);
        let fa_config = borrow_global<FAConfig>(fa_addr);
        fa_config.mint_enabled
    }

    // ================================= Helper Functions ================================== //

    /// Check if sender is admin or owner of the object when package is published to object
    fun is_admin(config: &Config, sender: address): bool {
        if (sender == config.admin_addr) { true }
        else {
            if (object::is_object(@launchpad_addr)) {
                let obj = object::address_to_object<ObjectCore>(@launchpad_addr);
                object::is_owner(obj, sender)
            } else { false }
        }
    }

    /// Check if sender is allowed to create FA
    fun is_creator(config: &Config, sender: address): bool {
        sender == config.creator_addr
    }

    /// Check mint limit and update mint tracker
    fun check_mint_limit_and_update_mint_tracker(
        sender: address, fa_obj: Object<Metadata>, amount: u64
    ) acquires FAConfig {
        let mint_limit = get_mint_limit(fa_obj);
        if (mint_limit.is_some()) {
            let mint_balance = get_mint_balance(fa_obj, sender);
            assert!(mint_balance >= amount, EMINT_LIMIT_REACHED);
            let fa_config = borrow_global_mut<FAConfig>(object::object_address(&fa_obj));
            let mint_limit = fa_config.mint_limit.borrow_mut();
            mint_limit.mint_balance_tracker.upsert(sender, mint_balance - amount)
        }
    }

    /// ACtual implementation of minting FA
    fun mint_fa_internal(
        sender: &signer,
        fa_obj: Object<Metadata>,
        amount: u64,
        total_mint_fee: u64
    ) acquires FAController {
        let sender_addr = signer::address_of(sender);
        let fa_obj_addr = object::object_address(&fa_obj);

        let fa_controller = borrow_global<FAController>(fa_obj_addr);
        primary_fungible_store::mint(&fa_controller.mint_ref, sender_addr, amount);

        event::emit(
            MintFAEvent { fa_obj, amount, recipient_addr: sender_addr, total_mint_fee }
        );
    }

    /// Pay for mint
    fun pay_for_mint(sender: &signer, total_mint_fee: u64) acquires Config {
        if (total_mint_fee > 0) {
            let config = borrow_global<Config>(@launchpad_addr);
            aptos_account::transfer(
                sender, config.mint_fee_collector_addr, total_mint_fee
            )
        }
    }

    // ================================= Uint Tests ================================== //

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }
}

