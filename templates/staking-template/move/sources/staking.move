module staking_addr::staking {
    use std::signer;

    use aptos_std::table::{Self, Table};

    use aptos_framework::fungible_asset::{Self, Metadata, FungibleStore};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;

    friend staking_addr::reward;

    // ================================= Errors ================================= //
    /// user tries to stake more than owned
    const ENOT_ENOUGH_BALANCE_TO_STAKE: u64 = 1;
    /// user tries to unstake more than staked
    const ENOT_ENOUGH_BALANCE_TO_UNSTAKE: u64 = 2;
    /// User does not have any stake
    const EUSER_DOESN_NOT_HAVE_STAKE: u64 = 3;

    struct Staking has key {
        // fungible asset stakers are staking
        // TODO: need better naming
        staked_fa_metadata_object: Object<Metadata>,
        // key is staker address, value is stake data
        stakes: Table<address, Object<FungibleStore>>,
        // total stake in the contract
        total_stake: u64,
    }

    /// If you deploy the module under an object, sender is the object's signer
    /// If you deploy the module under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        move_to(sender, Staking {
            staked_fa_metadata_object: object::address_to_object<Metadata>(@staked_fa_obj_addr),
            stakes: table::new(),
            total_stake: 0,
        });
    }

    // ================================= Entry Functions ================================= //

    public(friend) fun stake(sender: &signer, amount: u64) acquires Staking {
        let sender_addr = signer::address_of(sender);
        let staked_fa_metadata_object = get_staked_fa_metadata_object();
        assert!(
            primary_fungible_store::balance(sender_addr, staked_fa_metadata_object) >= amount,
            ENOT_ENOUGH_BALANCE_TO_STAKE
        );

        let staking = borrow_global_mut<Staking>(@staking_addr);
        staking.total_stake = staking.total_stake + amount;
        let stakes = &mut staking.stakes;

        if (table::contains(stakes, sender_addr)) {
            let fungible_store = *table::borrow(stakes, sender_addr);
            fungible_asset::transfer(
                sender,
                primary_fungible_store::primary_store(sender_addr, staked_fa_metadata_object),
                fungible_store,
                amount
            );
        } else {
            let fungible_store_object_constructor_ref = &object::create_object(sender_addr);
            let fungible_store = fungible_asset::create_store(
                fungible_store_object_constructor_ref,
                staked_fa_metadata_object
            );
            fungible_asset::transfer(
                sender,
                primary_fungible_store::primary_store(sender_addr, staked_fa_metadata_object),
                fungible_store,
                amount
            );
            table::add(stakes, sender_addr, fungible_store);
        };
    }

    public(friend) fun unstake(sender: &signer, amount: u64) acquires Staking {
        let sender_addr = signer::address_of(sender);
        let staked_fa_metadata_object = get_staked_fa_metadata_object();

        let stakes = &mut borrow_global_mut<Staking>(@staking_addr).stakes;
        assert!(table::contains(stakes, sender_addr), EUSER_DOESN_NOT_HAVE_STAKE);

        let fungible_store = *table::borrow(stakes, sender_addr);
        assert!(fungible_asset::balance(fungible_store) >= amount, ENOT_ENOUGH_BALANCE_TO_UNSTAKE);

        fungible_asset::transfer(
            sender,
            fungible_store,
            primary_fungible_store::primary_store(sender_addr, staked_fa_metadata_object),
            amount
        );
    }

    // ================================= View Functions ================================= //

    #[view]
    public fun get_staked_fa_metadata_object(): Object<Metadata> acquires Staking {
        let staking = borrow_global<Staking>(@staking_addr);
        staking.staked_fa_metadata_object
    }

    #[view]
    public fun get_staked_balance(user_addr: address): u64 acquires Staking {
        let staking = borrow_global<Staking>(@staking_addr);
        if (table::contains(&staking.stakes, user_addr)) {
            let fungible_store = *table::borrow(&staking.stakes, user_addr);
            fungible_asset::balance(fungible_store)
        } else {
            0
        }
    }

    #[view]
    public fun get_total_stake(): u64 acquires Staking {
        borrow_global<Staking>(@staking_addr).total_stake
    }

    // ================================= Helper Functions ================================= //

    // ================================= Unit Tests ================================= //
}
