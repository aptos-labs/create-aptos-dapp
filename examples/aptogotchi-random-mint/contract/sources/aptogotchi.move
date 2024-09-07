module aptogotchi_addr::aptogotchi {
    use std::option;
    use std::signer;
    use std::string::{Self, String};

    use aptos_std::string_utils;

    use aptos_framework::event;
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_framework::randomness;

    use aptos_token_objects::collection;
    use aptos_token_objects::token::{Self, MutatorRef, BurnRef};

    /// Aptogotchi not exist at given address
    const EAPTOGOTCHI_NOT_EXIST: u64 = 1;
    /// Randomness commitment not exist at given address, please commit first
    const ERANDOMNESS_COMMITMENT_NOT_EXIST: u64 = 2;
    /// Dead Aptogotchi cannot move
    const EDEAD_APTOGOTCHI_CANNOT_MOVE: u64 = 3;
    /// Already committed random value, please reveal now
    const EALREADY_COMMITTED: u64 = 4;
    /// Already revealed random value, please commit again for next move
    const EALREADY_REVEALED: u64 = 5;

    const COLLECTION_OWNER_OBJ_SEED: vector<u8> = b"APTOGOTCHI_COLLECTION_OWNER_OBJ";
    const APTOGOTCHI_COLLECTION_NAME: vector<u8> = b"Aptogotchi Collection";
    const APTOGOTCHI_COLLECTION_DESCRIPTION: vector<u8> = b"Aptogotchi Collection Description";
    const APTOGOTCHI_COLLECTION_URI: vector<u8> = b"https://otjbxblyfunmfblzdegw.supabase.co/storage/v1/object/public/aptogotchi/aptoaptogotchi.png";

    // Body value range is [0, 5)
    const BODY_MAX_VALUE_EXCL: u8 = 5;
    // Ear value range is [0, 6)
    const EAR_MAX_VALUE_EXCL: u8 = 6;
    // Face value range is [0, 4)
    const FACE_MAX_VALUE_EXCL: u8 = 4;
    // default health of Aptogotchi at creation
    const DEFAULT_BEGINNING_HEALTH: u8 = 5;

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
        live: bool,
        health: u8,
        parts: AptogotchiParts,
        extend_ref: ExtendRef,
        mutator_ref: MutatorRef,
        burn_ref: BurnRef,
    }

    #[event]
    struct MintAptogotchiEvent has drop, store {
        aptogotchi_address: address,
        token_name: String,
        parts: AptogotchiParts,
    }

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
    
    #[randomness]
    /// Create an Aptogotchi token object.
    /// Because this function calls random it must not be public.
    /// This ensures user can only call it from a transaction instead of another contract.
    /// This prevents users seeing the result of mint and act on it, e.g. see the result and abort the tx if they don't like it.
    entry fun create_aptogotchi(user: &signer) acquires CollectionOwnerConfig {
        create_aptogotchi_internal(user);
    }

    #[randomness]
    /// Make a random move for the Aptoaptogotchi.
    /// Depending on the random value, the Aptogotchi's health will increase or decrease.
    /// We prevent undergasing attack by making sure the gas cost of both paths are equal or reward path is higher.
    /// This function is only called from a transaction to prevent test and abort attack.
    entry fun make_random_move(
        aptogotchi_address: address,
    ) acquires Aptogotchi {
        check_aptogotchi_exist_and_live(aptogotchi_address);
        let aptogotchi = borrow_global_mut<Aptogotchi>(aptogotchi_address);
        let random_value = randomness::u8_range(0, 2);
        if (random_value == 0) {
            // Reward path
            aptogotchi.health = aptogotchi.health + 1;
            // Always run to make sure reward path gas cost is always higher or equal to punishment path
            if (aptogotchi.health > 0) {
                aptogotchi.live = true;
            }
        } else {
            // Punishment path
            aptogotchi.health = aptogotchi.health - 1;
            // Conditionally run, so punishment path gas cost is always lower or equal to reward path
            if (aptogotchi.health == 0) {
                aptogotchi.live = false;
            }
        };
    }

    // ================================= View Functions ================================= //
    
    #[view]
    /// Get collection name of aptogotchi collection
    public fun get_aptogotchi_collection_name(): (String) {
        string::utf8(APTOGOTCHI_COLLECTION_NAME)
    }

    #[view]
    /// Get creator address of aptogotchi collection
    public fun get_aptogotchi_collection_creator_address(): (address) {
        get_collection_address()
    }

    #[view]
    /// Get collection ID of aptogotchi collection
    public fun get_aptogotchi_collection_address(): (address) {
        let collection_name = string::utf8(APTOGOTCHI_COLLECTION_NAME);
        let creator_address = get_collection_address();
        collection::create_collection_address(&creator_address, &collection_name)
    }

    #[view]
    /// Returns all fields for this Aptogotchi (if found)
    public fun get_aptogotchi(aptogotchi_address: address): (bool, u8, AptogotchiParts) acquires Aptogotchi {
        let aptogotchi = borrow_global<Aptogotchi>(aptogotchi_address);
        (aptogotchi.live, aptogotchi.health, aptogotchi.parts)
    }

    // ================================= Helpers ================================= //

    fun get_collection_address(): address {
        object::create_object_address(&@aptogotchi_addr, COLLECTION_OWNER_OBJ_SEED)
    }

    fun get_collection_signer(collection_address: address): signer acquires CollectionOwnerConfig {
        object::generate_signer_for_extending(&borrow_global<CollectionOwnerConfig>(collection_address).extend_ref)
    }

    fun get_aptogotchi_signer(aptogotchi_address: address): signer acquires Aptogotchi {
        object::generate_signer_for_extending(&borrow_global<Aptogotchi>(aptogotchi_address).extend_ref)
    }

    fun create_aptogotchi_internal(user: &signer): address acquires CollectionOwnerConfig {
        let body = randomness::u8_range(0, BODY_MAX_VALUE_EXCL);
        let ear = randomness::u8_range(0, EAR_MAX_VALUE_EXCL);
        let face = randomness::u8_range(0, FACE_MAX_VALUE_EXCL);

        let uri = string::utf8(APTOGOTCHI_COLLECTION_URI);
        let description = string::utf8(APTOGOTCHI_COLLECTION_DESCRIPTION);
        let user_address = signer::address_of(user);
        let token_name = string_utils::to_string(&user_address);
        let parts = AptogotchiParts {
            body,
            ear,
            face,
        };

        let collection_address = get_collection_address();
        let constructor_ref = &token::create(
            &get_collection_signer(collection_address),
            string::utf8(APTOGOTCHI_COLLECTION_NAME),
            description,
            token_name,
            option::none(),
            uri,
        );

        let token_signer_ref = &object::generate_signer(constructor_ref);
        let aptogotchi_address = signer::address_of(token_signer_ref);

        let extend_ref = object::generate_extend_ref(constructor_ref);
        let mutator_ref = token::generate_mutator_ref(constructor_ref);
        let burn_ref = token::generate_burn_ref(constructor_ref);
        let transfer_ref = object::generate_transfer_ref(constructor_ref);

        // Initialize and set default Aptogotchi struct values
        let aptogotchi = Aptogotchi {
            live: true,
            health: DEFAULT_BEGINNING_HEALTH,
            parts,
            extend_ref,
            mutator_ref,
            burn_ref,
        };
        move_to(token_signer_ref, aptogotchi);

        // Emit event for minting Aptogotchi token
        event::emit<MintAptogotchiEvent>(
            MintAptogotchiEvent {
                aptogotchi_address: signer::address_of(token_signer_ref),
                token_name,
                parts,
            },
        );

        // Transfer the Aptogotchi to the user
        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), signer::address_of(user));

        aptogotchi_address
    }

    // Throw error if Aptogotchi does not exist or is dead
    fun check_aptogotchi_exist_and_live(aptogotchi_address: address) acquires Aptogotchi {
        let exist_aptogotchi = exists<Aptogotchi>(aptogotchi_address);
        assert!(exist_aptogotchi, EAPTOGOTCHI_NOT_EXIST);

        let aptogotchi_ref = borrow_global<Aptogotchi>(aptogotchi_address);
        assert!(aptogotchi_ref.live, EDEAD_APTOGOTCHI_CANNOT_MOVE)
    }

    // ================================= Uint Tests ================================== //

    #[test_only]
    use aptos_framework::account::create_account_for_test;
    #[test_only]
    use aptos_std::crypto_algebra::enable_cryptography_algebra_natives;

    #[test_only]
    public fun init_module_for_test(aptos_framework: &signer, deployer: &signer, user: &signer) {
        enable_cryptography_algebra_natives(aptos_framework);
        randomness::initialize_for_testing(aptos_framework);
        randomness::set_seed(x"0000000000000000000000000000000000000000000000000000000000000000");

        // create a fake account (only for testing purposes)
        create_account_for_test(signer::address_of(deployer));
        create_account_for_test(signer::address_of(user));

        init_module(deployer)
    }

    #[test(
        aptos_framework = @aptos_framework,
        deployer = @aptogotchi_addr,
        user = @0x123
    )]
    fun test_create_aptogotchi(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer
    ) acquires CollectionOwnerConfig, Aptogotchi {
        init_module_for_test(aptos_framework, deployer, user);
        let aptogotchi_address = create_aptogotchi_internal(user);
        let (live, health, _) = get_aptogotchi(aptogotchi_address);
        assert!(live, 1);
        assert!(health == DEFAULT_BEGINNING_HEALTH, 2)
    }

    #[test(
        aptos_framework = @aptos_framework,
        deployer = @aptogotchi_addr,
        user = @0x123
    )]
    fun test_move_happy_path(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer
    ) acquires CollectionOwnerConfig, Aptogotchi {
        init_module_for_test(aptos_framework, deployer, user);
        let aptogotchi_address = create_aptogotchi_internal(user);
        make_random_move(aptogotchi_address);
        make_random_move(aptogotchi_address);
        make_random_move(aptogotchi_address);
        let (live, health, _) = get_aptogotchi(aptogotchi_address);
        assert!(live, 1);
        assert!(health == DEFAULT_BEGINNING_HEALTH - 3, 2)
    }

    #[test(
        aptos_framework = @aptos_framework,
        deployer = @aptogotchi_addr,
        user = @0x123
    )]
    #[expected_failure(abort_code = EAPTOGOTCHI_NOT_EXIST, location = aptogotchi_addr::aptogotchi)]
    fun test_cannot_move_when_aptogotchi_not_exist(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer
    ) acquires Aptogotchi {
        init_module_for_test(aptos_framework, deployer, user);
        let user_address = signer::address_of(user);
        make_random_move(user_address)
    }

    #[test(
        aptos_framework = @aptos_framework,
        deployer = @aptogotchi_addr,
        user = @0x123
    )]
    #[expected_failure(abort_code = EDEAD_APTOGOTCHI_CANNOT_MOVE, location = aptogotchi_addr::aptogotchi)]
    fun test_cannot_move_dead_aptogotchi(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer
    ) acquires CollectionOwnerConfig, Aptogotchi {
        init_module_for_test(aptos_framework, deployer, user);
        let aptogotchi_address = create_aptogotchi_internal(user);
        // Initial health is 5, so we make 5 random moves to decrease health to 0 and kill the Aptogotchi
        make_random_move(aptogotchi_address);
        make_random_move(aptogotchi_address);
        make_random_move(aptogotchi_address);
        make_random_move(aptogotchi_address);
        make_random_move(aptogotchi_address);
        // Aptogotchi is dead now, so it throws dead aptogotchi cannot move error
        make_random_move(aptogotchi_address)
    }
}
