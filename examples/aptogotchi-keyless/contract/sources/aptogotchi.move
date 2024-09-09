module aptogotchi_addr::aptogotchi {
    use std::error;
    use std::option;
    use std::signer;
    use std::string::{Self, String};

    use aptos_std::string_utils;

    use aptos_framework::event;
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_framework::timestamp;

    use aptos_token_objects::collection;
    use aptos_token_objects::token::{Self, BurnRef, MutatorRef};

    /// aptogotchi not available
    const ENOT_AVAILABLE: u64 = 1;
    /// name length exceeded limit
    const ENAME_LIMIT: u64 = 2;
    /// user already has aptogotchi
    const EUSER_ALREADY_HAS_APTOGOTCHI: u64 = 3;
    /// invalid body value
    const EBODY_VALUE_INVALID: u64 = 4;
    /// invalid ear value
    const EEAR_VALUE_INVALID: u64 = 5;
    /// invalid face value
    const EFACE_VALUE_INVALID: u64 = 6;

    // maximum health points: 5 hearts * 2 HP/heart = 10 HP
    const ENERGY_UPPER_BOUND: u64 = 10;
    const NAME_UPPER_BOUND: u64 = 40;

    // We need a contract signer as the creator of the aptogotchi collection and aptogotchi token
    // Otherwise we need admin to sign whenever a new aptogotchi token is minted which is inconvenient
    struct CollectionOwnerConfig has key {
        // This is the extend_ref of the collection owner object, not the extend_ref of collection object or token object
        // collection owner signer is the creator and owner of aptogotchi collection object
        // collection owner signer is also the creator of all aptogotchi token (NFT) objects
        extend_ref: ExtendRef,
    }

    struct AptogotchiParts has copy, drop, key, store {
        body: u8,
        ear: u8,
        face: u8,
    }

    struct Aptogotchi has key {
        name: String,
        birthday: u64,
        energy_points: u64,
        parts: AptogotchiParts,
        mutator_ref: MutatorRef,
        burn_ref: BurnRef,
    }

    #[event]
    struct MintAptogotchiEvent has drop, store {
        token_name: String,
        aptogotchi_name: String,
        parts: AptogotchiParts,
    }

    const COLLECTION_OWNER_OBJ_SEED: vector<u8> = b"APTOGOTCHI_COLLECTION_OWNER_OBJ";
    const APTOGOTCHI_COLLECTION_NAME: vector<u8> = b"Aptogotchi Collection";
    const APTOGOTCHI_COLLECTION_DESCRIPTION: vector<u8> = b"Aptogotchi Collection Description";
    const APTOGOTCHI_COLLECTION_URI: vector<u8> = b"https://otjbxblyfunmfblzdegw.supabase.co/storage/v1/object/public/aptogotchi/aptogotchi.png";
    // Body value range is [0, 4] inslusive
    const BODY_MAX_VALUE: u8 = 4;
    // Ear value range is [0, 5] inslusive
    const EAR_MAX_VALUE: u8 = 6;
    // Face value range is [0, 3] inslusive
    const FACE_MAX_VALUE: u8 = 3;

    /// If you deploy the module under an object, sender is the object's signer
    /// If you deploy the module under your own account, sender is your account's signer 
    fun init_module(sender: &signer) {
        let collection_owner_obj_constructor_ref = object::create_named_object(
            sender,
            COLLECTION_OWNER_OBJ_SEED,
        );
        let collection_owner_obj_signer = &object::generate_signer(&collection_owner_obj_constructor_ref);

        move_to(collection_owner_obj_signer, CollectionOwnerConfig {
            extend_ref: object::generate_extend_ref(&collection_owner_obj_constructor_ref)
        });

        let description = string::utf8(APTOGOTCHI_COLLECTION_DESCRIPTION);
        let name = string::utf8(APTOGOTCHI_COLLECTION_NAME);
        let uri = string::utf8(APTOGOTCHI_COLLECTION_URI);

        collection::create_unlimited_collection(
            collection_owner_obj_signer,
            description,
            name,
            option::none(),
            uri,
        );
    }

    // ================================= Entry Functions ================================= //

    /// Create an Aptogotchi token object
    public entry fun create_aptogotchi(
        user: &signer,
        name: String,
        body: u8,
        ear: u8,
        face: u8,
    ) acquires CollectionOwnerConfig {
        assert!(string::length(&name) <= NAME_UPPER_BOUND, error::invalid_argument(ENAME_LIMIT));
        assert!(
            body >= 0 && body <= BODY_MAX_VALUE,
            error::invalid_argument(EBODY_VALUE_INVALID)
        );
        assert!(ear >= 0 && ear <= EAR_MAX_VALUE, error::invalid_argument(EEAR_VALUE_INVALID));
        assert!(
            face >= 0 && face <= FACE_MAX_VALUE,
            error::invalid_argument(EFACE_VALUE_INVALID)
        );

        let uri = string::utf8(APTOGOTCHI_COLLECTION_URI);
        let description = string::utf8(APTOGOTCHI_COLLECTION_DESCRIPTION);
        let user_addr = signer::address_of(user);
        let token_name = string_utils::to_string(&user_addr);
        let parts = AptogotchiParts {
            body,
            ear,
            face,
        };
        assert!(!has_aptogotchi(user_addr), error::already_exists(EUSER_ALREADY_HAS_APTOGOTCHI));

        let constructor_ref = token::create_named_token(
            &get_collection_owner_signer(),
            string::utf8(APTOGOTCHI_COLLECTION_NAME),
            description,
            token_name,
            option::none(),
            uri,
        );

        let token_signer = object::generate_signer(&constructor_ref);
        let mutator_ref = token::generate_mutator_ref(&constructor_ref);
        let burn_ref = token::generate_burn_ref(&constructor_ref);
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);

        // initialize/set default Aptogotchi struct values
        let gotchi = Aptogotchi {
            name,
            birthday: timestamp::now_seconds(),
            energy_points: ENERGY_UPPER_BOUND,
            parts,
            mutator_ref,
            burn_ref,
        };

        move_to(&token_signer, gotchi);

        // Emit event for minting Aptogotchi token
        event::emit<MintAptogotchiEvent>(
            MintAptogotchiEvent {
                token_name,
                aptogotchi_name: name,
                parts,
            },
        );

        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), signer::address_of(user));
    }

    /// Sets aptogotchi's name
    public entry fun set_name(owner: signer, name: String) acquires Aptogotchi {
        let owner_addr = signer::address_of(&owner);
        assert!(has_aptogotchi(owner_addr), error::unavailable(ENOT_AVAILABLE));
        assert!(string::length(&name) <= NAME_UPPER_BOUND, error::invalid_argument(ENAME_LIMIT));
        let token_address = get_aptogotchi_address(owner_addr);
        let gotchi = borrow_global_mut<Aptogotchi>(token_address);
        gotchi.name = name;
    }

    /// Feeds aptogotchi to increase its energy points
    public entry fun feed(owner: &signer, points: u64) acquires Aptogotchi {
        let owner_addr = signer::address_of(owner);
        assert!(has_aptogotchi(owner_addr), error::unavailable(ENOT_AVAILABLE));
        let token_address = get_aptogotchi_address(owner_addr);
        let gotchi = borrow_global_mut<Aptogotchi>(token_address);

        gotchi.energy_points = if (gotchi.energy_points + points > ENERGY_UPPER_BOUND) {
            ENERGY_UPPER_BOUND
        } else {
            gotchi.energy_points + points
        };
    }

    /// Plays with aptogotchi to consume its energy points
    public entry fun play(owner: &signer, points: u64) acquires Aptogotchi {
        let owner_addr = signer::address_of(owner);
        assert!(has_aptogotchi(owner_addr), error::unavailable(ENOT_AVAILABLE));
        let token_address = get_aptogotchi_address(owner_addr);
        let gotchi = borrow_global_mut<Aptogotchi>(token_address);

        gotchi.energy_points = if (gotchi.energy_points < points) {
            0
        } else {
            gotchi.energy_points - points
        };
    }

    /// Sets Aptogotchi's parts
    public entry fun set_parts(owner: &signer, body: u8, ear: u8, face: u8) acquires Aptogotchi {
        let owner_addr = signer::address_of(owner);
        assert!(has_aptogotchi(owner_addr), error::unavailable(ENOT_AVAILABLE));
        let token_address = get_aptogotchi_address(owner_addr);
        let gotchi = borrow_global_mut<Aptogotchi>(token_address);
        gotchi.parts.body = body;
        gotchi.parts.ear = ear;
        gotchi.parts.face = face;
    }

    // ================================= View Functions ================================= //
    
    #[view]
    /// Get reference to Aptogotchi token object (CAN'T modify the reference)
    public fun get_aptogotchi_address(creator_addr: address): address {
        let collection = string::utf8(APTOGOTCHI_COLLECTION_NAME);
        let token_name = string_utils::to_string(&creator_addr);
        let creator_addr = get_collection_owner_signer_addr();
        let token_address = token::create_token_address(
            &creator_addr,
            &collection,
            &token_name,
        );

        token_address
    }

    #[view]
    /// Get collection address (also known as collection ID) of aptogotchi collection
    /// Collection itself is an object, that's why it has an address
    public fun get_aptogotchi_collection_address(): address {
        let collection_name = string::utf8(APTOGOTCHI_COLLECTION_NAME);
        let creator_addr = get_collection_owner_signer_addr();
        collection::create_collection_address(&creator_addr, &collection_name)
    }

    #[view]
    /// Returns true if this address owns an Aptogotchi
    public fun has_aptogotchi(owner_addr: address): bool {
        let token_address = get_aptogotchi_address(owner_addr);

        exists<Aptogotchi>(token_address)
    }

    #[view]
    /// Returns all fields for this Aptogotchi (if found)
    public fun get_aptogotchi(owner_addr: address): (String, u64, u64, AptogotchiParts) acquires Aptogotchi {
        // if this address doesn't have an Aptogotchi, throw error
        assert!(has_aptogotchi(owner_addr), error::unavailable(ENOT_AVAILABLE));

        let token_address = get_aptogotchi_address(owner_addr);
        let gotchi = borrow_global<Aptogotchi>(token_address);

        // view function can only return primitive types.
        (gotchi.name, gotchi.birthday, gotchi.energy_points, gotchi.parts)
    }

    // ================================= Helpers ================================= //

    fun get_collection_owner_signer_addr(): address {
        object::create_object_address(&@aptogotchi_addr, COLLECTION_OWNER_OBJ_SEED)
    }

    fun get_collection_owner_signer(): signer acquires CollectionOwnerConfig {
        object::generate_signer_for_extending(&borrow_global<CollectionOwnerConfig>(get_collection_owner_signer_addr()).extend_ref)
    }

    // ================================= Uint Tests ================================== //

    #[test_only]
    use aptos_framework::account::create_account_for_test;

    #[test_only]
    public fun init_module_for_test(aptos_framework: &signer, deployer: &signer, user: &signer) {
        // create a fake account (only for testing purposes)
        create_account_for_test(signer::address_of(deployer));
        create_account_for_test(signer::address_of(user));

        timestamp::set_time_has_started_for_testing(aptos_framework);
        init_module(deployer);
    }
}
