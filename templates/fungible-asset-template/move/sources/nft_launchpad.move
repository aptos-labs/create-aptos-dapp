module launchpad_addr::nft_launchpad {
    use std::option;
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_std::table;
    use aptos_std::string_utils;
    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;

    use minter::token_components;
    use minter::mint_stage;
    use minter::collection_properties;
    use minter::collection_components;

    /// Sender is not admin
    const E_NOT_ADMIN: u64 = 1;
    /// No mint limit
    const E_NO_MINT_LIMIT: u64 = 2;
    /// Mint limit reached
    const E_MINT_LIMIT_REACHED: u64 = 3;
    /// No active mint stages
    const E_NO_ACTIVE_STAGES: u64 = 4;

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

    /// Unique per FA
    /// We need this object to own the FA object instead of contract directly owns the FA object
    /// This helps us avoid address collision when we create multiple FAs with same name
    struct CollectionOwnerObjConfig has key {
        /// Only thing it stores is the link to FA object
        collection_obj: object::Object<collection::Collection>,
        extend_ref: object::ExtendRef,
    }

    /// Unique per collection
    struct CollectionConfig has key {
        /// Key is stage, value is mint fee denomination
        mint_fee_per_nft_by_stages: table::Table<string::String, u64>,
        collection_owner_obj: object::Object<CollectionOwnerObjConfig>,
        /// Monotonic increasing ID, Starts from 1
        next_nft_id: u64,
    }

    /// Global per contract
    struct Registry has key {
        collection_owner_objects: vector<object::Object<CollectionOwnerObjConfig>>
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
            collection_owner_objects: vector::empty()
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
        assert!(is_admin(sender_addr), E_NOT_ADMIN);

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

        configure_collection_and_token_properties(
            collection_obj_signer,
            collection_obj,
            false,
            false,
            false,
            false,
        );
        collection_components::create_refs_and_properties(collection_obj_constructor_ref);

        move_to(collection_owner_obj_signer, CollectionOwnerObjConfig {
            extend_ref: object::generate_extend_ref(collection_obj_constructor_ref),
            collection_obj,
        });
        let collection_owner_obj = object::object_from_constructor_ref(collection_owner_obj_constructor_ref);
        move_to(collection_obj_signer, CollectionConfig {
            mint_fee_per_nft_by_stages: table::new(),
            collection_owner_obj,
            next_nft_id: 1,
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
            table::upsert(&mut collection_config.mint_fee_per_nft_by_stages, stage, *option::borrow(&allowlist_mint_fee_per_nft));
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
            table::upsert(&mut collection_config.mint_fee_per_nft_by_stages, stage, *option::borrow(&public_mint_fee_per_nft));
        };

        let registry = borrow_global_mut<Registry>(@launchpad_addr);
        vector::push_back(&mut registry.collection_owner_objects, collection_owner_obj);

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

    public entry fun mint(
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
    public fun get_registry(): vector<object::Object<CollectionOwnerObjConfig>> acquires Registry {
        let registry = borrow_global<Registry>(@launchpad_addr);
        registry.collection_owner_objects
    }

    #[view]
    public fun get_mint_fee(
        collection_obj: object::Object<collection::Collection>,
        stage: string::String,
    ): u64 acquires CollectionConfig {
        let collection_config = borrow_global<CollectionConfig>(object::object_address(&collection_obj));
        let fee = *table::borrow(&collection_config.mint_fee_per_nft_by_stages, stage);
        fee
    }

    // ================================= Helpers ================================= //

    fun is_admin(sender: address): bool acquires Config {
        let config = borrow_global<Config>(@launchpad_addr);
        if (object::is_object(@launchpad_addr)) {
            let obj = object::address_to_object<object::ObjectCore>(@launchpad_addr);
            object::is_owner(obj, sender)
        } else {
            sender == config.admin_addr
        }
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

    fun configure_collection_and_token_properties(
        creator: &signer,
        collection_obj: object::Object<collection::Collection>,
        mutable_collection_metadata: bool,
        mutable_token_metadata: bool,
        tokens_burnable_by_collection_owner: bool,
        tokens_transferrable_by_collection_owner: bool,
    ) {
        collection_properties::set_mutable_description(creator, collection_obj, mutable_collection_metadata);
        collection_properties::set_mutable_uri(creator, collection_obj, mutable_collection_metadata);
        collection_properties::set_mutable_royalty(creator, collection_obj, mutable_collection_metadata);
        collection_properties::set_mutable_token_name(creator, collection_obj, mutable_token_metadata);
        collection_properties::set_mutable_token_properties(creator, collection_obj, mutable_token_metadata);
        collection_properties::set_mutable_token_description(creator, collection_obj, mutable_token_metadata);
        collection_properties::set_mutable_token_uri(creator, collection_obj, mutable_token_metadata);
        collection_properties::set_tokens_transferable_by_collection_owner(
            creator,
            collection_obj,
            tokens_transferrable_by_collection_owner
        );
        collection_properties::set_tokens_burnable_by_collection_owner(
            creator,
            collection_obj,
            tokens_burnable_by_collection_owner
        );
    }

    fun mint_nft_internal(
        sender_addr: address,
        collection_obj: object::Object<collection::Collection>,
        mint_fee: u64,
    ) acquires CollectionConfig, CollectionOwnerObjConfig {
        let collection_config = borrow_global_mut<CollectionConfig>(object::object_address(&collection_obj));
        let collection_uri = collection::uri(collection_obj);
        let next_nft_id = collection_config.next_nft_id;
        let collection_owner_obj = collection_config.collection_owner_obj;
        let collection_owner_config = borrow_global<CollectionOwnerObjConfig>(
            object::object_address(&collection_owner_obj)
        );
        let collection_owner_obj_signer = &object::generate_signer_for_extending(&collection_owner_config.extend_ref);
        let collection_obj_signer = &collection_components::collection_object_signer(
            collection_owner_obj_signer,
            collection_obj
        );
        let nft_obj_constructor_ref = &token::create(
            collection_obj_signer,
            collection::name(collection_obj),
            // placeholder value, please read description from json metadata in storage
            string_utils::to_string(&next_nft_id),
            // placeholder value, please read name from json metadata in storage
            string_utils::to_string(&next_nft_id),
            royalty::get(collection_obj),
            // TODO: does petra support this? image url is in the json, wallet or any UI should fetch json first then fetch image
            string_utils::format2(&b"{}/{}.json", collection_uri, next_nft_id),
        );
        token_components::create_refs(nft_obj_constructor_ref);
        let nft_obj = object::object_from_constructor_ref(nft_obj_constructor_ref);
        object::transfer(collection_obj_signer, nft_obj, sender_addr);
        collection_config.next_nft_id = next_nft_id + 1;

        event::emit(MintNftEvent {
            recipient_addr: sender_addr,
            mint_fee,
            collection_obj,
            nft_obj,
        });
    }
}
