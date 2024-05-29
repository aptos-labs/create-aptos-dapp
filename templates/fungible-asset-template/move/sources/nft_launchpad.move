/// This module provides a no-code solution for creating and managing collections of tokens.
/// It allows for the creation of pre-minted collections, where tokens are pre-minted to the collection address.
/// This no-code solution will work hand in hand with SDK support to provide a seamless experience for creators to create colletions.
/// The flow looks like:
/// 1. creators are prompted to prepare metadata files for each token and collection in csv file
/// 2. creators are prompted to upload these files to a decentralized storage
/// 3. creators are prompted to decide on below configurations
/// 4. collections created
/// 5. creators are prompted to pre-mint tokens to the collection
/// 6. creators are prompted to the question whether pre-minting has completed, if so, users can mint
/// Features it supports:
/// 1. random mint or sequential mint
/// 2. soulbound or transferrable
/// 3. mutable token and collection metadata
/// 4. optional mint fee payments minters pay
/// 5. configurable royalty
/// 6. max supply or unlimited supply collection
/// 7. mint stages and allowlists
module launchpad_addr::nft_launchpad {
    use std::option;
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_std::simple_map;
    use aptos_std::table;
    use aptos_framework::aptos_account;
    use aptos_framework::aptos_coin;
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_framework::timestamp;
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;
    use minter::token_components;
    use minter::mint_stage;
    use minter::collection_properties;
    use minter::collection_components;
    use minter::coin_payment;

    // /// The provided signer is not the collection owner during pre-minting.
    // const ENOT_OWNER: u64 = 1;
    // /// The provided collection does not have a EZLaunchConfig resource. Are you sure this Collection was created with ez_launch?
    // const ECONFIG_DOES_NOT_EXIST: u64 = 2;
    // /// CollectionProperties resource does not exist in the object address.
    // const ECOLLECTION_PROPERTIES_DOES_NOT_EXIST: u64 = 3;
    // /// Token Metadata configuration is invalid with different metadata length.
    // const ETOKEN_METADATA_CONFIGURATION_INVALID: u64 = 4;
    // /// Token Minting has not yet started.
    // const EMINTING_HAS_NOT_STARTED_YET: u64 = 5;
    // /// Tokens are all minted.
    // const ETOKENS_ALL_MINTED: u64 = 6;
    // /// Mint fee category is required when mint fee is provided.
    // const EMINT_FEE_CATEGORY_REQUIRED: u64 = 7;
    // /// The provided arguments are invalid
    // const EINVALID_ARGUMENTS: u64 = 8;
    // /// No active mint stages.
    // const ENO_ACTIVE_STAGES: u64 = 9;

    /// Sender is not admin
    const E_NOT_ADMIN: u64 = 1;
    /// No mint limit
    const E_NO_MINT_LIMIT: u64 = 2;
    /// Mint limit reached
    const E_MINT_LIMIT_REACHED: u64 = 3;
    /// No active mint stages
    const E_NO_ACTIVE_STAGES: u64 = 4;

    // const MINT_STAGE_BEFORE_ALLOWLIST: vector<u8> = b"Mint stage not open: before allowlist begins";
    // const MINT_STAGE_ALLOWLIST: vector<u8> = b"Mint stage open: allowlist";
    // const MINT_STAGE_BETWEEN_ALLOWLIST_AND_PUBLIC: vector<u8> = b"Mint stage not open: between allowlist and public";
    // const MINT_STAGE_PUBLIC: vector<u8> = b"Mint stage open: public";
    // const MINT_STAGE_ENDED: vector<u8> = b"Mint has ended";
    const ALLOWLIST_MINT_STAGE_CATEGORY: vector<u8> = b"Allowlist mint stage";
    const PUBLIC_MINT_MINT_STAGE_CATEGORY: vector<u8> = b"Public mint mint stage";
    const ALLOW_LIST_COIN_PAYMENT_CATEGORY: vector<u8> = b"Allowlist mint fee";
    const PUBLIC_MINT_COIN_PAYMENT_CATEGORY: vector<u8> = b"Public mint mint fee";

