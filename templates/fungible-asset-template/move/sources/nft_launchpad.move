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
module launchpad_addr::nfa_launchpad {

    use std::option;
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::object;
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
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

    const PRESALE_MINT_STAGE_CATEGORY: vector<u8> = b"Presale mint stage";
    const PUBLIC_SALE_MINT_STAGE_CATEGORY: vector<u8> = b"Public sale mint stage";
    const PRESALE_COIN_PAYMENT_CATEGORY: vector<u8> = b"Presale mint fee";
    const PUBLIC_SALE_COIN_PAYMENT_CATEGORY: vector<u8> = b"Public sale mint fee";

    /// Unique per collection
    struct CollectionConfroller has key {
        extend_ref: object::ExtendRef,
    }

    /// Unique per collection
    struct CollectionConfig has key {
        allowlist_mint_fee_per_nft: u64,
        public_mint_fee_per_nft: u64,
    }

    /// Global per contract
    struct Registry has key {
        collections: vector<object::Object<collection::Collection>>
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
            collections: vector::empty()
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
        creator: &signer,
        description: string::String,
        name: string::String,
        uri: string::String,
        max_supply: option::Option<u64>,
        royalty_percentage: option::Option<u64>,
        allowlist_mint_fee_per_nft: u64,
        public_mint_fee_per_nft: u64,
    ) {
        let creator_addr = signer::address_of(creator);
        let collection_owner_obj_constructor_ref = &object::create_object(@launchpad_addr);
        let collection_owner_obj_signer = object::generate_signer(collection_owner_obj_constructor_ref);
        let royalty = royalty(&mut royalty_percentage, creator_addr);

        let collection = create_collection_internal(
            &collection_obj_signer,
            description,
            name,
            uri,
            max_supply,
            royalty,
        );

        configure_collection_and_token_properties(
            &collection_obj_signer,
            collection,
            false, false, false, false
        );

        move_to(&collection_obj_signer, CollectionConfroller {
            extend_ref: object::generate_extend_ref(collection_obj_constructor_ref)
        });

        move_to(&collection_obj_signer, CollectionConfig {
            allowlist_mint_fee_per_nft,
            public_mint_fee_per_nft,
        });
    }

    public entry fun pre_mint_tokens(
        creator: &signer,
        config: Object<EZLaunchConfig>,
        token_names: vector<String>, // not provided by creator, we could parse from metadata json file
        token_uris: vector<String>, // not provided by creator, we could parse from metadata json file
        token_descriptions: vector<String>, // not provided by creator, we could parse from metadata json file
        num_tokens: u64,
    ) acquires EZLaunchConfig {
        pre_mint_tokens_impl(creator, config, token_names, token_uris, token_descriptions, num_tokens)
    }

    public entry fun mint(minter: &signer, config: Object<EZLaunchConfig>, amount: u64) acquires EZLaunchConfig {
        mint_impl(minter, config, amount);
    }

    /// Add a mint stage to the launch configuration.
    /// `no_allowlist_max_mint` is the maximum number of tokens that can be minted in this stage without an allowlist.
    public entry fun add_stage(
        creator: &signer,
        config: Object<EZLaunchConfig>,
        stage_category: String,
        start_time: u64,
        end_time: u64,
        no_allowlist_max_mint: Option<u64>,
    ) acquires EZLaunchConfig {
        mint_stage::create(
            &authorized_config_signer(creator, config),
            start_time,
            end_time,
            stage_category,
            no_allowlist_max_mint,
        );
    }

    /// Add mint fee for a mint stage. Stage should be the same as the mint stage.
    public entry fun add_fee(
        creator: &signer,
        config: Object<EZLaunchConfig>,
        mint_fee: u64,
        destination: address,
        stage: String,
    ) acquires EZLaunchConfig {
        let config = authorized_borrow_mut(creator, config);
        let fee = coin_payment::create<AptosCoin>(mint_fee, destination, stage);
        if (simple_map::contains_key(&config.fees, &stage)) {
            let fees = simple_map::borrow_mut(&mut config.fees, &stage);
            vector::push_back(fees, fee);
        } else {
            simple_map::add(&mut config.fees, stage, vector[fee]);
        };
    }

    /// If this function is called, `no_allowlist_max_mint` will be ignored as an allowlist exists.
    public entry fun add_to_allowlist(
        owner: &signer,
        config: Object<EZLaunchConfig>,
        stage: String,
        addrs: vector<address>,
        amounts: vector<u64>,
    ) {
        let addrs_length = vector::length(&addrs);
        assert!(addrs_length == vector::length(&amounts), EINVALID_ARGUMENTS);

        for (i in 0..addrs_length) {
            let addr = *vector::borrow(&addrs, i);
            let amount = *vector::borrow(&amounts, i);
            mint_stage::add_to_allowlist(owner, config, stage, addr, amount);
        };
    }

