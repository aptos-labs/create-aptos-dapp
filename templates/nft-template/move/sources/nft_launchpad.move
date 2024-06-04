module launchpad_addr::nft_launchpad {
    use std::option;
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_std::simple_map;
    use aptos_std::string_utils;
    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;

    use minter::token_components;
    use minter::mint_stage;
    use minter::collection_components;

    /// Sender is not admin
    const ENOT_ADMIN: u64 = 1;
    /// Sender is not pending admin
    const ENOT_PENDING_ADMIN: u64 = 2;
    /// Only admin can update mint fee collector
    const EONLY_ADMIN_CAN_UPDATE_MINT_FEE_COLLECTOR: u64 = 3;
    /// Only admin can create collection
    const EONLY_ADMIN_CAN_CREATE_COLLECTION: u64 = 4;
    /// No active mint stages
    const E_NO_ACTIVE_STAGES: u64 = 5;

    const ALLOWLIST_MINT_STAGE_CATEGORY: vector<u8> = b"Allowlist mint stage";
    const PUBLIC_MINT_MINT_STAGE_CATEGORY: vector<u8> = b"Public mint mint stage";

    #[event]
    struct CreateCollectionEvent has store, drop {
        creator_addr: address,
        collection_owner_obj: object::Object<CollectionOwnerObjConfig>,
        collection_obj: object::Object<collection::Collection>,
        max_supply: option::Option<u64>,
        name: string::String,
        uri: string::String,
        pre_mint_amount: u64,
        allowlist: option::Option<vector<address>>,
        allowlist_start_time: option::Option<u64>,
        allowlist_end_time: option::Option<u64>,
        allowlist_mint_limit_per_addr: option::Option<u64>,
        allowlist_mint_fee_per_nft: option::Option<u64>,
        public_mint_start_time: option::Option<u64>,
        public_mint_end_time: option::Option<u64>,
        public_mint_limit_per_addr: option::Option<u64>,
        public_mint_fee_per_nft: option::Option<u64>,
    }

    #[event]
    struct MintNftEvent has store, drop {
        collection_obj: object::Object<collection::Collection>,
        nft_obj: object::Object<token::Token>,
        recipient_addr: address,
        mint_fee: u64,
    }

    /// Unique per collection
    /// We need this object to own the collection object instead of contract directly owns the collection object
    /// This helps us avoid address collision when we create multiple collections with same name
    struct CollectionOwnerObjConfig has key {
        /// Only thing it stores is the link to collection object
        collection_obj: object::Object<collection::Collection>,
        extend_ref: object::ExtendRef,
    }

    /// Unique per collection
    struct CollectionConfig has key {
        /// Key is stage, value is mint fee denomination
        mint_fee_per_nft_by_stages: simple_map::SimpleMap<string::String, u64>,
        collection_owner_obj: object::Object<CollectionOwnerObjConfig>,
    }

    /// Global per contract
    struct Registry has key {
        collection_objects: vector<object::Object<collection::Collection>>
    }

    /// Global per contract
    struct Config has key {
        admin_addr: address,
        pending_admin_addr: option::Option<address>,
        mint_fee_collector_addr: address,
    }

    // If you deploy the module under an object, sender is the object's signer
    // If you deploy the module under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        move_to(sender, Registry {
            collection_objects: vector::empty()
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

    public entry fun create_collection(
        sender: &signer,
        description: string::String,
        name: string::String,
        uri: string::String,
        max_supply: option::Option<u64>,
        royalty_percentage: option::Option<u64>,
        pre_mint_amount: u64,
        allowlist: option::Option<vector<address>>,
        allowlist_start_time: option::Option<u64>,
        allowlist_end_time: option::Option<u64>,
        allowlist_mint_limit_per_addr: option::Option<u64>,
        allowlist_mint_fee_per_nft: option::Option<u64>,
        public_mint_start_time: option::Option<u64>,
        public_mint_end_time: option::Option<u64>,
        public_mint_limit_per_addr: option::Option<u64>,
        public_mint_fee_per_nft: option::Option<u64>,
    ) acquires Registry, Config, CollectionConfig, CollectionOwnerObjConfig {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global<Config>(@launchpad_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_CREATE_COLLECTION);

        let royalty = royalty(&mut royalty_percentage, sender_addr);

        let collection_owner_obj_constructor_ref = &object::create_object(@launchpad_addr);
        let collection_owner_obj_signer = &object::generate_signer(collection_owner_obj_constructor_ref);

        let collection_obj_constructor_ref = if (option::is_some(&max_supply)) {
            &collection::create_fixed_collection(
                collection_owner_obj_signer,
                description,
                option::extract(&mut max_supply),
                name,
                royalty,
                uri,
            )
        } else {
            &collection::create_unlimited_collection(
                collection_owner_obj_signer,
                description,
                name,
                royalty,
                uri,
            )
        };
        let collection_obj_signer = &object::generate_signer(collection_obj_constructor_ref);
        let collection_obj_addr = signer::address_of(collection_obj_signer);
        let collection_obj = object::object_from_constructor_ref(collection_obj_constructor_ref);

        collection_components::create_refs_and_properties(collection_obj_constructor_ref);

        move_to(collection_owner_obj_signer, CollectionOwnerObjConfig {
            extend_ref: object::generate_extend_ref(collection_owner_obj_constructor_ref),
            collection_obj,
        });
        let collection_owner_obj = object::object_from_constructor_ref(collection_owner_obj_constructor_ref);
        move_to(collection_obj_signer, CollectionConfig {
            mint_fee_per_nft_by_stages: simple_map::new(),
            collection_owner_obj,
        });

        if (option::is_some(&allowlist)) {
            let allowlist = *option::borrow(&allowlist); 
            let stage = string::utf8(ALLOWLIST_MINT_STAGE_CATEGORY);
            mint_stage::create(
                collection_obj_signer,
                *option::borrow(&allowlist_start_time),
                *option::borrow(&allowlist_end_time),
                stage,
                option::none(),
            );

            for (i in 0..vector::length(&allowlist)) {
                mint_stage::add_to_allowlist(
                    collection_obj_signer,
                    collection_obj,
                    stage,
                    *vector::borrow(&allowlist, i),
                    *option::borrow(&allowlist_mint_limit_per_addr)
                );
            };

            let collection_config = borrow_global_mut<CollectionConfig>(collection_obj_addr);
            simple_map::upsert(&mut collection_config.mint_fee_per_nft_by_stages, stage, *option::borrow(&allowlist_mint_fee_per_nft));
        };

        if (option::is_some(&public_mint_end_time)) {
            let stage = string::utf8(PUBLIC_MINT_MINT_STAGE_CATEGORY);
            mint_stage::create(
                collection_obj_signer,
                *option::borrow(&public_mint_start_time),
                *option::borrow(&public_mint_end_time),
                stage,
                option::some(*option::borrow(&public_mint_limit_per_addr))
            );

            let collection_config = borrow_global_mut<CollectionConfig>(collection_obj_addr);
            simple_map::upsert(&mut collection_config.mint_fee_per_nft_by_stages, stage, *option::borrow(&public_mint_fee_per_nft));
        };

        let registry = borrow_global_mut<Registry>(@launchpad_addr);
        vector::push_back(&mut registry.collection_objects, collection_obj);

        event::emit(CreateCollectionEvent {
            creator_addr: sender_addr,
            collection_owner_obj,
            collection_obj,
            max_supply,
            name,
            uri,
            pre_mint_amount,
            allowlist,
            allowlist_start_time,
            allowlist_end_time,
            allowlist_mint_limit_per_addr,
            allowlist_mint_fee_per_nft,
            public_mint_start_time,
            public_mint_end_time,
            public_mint_limit_per_addr,
            public_mint_fee_per_nft,
        });

        for (i in 0..pre_mint_amount) {
            mint_nft_internal(sender_addr, collection_obj, 0);
        };
    }

    public entry fun mint_nft(
        sender: &signer,
        collection_obj: object::Object<collection::Collection>
    ) acquires CollectionConfig, CollectionOwnerObjConfig, Config {
        let sender_addr = signer::address_of(sender);

        let stage = &mint_stage::execute_earliest_stage(sender, collection_obj, 1);
        assert!(option::is_some(stage), E_NO_ACTIVE_STAGES);

        let mint_fee = get_mint_fee(collection_obj, *option::borrow(stage));
        pay_for_mint(sender, mint_fee);

        mint_nft_internal(sender_addr, collection_obj, mint_fee);
    }

    // ================================= View  ================================= //

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
    public fun get_registry(): vector<object::Object<collection::Collection>> acquires Registry {
        let registry = borrow_global<Registry>(@launchpad_addr);
        registry.collection_objects
    }

    #[view]
    public fun get_mint_fee(
        collection_obj: object::Object<collection::Collection>,
        stage: string::String,
    ): u64 acquires CollectionConfig {
        let collection_config = borrow_global<CollectionConfig>(object::object_address(&collection_obj));
        let fee = *simple_map::borrow(&collection_config.mint_fee_per_nft_by_stages, &stage);
        fee
    }

    #[view]
    public fun aggregated_view(
        // collection_obj: object::Object<collection::Collection>,
    ): vector<(string::String, string::String)> acquires Registry {
        // let name = collection::name(collection_obj);
        // let uri = collection::uri(collection_obj);
        // (name, uri)
        let registry = get_registry();

        let result = vector::empty();
        for (i in 0..vector::length(&registry)) {
            let collection_obj = *vector::borrow(&registry, i);
            let name = collection::name(collection_obj);
            let uri = collection::uri(collection_obj);
            vector::push_back(&mut result, (name, uri));
        };
        result
    }

    // ================================= Helpers ================================= //

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

    fun pay_for_mint(sender: &signer, mint_fee: u64) acquires Config {
        if (mint_fee > 0) {
            aptos_account::transfer(sender, get_mint_fee_collector(), mint_fee)
        }
    }

    fun royalty(
        royalty_numerator: &mut option::Option<u64>,
        admin_addr: address,
    ): option::Option<royalty::Royalty> {
        if (option::is_some(royalty_numerator)) {
            let num = option::extract(royalty_numerator);
            option::some(royalty::create(num, 100, admin_addr))
        } else {
            option::none()
        }
    }

    fun mint_nft_internal(
        sender_addr: address,
        collection_obj: object::Object<collection::Collection>,
        mint_fee: u64,
    ) acquires CollectionConfig, CollectionOwnerObjConfig {
        let collection_config = borrow_global<CollectionConfig>(object::object_address(&collection_obj));

        let collection_owner_obj = collection_config.collection_owner_obj;
        let collection_owner_config = borrow_global<CollectionOwnerObjConfig>(
            object::object_address(&collection_owner_obj)
        );
        let collection_owner_obj_signer = &object::generate_signer_for_extending(&collection_owner_config.extend_ref);

        let next_nft_id = *option::borrow(&collection::count(collection_obj));
        let nft_obj_constructor_ref = &token::create(
            collection_owner_obj_signer,
            collection::name(collection_obj),
            // placeholder value, please read description from json metadata in storage
            string_utils::to_string(&next_nft_id),
            // placeholder value, please read name from json metadata in storage
            string_utils::to_string(&next_nft_id),
            royalty::get(collection_obj),
            // TODO: does petra support this? image url is in the json, wallet or any UI should fetch json first then fetch image
            string_utils::format2(&b"{}/{}.json", collection::uri(collection_obj), next_nft_id),
        );
        token_components::create_refs(nft_obj_constructor_ref);
        let nft_obj = object::object_from_constructor_ref(nft_obj_constructor_ref);
        object::transfer(collection_owner_obj_signer, nft_obj, sender_addr);

        event::emit(MintNftEvent {
            recipient_addr: sender_addr,
            mint_fee,
            collection_obj,
            nft_obj,
        });
    }

    #[test_only]
    use aptos_framework::aptos_coin;
    #[test_only]
    use aptos_framework::coin;
    #[test_only]
    use aptos_framework::timestamp;
    #[test_only]
    use aptos_framework::account;

    #[test(aptos_framework = @0x1, sender = @launchpad_addr, user1 = @0x200, user2 = @0x201)]
    fun test_happy_path(
        aptos_framework: &signer,
        sender: &signer,
        user1: &signer,
        user2: &signer,
    ) acquires Registry, Config, CollectionConfig, CollectionOwnerObjConfig {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let sender_addr = signer::address_of(sender);
        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);

        timestamp::set_time_has_started_for_testing(aptos_framework);

        init_module(sender);

        // create first collection

        create_collection(
            sender,
            string::utf8(b"description"),
            string::utf8(b"name"),
            string::utf8(b"hello.com"),
            option::some(10),
            option::some(10),
            3,
            option::none(),
            option::none(),
            option::none(),
            option::none(),
            option::none(),
            option::some(timestamp::now_seconds()),
            option::some(timestamp::now_seconds() + 100),
            option::some(2),
            option::some(10),
        );
        let registry = get_registry();
        let collection_1 = *vector::borrow(&registry, vector::length(&registry) - 1);
        assert!(collection::count(collection_1) == option::some(3), 1);

        account::create_account_for_test(user1_addr);
        coin::register<aptos_coin::AptosCoin>(user1);

        let mint_fee = get_mint_fee(collection_1, string::utf8(PUBLIC_MINT_MINT_STAGE_CATEGORY));
        aptos_coin::mint(aptos_framework, user1_addr, mint_fee);

        mint_nft(user1, collection_1);

        let res = aggregated_view();
        // assert!(fungible_asset::supply(collection_1) == option::some(20), 2);
        // assert!(primary_fungible_store::balance(sender_addr, collection_1) == 20, 3);
        //
        // // create second collection
        //
        // create_collection(
        //     sender,
        //     option::some(1000),
        //     string::utf8(b"collection2"),
        //     string::utf8(b"collection2"),
        //     3,
        //     string::utf8(b"icon_url"),
        //     string::utf8(b"project_url"),
        //     1,
        //     0,
        //     option::some(500)
        // );
        // let registry = get_registry();
        // let collection_2 = *vector::borrow(&registry, vector::length(&registry) - 1);
        // assert!(fungible_asset::supply(collection_2) == option::some(0), 4);
        //

        // let mint_fee = get_total_mint_fee(collection_2, 300);
        // aptos_coin::mint(aptos_framework, sender_addr, mint_fee);
        // mint_collection(sender, collection_2, 300);
        // assert!(fungible_asset::supply(collection_2) == option::some(300), 5);
        // assert!(primary_fungible_store::balance(sender_addr, collection_2) == 300, 6);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
