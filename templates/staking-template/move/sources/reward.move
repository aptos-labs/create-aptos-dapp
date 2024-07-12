module staking_addr::reward {
    use std::option::{Self, Option};
    use std::signer;

    use aptos_std::table::{Self, Table};

    use aptos_framework::fungible_asset::{Self, Metadata, FungibleStore};
    use aptos_framework::object::{Self, Object, ObjectCore, ExtendRef, create_object};
    use aptos_framework::primary_fungible_store;

    use staking_addr::staking;

    use aptos_framework::block::get_current_block_height;

    /// Only admin can set pending admin
    const EONLY_ADMIN_CAN_SET_PENDING_ADMIN: u64 = 1;
    /// Sender is not pending admin
    const ENOT_PENDING_ADMIN: u64 = 2;
    /// Only admin can setup reward
    const EONLY_ADMIN_CAN_SETUP_REWARD: u64 = 3;
    /// User does not have stake
    const EUSER_DOESN_NOT_HAVE_STAKE: u64 = 4;

    struct UserData has store {
        scaling_factor: u128,
        pending_reward: u64,
    }

    struct FungibleStoreOwner has key {
        extend_ref: ExtendRef,
        fungible_store_object: Object<FungibleStore>,
    }

    struct Reward has key {
        reward_fa_metadata_object: Object<Metadata>,
        fungible_store_owner_object: Object<ObjectCore>,
        // scaling factor to represent user's share among all stakers
        global_scaling_factor: u128,
        users_staking_factor: Table<address, UserData>,
    }

    struct Config has key {
        admin: address,
        pending_admin: Option<address>,
    }

    /// If you deploy the module under an object, sender is the object's signer
    /// If you deploy the module under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        let sender_addr = signer::address_of(sender);
        let reward_fa_metadata_object = object::address_to_object<Metadata>(@reward_fa_obj_addr);

        let fungible_store_owner_object_constructor_ref = &create_object(sender_addr);
        let fungible_store_object_constructor_ref = &object::create_object(
            object::address_from_constructor_ref(fungible_store_owner_object_constructor_ref)
        );
        let fungible_store_object = fungible_asset::create_store(
            fungible_store_object_constructor_ref,
            reward_fa_metadata_object
        );
        move_to(&object::generate_signer(fungible_store_owner_object_constructor_ref),
            FungibleStoreOwner {
                extend_ref: object::generate_extend_ref(fungible_store_owner_object_constructor_ref),
                fungible_store_object,
            }
        );

        move_to(sender, Reward {
            reward_fa_metadata_object,
            fungible_store_owner_object: object::object_from_constructor_ref(
                fungible_store_owner_object_constructor_ref
            ),
            global_scaling_factor: 0,
            users_staking_factor: table::new(),
        });
        move_to(sender, Config {
            admin: sender_addr,
            pending_admin: option::none(),
        });
    }

    // ================================= Entry Functions ================================= //

    /// Set pending admin of the contract, then pending admin can call accept_admin to become admin
    public entry fun set_pending_admin(sender: &signer, new_admin: address) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@staking_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_SET_PENDING_ADMIN);
        config.pending_admin = option::some(new_admin);
    }

    /// Accept admin of the contract
    public entry fun accept_admin(sender: &signer) acquires Config {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global_mut<Config>(@staking_addr);
        assert!(config.pending_admin == option::some(sender_addr), ENOT_PENDING_ADMIN);
        config.admin = sender_addr;
        config.pending_admin = option::none();
    }

    public entry fun add_reward(sender: &signer, amount: u64) acquires Config, Reward, FungibleStoreOwner {
        let sender_addr = signer::address_of(sender);
        let config = borrow_global<Config>(@staking_addr);
        assert!(is_admin(config, sender_addr), EONLY_ADMIN_CAN_SETUP_REWARD);

        let reward_fa_metadata_object = get_reward_fa_metadata_object();
        primary_fungible_store::transfer(
            sender,
            reward_fa_metadata_object,
            object::object_address(&get_fungible_store_object()),
            amount
        );

        let reward = borrow_global_mut<Reward>(@staking_addr);
        reward.global_scaling_factor = reward.global_scaling_factor + ((amount / staking::get_total_stake()) as u128);
    }

    public entry fun claim_reward(sender: &signer) acquires Reward, FungibleStoreOwner {
        let sender_addr = signer::address_of(sender);
        assert!(table::contains(&borrow_global<Reward>(@staking_addr).users_staking_factor, sender_addr), EUSER_DOESN_NOT_HAVE_STAKE);

        let pending_reward = get_user_pending_reward(sender_addr);
        fungible_asset::transfer(
            &get_fungible_store_owner_object_signer(),
            get_fungible_store_object(),
            primary_fungible_store::primary_store(sender_addr, get_reward_fa_metadata_object()),
            pending_reward
        );

        let reward = borrow_global_mut<Reward>(@staking_addr);
        let user_data = table::borrow_mut(&mut reward.users_staking_factor, sender_addr);
        user_data.pending_reward = 0;
        user_data.scaling_factor = reward.global_scaling_factor;
    }

    public entry fun stake(sender: &signer, amount: u64) acquires Reward {
        let sender_addr = signer::address_of(sender);
        let reward = borrow_global_mut<Reward>(@staking_addr);
        if (table::contains(&reward.users_staking_factor, sender_addr)) {
            let user_data = table::borrow_mut(&mut reward.users_staking_factor, sender_addr);
            user_data.scaling_factor = reward.global_scaling_factor;
            let new_reward = (reward.global_scaling_factor - user_data.scaling_factor) * (staking::get_staked_balance(
                sender_addr
            ) as u128);
            user_data.pending_reward = (new_reward as u64) + user_data.pending_reward;
        } else {
            table::add(&mut reward.users_staking_factor, sender_addr, UserData {
                scaling_factor: reward.global_scaling_factor,
                pending_reward: 0,
            });
        };

        staking::stake(sender, amount);
    }

    public entry fun unstake(sender: &signer, amount: u64) acquires Reward {
        let sender_addr = signer::address_of(sender);
        let reward = borrow_global_mut<Reward>(@staking_addr);
        assert!(table::contains(&reward.users_staking_factor, sender_addr), EUSER_DOESN_NOT_HAVE_STAKE);
        let user_data = table::borrow_mut(&mut reward.users_staking_factor, sender_addr);
        user_data.scaling_factor = reward.global_scaling_factor;
        let new_reward = (reward.global_scaling_factor - user_data.scaling_factor) * (staking::get_staked_balance(
            sender_addr
        ) as u128);
        user_data.pending_reward = (new_reward as u64) + user_data.pending_reward;

        staking::unstake(sender, amount);
    }

    // ================================= View Functions ================================= //

    #[view]
    /// Get contract admin
    public fun get_admin(): address acquires Config {
        borrow_global<Config>(@staking_addr).admin
    }

    #[view]
    /// Get contract pending admin
    public fun get_pendinga_dmin(): Option<address> acquires Config {
        borrow_global<Config>(@staking_addr).pending_admin
    }

    #[view]
    public fun get_reward_fa_metadata_object(): Object<Metadata> acquires Reward {
        borrow_global<Reward>(@staking_addr).reward_fa_metadata_object
    }

    #[view]
    public fun get_total_available_rewards(): u64 acquires Reward, FungibleStoreOwner {
        fungible_asset::balance(get_fungible_store_object())
    }

    #[view]
    public fun get_user_pending_reward(user_addr: address): u64 acquires Reward {
        let reward = borrow_global<Reward>(@staking_addr);
        let users_staking_factor = &reward.users_staking_factor;
        if (table::contains(users_staking_factor, user_addr)) {
            let user_data = table::borrow(users_staking_factor, user_addr);
            let new_reward = (reward.global_scaling_factor - user_data.scaling_factor) * (staking::get_staked_balance(
                user_addr
            ) as u128);
            (new_reward as u64) + user_data.pending_reward
        } else {
            0
        }
    }

    // ================================= Helper Functions ================================= //

    /// Check if sender is admin or owner of the object when package is published to object
    fun is_admin(config: &Config, sender: address): bool {
        if (sender == config.admin) {
            true
        } else {
            if (object::is_object(@staking_addr)) {
                let obj = object::address_to_object<ObjectCore>(@staking_addr);
                object::is_owner(obj, sender)
            } else {
                false
            }
        }
    }

    fun get_fungible_store_object(): Object<FungibleStore> acquires Reward, FungibleStoreOwner {
        let reward = borrow_global<Reward>(@staking_addr);
        borrow_global<FungibleStoreOwner>(
            object::object_address(&reward.fungible_store_owner_object)
        ).fungible_store_object
    }

    fun get_fungible_store_owner_object_signer(): signer acquires Reward, FungibleStoreOwner {
        let reward = borrow_global<Reward>(@staking_addr);
        object::generate_signer_for_extending(&borrow_global<FungibleStoreOwner>(
            object::object_address(&reward.fungible_store_owner_object)
        ).extend_ref)
    }

    // ================================= Unit Tests ================================= //
}