    public entry fun remove_from_allowlist(
        owner: &signer,
        config: Object<EZLaunchConfig>,
        stage: String,
        addrs: vector<address>,
    ) {
        for (i in 0..vector::length(&addrs)) {
            let addr = *vector::borrow(&addrs, i);
            mint_stage::remove_from_allowlist(owner, config, stage, addr);
        };
    }

    public entry fun repopulate_allowlist(
        owner: &signer,
        config: Object<EZLaunchConfig>,
        stage: String,
        addrs: vector<address>,
        amounts: vector<u64>,
    ) {
        let addrs_length = vector::length(&addrs);
        assert!(addrs_length == vector::length(&amounts), EINVALID_ARGUMENTS);

        mint_stage::remove_everyone_from_allowlist(owner, config, stage);
        for (i in 0..addrs_length) {
            let addr = *vector::borrow(&addrs, i);
            let amount = *vector::borrow(&amounts, i);
            mint_stage::add_to_allowlist(owner, config, stage, addr, amount);
        };
    }

    public entry fun pre_mint_tokens_impl(
        creator: &signer,
        config: Object<EZLaunchConfig>,
        token_names: vector<String>,
        token_uris: vector<String>,
        token_descriptions: vector<String>,
        num_tokens: u64,
    ) acquires EZLaunchConfig {
        assert!(
            vector::length(&token_names) == num_tokens,
            error::invalid_argument(ETOKEN_METADATA_CONFIGURATION_INVALID)
        );
        assert!(
            vector::length(&token_uris) == num_tokens,
            error::invalid_argument(ETOKEN_METADATA_CONFIGURATION_INVALID)
        );
        assert!(
            vector::length(&token_descriptions) == num_tokens,
            error::invalid_argument(ETOKEN_METADATA_CONFIGURATION_INVALID)
        );

        let i = 0;
        let length = vector::length(&token_names);
        while (i < length) {
            let token = pre_mint_token(
                creator,
                config,
                *vector::borrow(&token_descriptions, i),
                *vector::borrow(&token_names, i),
                *vector::borrow(&token_uris, i),
            );
            vector::push_back(&mut borrow_mut(config).available_tokens, token);
            i = i + 1;
        };
    }

    // ================================= View  ================================= //

    #[view]
    public fun minting_ended(config: Object<EZLaunchConfig>): bool acquires EZLaunchConfig {
        vector::length(&borrow(config).available_tokens) == 0
    }