    #[event]
    struct CreateCollectionEvent has store, drop {
        creator_addr: address,
        collection_owner_obj: object::Object<CollectionOwnerObjConfig>,
        collection_obj: object::Object<collection::Collection>,
        max_supply: option::Option<u64>,
        name: string::String,
        uri: string::String,
        pre_mint_amount: u64,
        allowlist_mint_config: option::Option<(vector<address>, u64, u64, u64, u64)>,
        public_mint_config: option::Option<(u64, u64, u64, u64)>,
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
        /// key is stage, value is mint fee denomination
        mint_fee_by_stages: simple_map::SimpleMap<
            string::String,
            coin_payment::CoinPayment<aptos_coin::AptosCoin>
        >,
        collection_owner_obj: object::Object<CollectionOwnerObjConfig>,
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
        pre_mint_nft_names: vector<string::String>,
        pre_mint_nft_descriptions: vector<string::String>,
        allowlist_mint_config: option::Option<(vector<address>, u64, u64, u64, u64)>,
        public_mint_config: option::Option<(u64, u64, u64, u64)>,
    ) acquires Registry, Config, CollectionConfig {
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
            mint_fee_by_stages: simple_map::new(),
            collection_owner_obj,
        });

        if (option::is_some(&allowlist_mint_config)) {
            let stage = string::utf8(ALLOWLIST_MINT_STAGE_CATEGORY);
            let fee_category = string::utf8(ALLOW_LIST_COIN_PAYMENT_CATEGORY);
            let (
                allowlist,
                start_time,
                end_time,
                mint_limit_per_addr,
                mint_fee_per_nft,
            ) = *option::borrow(&allowlist_mint_config);
            mint_stage::create(
                collection_obj_signer,
                start_time,
                end_time,
                stage,
                option::none(),
            );

            for (i in 0..vector::length(&allowlist)) {
                mint_stage::add_to_allowlist(
                    collection_obj_signer,
                    collection_obj,
                    stage,
                    *vector::borrow(&allowlist, i),
                    mint_limit_per_addr
                );
            };

            let config = borrow_global<Config>(@launchpad_addr);
            let collection_config = borrow_global_mut<CollectionConfig>(collection_obj_addr);
            let fee = coin_payment::create<aptos_coin::AptosCoin>(mint_fee_per_nft, config.mint_fee_collector_addr, fee_category);
            simple_map::upsert(&mut collection_config.mint_fee_by_stages, stage, fee);
        };

        if (option::is_some(&public_mint_config)) {
            let stage = string::utf8(PUBLIC_MINT_MINT_STAGE_CATEGORY);
            let fee_category = string::utf8(PUBLIC_MINT_COIN_PAYMENT_CATEGORY);
            let (
                start_time,
                end_time,
                mint_limit_per_addr,
                mint_fee_per_nft,
            ) = *option::borrow(&public_mint_config);
            mint_stage::create(
                collection_obj_signer,
                start_time,
                end_time,
                stage,
                option::some(mint_limit_per_addr),
            );

            let config = borrow_global<Config>(@launchpad_addr);
            let collection_config = borrow_global_mut<CollectionConfig>(collection_obj_addr);
            let fee = coin_payment::create<aptos_coin::AptosCoin>(mint_fee_per_nft, config.mint_fee_collector_addr, fee_category);
            simple_map::upsert(&mut collection_config.mint_fee_by_stages, stage, fee);
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
            allowlist_mint_config,
            public_mint_config,
            pre_mint_amount: vector::length(&pre_mint_nft_names),
        });

        mint_nft_internal(sender, collection_obj, pre_mint_nft_names, pre_mint_nft_descriptions, 0);
    }

    public entry fun mint(sender: &signer, collection_obj: object::Object<collection::Collection>) acquires CollectionConfig, CollectionOwnerObjConfig {
        let sender_addr = signer::address_of(sender);

        // Check mint stages configured, in this example, we execute the earliest stage.
        let stage = &mint_stage::execute_earliest_stage(sender, collection_obj, 1);
        assert!(option::is_some(stage), E_NO_ACTIVE_STAGES);

        // After stage has been executed, take fee payments from `minter` prior to minting.
        let collection_config = borrow_global<CollectionConfig>(object::object_address(&collection_obj));
        let mint_fee = execute_payment(sender, &collection_config.mint_fee_by_stages, option::borrow(stage));

        let collection_owner_obj = borrow_global<CollectionConfig>(object::object_address(&collection_obj)).collection_owner_obj;
        let collection_owner_config = borrow_global<CollectionOwnerObjConfig>(object::object_address(&collection_owner_obj));
        let collection_owner_obj_signer = &object::generate_signer_for_extending(&collection_owner_config.extend_ref);
        let collection_obj_signer = &collection_components::collection_object_signer(collection_owner_obj_signer, collection_obj);
        let nft_obj_constructor_ref = &token::create(
            collection_obj_signer,
            collection::name(collection_obj),
            description,
            name,
            royalty::get(collection_obj),
            uri,
        );
        token_components::create_refs(nft_obj_constructor_ref);
        let nft_obj = object::object_from_constructor_ref(nft_obj_constructor_ref);
        object::transfer(collection_obj_signer, nft_obj, sender_addr);

        event::emit(MintNftEvent {
            recipient_addr: sender_addr,
            mint_fee,
            collection_obj,
            nft_obj,
        });
    }

    // ================================= View  ================================= //

    #[view]
    public fun get_current_stage(collection_obj: object::Object<collection::Collection>): vector<u8> acquires CollectionConfig {
        let current_timestamp = timestamp::now_microseconds();
        let collection_config = borrow_global<CollectionConfig>(object::object_address(&collection_obj));
        if (option::is_some(&collection_config.allowlist_mint_config)) {
            let allowlist_mint_config = option::borrow(&collection_config.allowlist_mint_config);
            if (current_timestamp < allowlist_mint_config.mint_start_timestamp) {
                return MINT_STAGE_BEFORE_ALLOWLIST;
            };
            if (option::is_some(&collection_config.public_mint_config)) {

            } else {

            }
        } else {
            let public_mint_config = option::borrow(&collection_config.public_mint_config);
            if (current_timestamp < public_mint_config.mint_start_timestamp) {
                MINT_STAGE_BEFORE_ALLOWLIST
            } else if (current_timestamp > public_mint_config.mint_end_timestamp) {
                MINT_STAGE_ENDED
            } else {
                MINT_STAGE_PUBLIC
            }
        }
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

    fun execute_payment(
        minter: &signer,
        fees: &simple_map::SimpleMap<string::String, coin_payment::CoinPayment<aptos_coin::AptosCoin>>,
        stage: &string::String,
    ): u64 {
        let fee = simple_map::borrow(fees, stage);
        coin_payment::execute(minter, fee);
        coin_payment::amount(fee)
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
}