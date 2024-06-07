address marketplace {
/// Defines a single listing or an item for sale or auction. This is an escrow service that
/// enables two parties to exchange one asset for another.

module nft_listing {
    use std::error;
    use std::signer;
    use std::string::{String};
    use std::vector;
    use std::bcs::{to_bytes};
    use std::option::{Self, Option, extract};

    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::object::{
        Self,
        ConstructorRef,
        Object,
        ObjectCore
    };
    use aptos_token_objects::token;
    use aptos_token_objects::collection;
    use aptos_std::ed25519::{
        signature_verify_strict_t,
        ValidatedPublicKey,
        Signature,
        new_validated_public_key_from_bytes,
        public_key_to_unvalidated,
        new_signature_from_bytes,
    };

    use marketplace::events;
    use marketplace::listing::{Self, Listing};
    use aptos_framework::aptos_account;
    use aptos_framework::account;

    /// There exists no listing.
    const ENO_LISTING: u64 = 1;
    /// Given seller is not an actual seller
    const ENOT_SELLER: u64 = 2;
    /// The sign is invalid
    const EINVALID_SIGN: u64 = 3;
    /// caller is not the module admin
    const ENO_NOT_MODULE_ADMIN:u64=4;
    /// Accessable only by the Admin
    const EINVALID_ADMIN: u64 = 5;
    /// only valid collections can be transacted
    const EINVAILD_COLLECTION: u64 = 6;
    /// collection already exists in whitelist
    const ECOLLECTION_EXIST: u64 = 7;
    /// collection not exists in whitelist
    const ECOLLECTION_NOT_EXIST: u64 = 8;
    /// trying to assign same signer
    const ESAME_SIGNER:u64 = 9;
    /// trying to assign same admin
    const ESAME_ADMIN:u64 = 10;

    /// Fixed-price market place listing.
    struct FixedPriceListing<phantom CoinType> has key {
        /// The price to purchase the item up for listing.
        price: u64,
    }

    // access control mechanism
    struct AccessControll has key {
        admin_addr: address,
        valid_collection_address: vector<address>,
        signer_public_key: ValidatedPublicKey,
        signer_address: address,
    }

    // Token metadata
    struct TokenMetadata has drop, store {
        creator_address: address,
        collection_name: String,
        token_name: String,
    }

    // Sign message
    struct MesssageData has copy, drop {
        listing_addr: address,
        purchaser_addr: address,
        sequence_number: u64,
        salt: u64,
    }

    // init function
    fun init_module(account: &signer) {

        let owner_addr = signer::address_of(account);
        assert!(owner_addr==@ marketplace, ENO_NOT_MODULE_ADMIN);

        let pub_key = @ ownerPublicKey;
        let pub_key_toBytes = to_bytes(&pub_key);

        let validated_publicKey = extract(&mut new_validated_public_key_from_bytes(
            pub_key_toBytes
        ));

        move_to<AccessControll>(account,
            AccessControll {
                admin_addr: @ marketplace,
                valid_collection_address: vector::empty<address>(),
                signer_public_key: validated_publicKey,
                signer_address: owner_addr,
            });
    }

    // Listing function
    public entry fun listing<CoinType>(
        seller: &signer,
        object: Object<ObjectCore>,
        price: u64,
    ) acquires AccessControll {

        let token_metadata = token_metadata(object::convert(object));
        let collection_addr = collection::create_collection_address(
            &token_metadata.creator_address,
            &token_metadata.collection_name
        );
        verify_collection(collection_addr);

        listing_internal<CoinType>(seller, object, price);
    }

    // Internal function for getting token metadata
    inline fun token_metadata(token: Object<token::Token>): TokenMetadata {
        TokenMetadata {
            creator_address: token::creator(token),
            collection_name: token::collection_name(token),
            token_name: token::name(token),
        }
    }

    // listing internal function
    public(friend) fun listing_internal<CoinType>(
        seller: &signer,
        object: Object<ObjectCore>,
        price: u64,
    ): Object<Listing> {
        let (listing_signer, constructor_ref) = init<CoinType>(
            seller,
            object
        );

        let fixed_price_listing = FixedPriceListing<CoinType> {
            price,
        };
        move_to(&listing_signer, fixed_price_listing);

        let listing = object::object_from_constructor_ref(&constructor_ref);

        events::emit_listing_placed(
            object::object_address(&listing),
            signer::address_of(seller),
            price,
            listing::token_metadata(listing),
        );

        listing
    }

    // init function
    inline fun init<CoinType>(
        seller: &signer,
        object: Object<ObjectCore>,
    ): (signer, ConstructorRef) {

        listing::init(seller, object)
    }

    /// Purchase outright an item from a fixed price listing.
    public entry fun purchase<CoinType>(
        purchaser: &signer,
        object: Object<Listing>,
        signature: vector<u8>,
        salt: u64,
    ) acquires FixedPriceListing, AccessControll {

        let purchaser_addr = signer::address_of(purchaser);
        let listing_addr = listing::assert_started(&object);
        let sequence_number =  account::get_sequence_number(purchaser_addr);

        signVerification(signature, listing_addr, purchaser_addr, sequence_number, salt);

        // Retrieve the purchase price on a fixed price listing.
        let price = if (exists<FixedPriceListing<CoinType>>(listing_addr)) {
            let FixedPriceListing {
                price,
            } = move_from<FixedPriceListing<CoinType>>(listing_addr);
            price
        } else {
            // This should just be an abort but the compiler errors.
            abort (error::not_found(ENO_LISTING))
        };
        let coins = coin::withdraw<CoinType>(purchaser, price);
        complete_purchase(signer::address_of(purchaser), object, coins)
    }

    // internal function for sign verification
    inline fun signVerification (
        sign: vector<u8>,
        listing_addr: address,
        purchaser_addr: address,
        sequence_number: u64,
        salt: u64,
    ) {
        let access_controll = borrow_global<AccessControll>(@ marketplace);
        let validated_public_key = access_controll.signer_public_key;
        let unvalidated_public_key = public_key_to_unvalidated(&validated_public_key);
        let signature_from_bytes:Signature = new_signature_from_bytes(sign);
        let msg = MesssageData {
            listing_addr: listing_addr,
            purchaser_addr: purchaser_addr,
            sequence_number: sequence_number,
            salt: salt,
        };
        assert!(signature_verify_strict_t(
            &signature_from_bytes,
            &unvalidated_public_key,
            copy msg
        ), error::permission_denied(EINVALID_SIGN));
    }

    /// End a fixed price listing early.
    public entry fun delisting<CoinType>(
        seller: &signer,
        object: Object<Listing>,
    ) acquires FixedPriceListing {

        let token_metadata = listing::token_metadata(object);

        let expected_seller_addr = signer::address_of(seller);
        let actual_seller_addr = listing::close(object, expected_seller_addr);
        assert!(expected_seller_addr == actual_seller_addr, error::permission_denied(ENOT_SELLER));

        let listing_addr = object::object_address(&object);
        assert!(exists<FixedPriceListing<CoinType>>(listing_addr), error::not_found(ENO_LISTING));
        let FixedPriceListing {
            price,
        } = move_from<FixedPriceListing<CoinType>>(listing_addr);

        events::emit_listing_cancelled(
            listing_addr,
            actual_seller_addr,
            price,
            token_metadata,
        );
    }

    // internal function to complete purchase
    inline fun complete_purchase<CoinType>(
        purchaser_addr: address,
        object: Object<Listing>,
        coins: Coin<CoinType>,
    ) {
        let token_metadata = listing::token_metadata(object);

        let price = coin::value(&coins);
        let (royalty_addr, royalty_charge) = listing::compute_royalty(object, price);
        let (seller) = listing::close(object, purchaser_addr);

        // Take royalty first
        if (royalty_charge != 0) {
            let royalty = coin::extract(&mut coins, royalty_charge);
            aptos_account::deposit_coins(royalty_addr, royalty);
        };

        // Seller gets what is left
        aptos_account::deposit_coins(seller, coins);

        events::emit_listing_filled(
            object::object_address(&object),
            seller,
            purchaser_addr,
            price,
            royalty_charge,
            token_metadata,
        );
    }

    // internal function to verify validity of collection
    inline fun verify_collection(collection_address: address) acquires AccessControll{
        let access_controll = borrow_global<AccessControll>(@ marketplace);
        let validate = vector::contains(
            &access_controll.valid_collection_address,
            &collection_address
        );
        assert!(validate,EINVAILD_COLLECTION);
    }

    // function to change admin
    public entry fun set_admin (
        module_owner: &signer,
        new_admin: address
    ) acquires AccessControll {
        let access_controll = borrow_global_mut<AccessControll>(@ marketplace);
        let current_admin_addr = access_controll.admin_addr;
        let caller_addr = signer::address_of(module_owner);
        assert!(current_admin_addr == caller_addr, ENO_NOT_MODULE_ADMIN);
        assert!(new_admin != current_admin_addr, ESAME_ADMIN);
        access_controll.admin_addr = new_admin;

        events::emit_admin_changed (
            current_admin_addr,
            new_admin,
        );
    }

    // function to set collection whitelist
    public entry fun set_collection_whitelist(
        caller: &signer,
        valid_collection_address: vector<address>
    ) acquires AccessControll {
        let caller_addr = signer::address_of(caller);
        let access_controll = borrow_global_mut<AccessControll>(@ marketplace);
        assert!(caller_addr == access_controll.admin_addr,EINVALID_ADMIN);
        vector::for_each(valid_collection_address, |_signer|{
            // assert!(!vector::contains(&mut access_controll.valid_collection_address, &_signer), COLLECTION_EXIST);
            if(!vector::contains(&mut access_controll.valid_collection_address, &_signer)){
                vector::push_back(&mut access_controll.valid_collection_address, _signer);
            } else {
                assert!(false, ECOLLECTION_EXIST);
            }
        });

        events::emit_collection_whitelisted (
            valid_collection_address
        );
    }

    // function to remove collection from whitelist
    public entry fun remove_collection_whitelist(
        caller: &signer,
        delisting_collection_address: vector<address>
    ) acquires AccessControll {
        let caller_addr = signer::address_of(caller);
        let access_controll = borrow_global_mut<AccessControll>(@ marketplace);
        assert!(caller_addr == access_controll.admin_addr,EINVALID_ADMIN);
        vector::for_each(delisting_collection_address, |_signer|{
            // assert!(vector::contains(&mut access_controll.valid_collection_address, &_signer), COLLECTION_NOT_EXIST);
            if(vector::contains(&mut access_controll.valid_collection_address, &_signer)){
                vector:: remove_value(&mut access_controll.valid_collection_address, &_signer);
            } else {
                assert!(false, ECOLLECTION_NOT_EXIST);
            }
        });

        events::emit_collection_delisted (
            delisting_collection_address
        );
    }

    // function to set signer
    public entry fun set_signer(
        account: &signer,
        signer_address: address,
        signer_public_key_input: address
    ) acquires AccessControll {
        let access_controll = borrow_global_mut<AccessControll>(@ marketplace);
        let account_addr = signer::address_of(account);
        let validated_public_key = extract(&mut new_validated_public_key_from_bytes(
            to_bytes(&signer_public_key_input)
        ));
        assert!(account_addr == access_controll.admin_addr,EINVALID_ADMIN);
        assert!(validated_public_key != access_controll.signer_public_key &&
            signer_address != access_controll.signer_address, ESAME_SIGNER);
        let old_signer_addr = access_controll.signer_address;
        access_controll.signer_public_key = validated_public_key;
        access_controll.signer_address = signer_address;

        events::emit_signer_assigned (
            old_signer_addr,
            signer_address
        );
    }

    // view functions

    // public function to view the price of the fixed price lisiting
    #[view]
    public fun price<CoinType>(
        object: Object<Listing>,
    ): Option<u64> acquires FixedPriceListing {
        let listing_addr = object::object_address(&object);
        if (exists<FixedPriceListing<CoinType>>(listing_addr)) {
            let fixed_price = borrow_global<FixedPriceListing<CoinType>>(listing_addr);
            option::some(fixed_price.price)
        } else {
            // This should just be an abort but the compiler errors.
            assert!(false, error::not_found(ENO_LISTING));
            option::none()
        }
    }

    // function to get admin address
    #[view]
    public fun admin_addr(): address acquires AccessControll {
        let access_controll = borrow_global_mut<AccessControll>(@ marketplace);
        access_controll.admin_addr
    }

    // function to get signer address
    #[view]
    public fun signer_addr(): address acquires AccessControll {
        let access_controll = borrow_global_mut<AccessControll>(@ marketplace);
        access_controll.signer_address
    }

    // function to get whitelisted collection
    #[view]
    public fun whitelisted_collections(): vector<address> acquires AccessControll {
        let access_controll = borrow_global_mut<AccessControll>(@ marketplace);
        access_controll.valid_collection_address
    }
}
}