    #[view]
    public fun authorized_collection(
        config_owner: &signer,
        config: Object<EZLaunchConfig>
    ): Object<Collection> acquires EZLaunchConfig {
        authorized_borrow(config_owner, config).collection
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

    fun pre_mint_token(
        creator: &signer,
        config: Object<EZLaunchConfig>,
        description: String,
        name: String,
        uri: String,
    ): Object<Token> acquires EZLaunchConfig {
        let object_signer = &authorized_config_signer(creator, config);
        let collection = borrow(config).collection;
        let config_address = object::object_address(&config);

        let constructor_ref = &token::create(
            object_signer,
            collection::name(collection),
            description,
            name,
            royalty::get(collection),
            uri,
        );
        token_components::create_refs(constructor_ref);

        let token = object::object_from_constructor_ref(constructor_ref);
        object::transfer(object_signer, token, config_address);

        token
    }

    /// Minter calls this function to mint the `amount` of tokens.
    /// This function validates that an active mint stage exists. The earliest stage is executed.
    /// If the stage has an allowlist, the minter must be on the allowlist.
    /// If the stage has a mint fee, the minter must pay the fee prior to minting.
    fun mint_impl(
        minter: &signer,
        config_obj: Object<EZLaunchConfig>,
        amount: u64
    ): Object<Token> acquires EZLaunchConfig {
        let object_signer = config_signer(config_obj);
        let config = borrow(config_obj);
        let available_tokens = config.available_tokens;
        let length = vector::length(&available_tokens);
        assert!(length > 0, error::permission_denied(ETOKENS_ALL_MINTED));

        // Check mint stages configured, in this example, we execute the earliest stage.
        let stage = &mint_stage::execute_earliest_stage(minter, config_obj, amount);
        assert!(option::is_some(stage), ENO_ACTIVE_STAGES);

        // After stage has been executed, take fee payments from `minter` prior to minting.
        execute_payment(minter, &config.fees, option::borrow(stage));

        let token = vector::pop_back(&mut available_tokens);
        object::transfer(&object_signer, token, signer::address_of(minter));

        token
    }


    fun authorized_config_signer(
        config_owner: &signer,
        config: Object<EZLaunchConfig>
    ): signer acquires EZLaunchConfig {
        let config = authorized_borrow(config_owner, config);
        object::generate_signer_for_extending(&config.extend_ref)
    }

    fun config_signer(config: Object<EZLaunchConfig>): signer acquires EZLaunchConfig {
        let config = borrow(config);
        object::generate_signer_for_extending(&config.extend_ref)
    }

    fun execute_payment(
        minter: &signer,
        fees: &SimpleMap<String, vector<CoinPayment<AptosCoin>>>,
        stage: &String,
    ) {
        let fees = simple_map::borrow(fees, stage);
        vector::for_each_ref(fees, |fee| {
            coin_payment::execute(minter, fee)
        });
    }

    fun create_collection_internal(
        object_signer: &signer,
        description: string::String,
        name: string::String,
        uri: string::String,
        max_supply: option::Option<u64>,
        royalty: option::Option<royalty::Royalty>,
    ): object::Object<collection::Collection> {
        let constructor_ref = if (option::is_some(&max_supply)) {
            collection::create_fixed_collection(
                object_signer,
                description,
                option::extract(&mut max_supply),
                name,
                royalty,
                uri,
            )
        } else {
            collection::create_unlimited_collection(
                object_signer,
                description,
                name,
                royalty,
                uri,
            )
        };
        collection_components::create_refs_and_properties(&constructor_ref);
        object::object_from_constructor_ref(&constructor_ref)
    }

    fun royalty(
        royalty_numerator: &mut Option<u64>,
        admin_addr: address,
    ): Option<Royalty> {
        if (option::is_some(royalty_numerator)) {
            let num = option::extract(royalty_numerator);
            option::some(royalty::create(num, 100, admin_addr))
        } else {
            option::none()
        }
    }

    fun configure_collection_and_token_properties(
        creator: &signer,
        collection: object::Object<collection::Collection>,
        mutable_collection_metadata: bool,
        mutable_token_metadata: bool,
        tokens_burnable_by_collection_owner: bool,
        tokens_transferrable_by_collection_owner: bool,
    ) {
        collection_properties::set_mutable_description(creator, collection, mutable_collection_metadata);
        collection_properties::set_mutable_uri(creator, collection, mutable_collection_metadata);
        collection_properties::set_mutable_royalty(creator, collection, mutable_collection_metadata);
        collection_properties::set_mutable_token_name(creator, collection, mutable_token_metadata);
        collection_properties::set_mutable_token_properties(creator, collection, mutable_token_metadata);
        collection_properties::set_mutable_token_description(creator, collection, mutable_token_metadata);
        collection_properties::set_mutable_token_uri(creator, collection, mutable_token_metadata);
        collection_properties::set_tokens_transferable_by_collection_owner(
            creator,
            collection,
            tokens_transferrable_by_collection_owner
        );
        collection_properties::set_tokens_burnable_by_collection_owner(
            creator,
            collection,
            tokens_burnable_by_collection_owner
        );
    }

    inline fun assert_owner<T: key>(owner: address, object: Object<T>) {
        assert!(object::owner(object) == owner, error::permission_denied(ENOT_OWNER));
    }

    inline fun authorized_borrow(config_owner: &signer, config: Object<EZLaunchConfig>): &EZLaunchConfig {
        assert_owner(signer::address_of(config_owner), config);
        borrow(config)
    }

    inline fun authorized_borrow_mut(config_owner: &signer, config: Object<EZLaunchConfig>): &mut EZLaunchConfig {
        assert_owner(signer::address_of(config_owner), config);
        borrow_mut(config)
    }

    inline fun borrow(config: Object<EZLaunchConfig>): &EZLaunchConfig {
        freeze(borrow_mut(config))
    }

    inline fun borrow_mut(config: Object<EZLaunchConfig>): &mut EZLaunchConfig acquires EZLaunchConfig {
        let config_address = object::object_address(&config);
        assert!(
            exists<EZLaunchConfig>(config_address),
            error::not_found(ECONFIG_DOES_NOT_EXIST)
        );
        borrow_global_mut<EZLaunchConfig>(config_address)
    }
}