module aptos_friend_addr::aptos_friend {
    use std::bcs;
    use std::signer;
    use std::string::String;
    use std::vector;

    use aptos_std::math64;
    use aptos_std::string_utils;

    use aptos_framework::aptos_account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_framework::object::{Self, Object, ExtendRef};

    /// User already issued share
    const ERR_USER_ALREADY_ISSUED_SHARE: u64 = 1;
    /// Insufficient balance
    const ERR_INSUFFICIENT_BALANCE: u64 = 2;
    /// Holding does not exist
    const ERR_HOLDING_NOT_EXIST: u64 = 3;
    /// User does not exist
    const ERR_USER_NOT_EXIST: u64 = 4;
    /// Holder does not exist
    const ERR_HOLDER_NOT_EXIST: u64 = 5;
    /// Not enough shares to sell
    const ERR_NOT_ENOUGH_SHARES_TO_SELL: u64 = 6;
    /// Issuer cannot sell last share
    const ERR_ISSUER_CANNOT_SELL_LAST_SHARE: u64 = 7;

    struct Holding has key {
        issuer: address,
        holder: address,
        shares: u64,
    }

    struct User has key {
        holdings: vector<Object<Holding>>,
    }

    struct Issuer has key {
        addr: address,
        username: String,
        total_issued_shares: u64,
        holder_holdings: vector<Object<Holding>>,
    }

    struct IssuerRegistry has key {
        issuers: vector<Object<Issuer>>
    }

    struct Vault has key {
        addr: address,
        extend_ref: ExtendRef,
    }

    #[event]
    struct IssueShareEvent has store, drop {
        issuer_addr: address,
        issuer_obj: Object<Issuer>,
        username: String,
    }

    #[event]
    struct BuyShareEvent has store, drop {
        issuer_addr: address,
        issuer_obj: Object<Issuer>,
        buyer_addr: address,
        buyer_user_obj: Object<User>,
        amount: u64,
        share_cost: u64,
        issuer_fee: u64,
        protocol_fee: u64,
        total_cost: u64,
    }

    #[event]
    struct SellShareEvent has store, drop {
        issuer_addr: address,
        issuer_obj: Object<Issuer>,
        seller_addr: address,
        seller_user_obj: Object<User>,
        amount: u64,
        share_cost: u64,
        issuer_fee: u64,
        protocol_fee: u64,
        total_cost: u64,
    }

    // If you deploy the module under an object, sender is the object's signer
    // If you deploy the moduelr under your own account, sender is your account's signer
    fun init_module(sender: &signer) {
        let vault_constructor_ref = &object::create_sticky_object(signer::address_of(sender));
        let vault_signer = &object::generate_signer(vault_constructor_ref);

        move_to(sender, Vault {
            addr: signer::address_of(vault_signer),
            extend_ref: object::generate_extend_ref(vault_constructor_ref),
        });
        move_to(sender, IssuerRegistry {
            issuers: vector::empty()
        });
    }

    // ================================= Entry Functions ================================= //

    public entry fun issue_share(
        sender: &signer,
        username: String,
    ) acquires User, IssuerRegistry {
        let sender_addr = signer::address_of(sender);
        assert!(!exists<Issuer>(get_issuer_obj_addr(sender_addr)), ERR_USER_ALREADY_ISSUED_SHARE);
        let issuer_obj_constructor_ref = &object::create_named_object(
            sender,
            construct_issuer_object_seed(sender_addr)
        );
        let issuer_obj_signer = object::generate_signer(issuer_obj_constructor_ref);

        let holding_obj_constructor_ref = &object::create_named_object(
            sender,
            construct_holding_object_seed(sender_addr, sender_addr)
        );
        let holding_obj_signer = object::generate_signer(holding_obj_constructor_ref);

        move_to(&holding_obj_signer, Holding {
            issuer: sender_addr,
            holder: sender_addr,
            shares: 1,
        });

        move_to(&issuer_obj_signer, Issuer {
            addr: sender_addr,
            username,
            total_issued_shares: 1,
            holder_holdings: vector[get_holding_obj(sender_addr, sender_addr)],
        });

        if (exists<User>(get_user_obj_addr(sender_addr))) {
            let user_obj = borrow_global_mut<User>(get_user_obj_addr(sender_addr));
            vector::push_back(&mut user_obj.holdings, get_holding_obj(sender_addr, sender_addr));
        } else {
            let user_obj_constructor_ref = &object::create_named_object(
                sender,
                construct_user_object_seed(sender_addr)
            );
            let user_obj_signer = object::generate_signer(user_obj_constructor_ref);
            move_to(&user_obj_signer, User {
                holdings: vector[get_holding_obj(sender_addr, sender_addr)],
            });
        };

        let registry = borrow_global_mut<IssuerRegistry>(@aptos_friend_addr);
        vector::push_back(&mut registry.issuers, get_issuer_obj(sender_addr));

        event::emit(IssueShareEvent {
            issuer_addr: sender_addr,
            issuer_obj: get_issuer_obj(sender_addr),
            username,
        });
    }

    public entry fun buy_share(
        sender: &signer,
        issuer_obj: Object<Issuer>,
        amount: u64,
    ) acquires Issuer, Holding, User, Vault {
        let sender_addr = signer::address_of(sender);
        let (share_cost, issuer_fee, protocol_fee, total_cost) = calculate_buy_share_cost(issuer_obj, amount);
        assert!(coin::balance<AptosCoin>(sender_addr) >= total_cost, ERR_INSUFFICIENT_BALANCE);

        let issuer = borrow_global_mut<Issuer>(object::object_address(&issuer_obj));
        let issuer_addr = issuer.addr;
        issuer.total_issued_shares = issuer.total_issued_shares + amount;

        let holding_obj_addr = get_holding_obj_addr(issuer_addr, sender_addr);
        if (exists<Holding>(holding_obj_addr)) {
            // existing holder buys more shares
            let holding = borrow_global_mut<Holding>(holding_obj_addr);
            holding.shares = holding.shares + amount;
        } else {
            // new holder buys shares
            let holding_obj_constructor_ref = &object::create_named_object(
                sender,
                construct_holding_object_seed(issuer_addr, sender_addr)
            );
            let holding_obj_signer = object::generate_signer(holding_obj_constructor_ref);
            move_to(&holding_obj_signer, Holding {
                issuer: issuer_addr,
                holder: sender_addr,
                shares: amount,
            });

            vector::push_back(&mut issuer.holder_holdings, get_holding_obj(issuer_addr, sender_addr));

            let buyer_obj_addr = get_user_obj_addr(sender_addr);
            if (exists<User>(buyer_obj_addr)) {
                let buyer_obj = borrow_global_mut<User>(buyer_obj_addr);
                vector::push_back(&mut buyer_obj.holdings, get_holding_obj(issuer_addr, sender_addr));
            } else {
                let buyer_obj_constructor_ref = &object::create_named_object(
                    sender,
                    construct_user_object_seed(sender_addr)
                );
                let buyer_obj_signer = object::generate_signer(buyer_obj_constructor_ref);
                move_to(&buyer_obj_signer, User {
                    holdings: vector[get_holding_obj(issuer_addr, sender_addr)],
                });
            };
        };

        aptos_account::transfer(sender, get_vault_addr(), share_cost);
        aptos_account::transfer(sender, @aptos_friend_addr, protocol_fee);
        aptos_account::transfer(sender, issuer_addr, issuer_fee);

        event::emit(
            BuyShareEvent {
                issuer_addr,
                issuer_obj: get_issuer_obj(issuer_addr),
                buyer_addr: sender_addr,
                buyer_user_obj: get_user_obj(sender_addr),
                amount,
                share_cost,
                issuer_fee,
                protocol_fee,
                total_cost,
            }
        );
    }

    public entry fun sell_share(
        sender: &signer,
        issuer_obj: Object<Issuer>,
        amount: u64,
    ) acquires Issuer, Holding, User, Vault {
        let sender_addr = signer::address_of(sender);
        let (share_cost, issuer_fee, protocol_fee, total_cost) = calculate_sell_share_cost(issuer_obj, amount);
        assert!(coin::balance<AptosCoin>(sender_addr) >= total_cost, ERR_INSUFFICIENT_BALANCE);

        let issuer = borrow_global_mut<Issuer>(object::object_address(&issuer_obj));
        let issuer_addr = issuer.addr;

        let holding_obj_addr = get_holding_obj_addr(issuer_addr, sender_addr);
        assert!(exists<Holding>(holding_obj_addr), ERR_HOLDING_NOT_EXIST);

        let user_obj_addr = get_user_obj_addr(sender_addr);
        assert!(exists<User>(user_obj_addr), ERR_USER_NOT_EXIST);

        issuer.total_issued_shares = issuer.total_issued_shares - amount;

        let seller = borrow_global_mut<User>(user_obj_addr);

        let holding = borrow_global_mut<Holding>(holding_obj_addr);
        assert!(holding.shares >= amount, ERR_NOT_ENOUGH_SHARES_TO_SELL);
        assert!(sender_addr != issuer_addr || holding.shares > amount, ERR_ISSUER_CANNOT_SELL_LAST_SHARE);

        holding.shares = holding.shares - amount;

        let holding_obj = get_holding_obj(issuer_addr, sender_addr);

        if (holding.shares == 0) {
            let (found, idx) = vector::index_of(&mut issuer.holder_holdings, &holding_obj);
            assert!(found, ERR_HOLDER_NOT_EXIST);
            vector::remove(&mut issuer.holder_holdings, idx);

            let (found, idx) = vector::index_of(&mut seller.holdings, &holding_obj);
            assert!(found, ERR_HOLDING_NOT_EXIST);
            vector::remove(&mut seller.holdings, idx);
        };

        aptos_account::transfer(&get_vault_signer(), sender_addr, share_cost);
        aptos_account::transfer(sender, @aptos_friend_addr, protocol_fee);
        aptos_account::transfer(sender, issuer_addr, issuer_fee);

        event::emit(
            SellShareEvent {
                issuer_addr,
                issuer_obj: get_issuer_obj(issuer_addr),
                seller_addr: sender_addr,
                seller_user_obj: get_user_obj(sender_addr),
                amount,
                share_cost,
                issuer_fee,
                protocol_fee,
                total_cost,
            }
        );
    }

    // ================================= View Functions ================================== //

    #[view]
    public fun get_vault_addr(): address acquires Vault {
        let vault = borrow_global<Vault>(@aptos_friend_addr);
        vault.addr
    }

    #[view]
    public fun get_issuer_registry(): vector<Object<Issuer>> acquires IssuerRegistry {
        let registry = borrow_global<IssuerRegistry>(@aptos_friend_addr);
        registry.issuers
    }

    #[view]
    public fun has_issued_share(user_addr: address): bool {
        exists<Issuer>(get_issuer_obj_addr(user_addr))
    }

    #[view]
    public fun get_issuer_obj_addr(issuer_addr: address): address {
        let seed = construct_issuer_object_seed(issuer_addr);
        object::create_object_address(&issuer_addr, seed)
    }

    #[view]
    public fun get_user_obj_addr(user_addr: address): address {
        let seed = construct_user_object_seed(user_addr);
        object::create_object_address(&user_addr, seed)
    }

    #[view]
    public fun get_holding_obj_addr(issuer_addr: address, holder_addr: address): address {
        let seed = construct_holding_object_seed(issuer_addr, holder_addr);
        object::create_object_address(&holder_addr, seed)
    }

    #[view]
    public fun get_issuer_obj(issuer_addr: address): Object<Issuer> {
        object::address_to_object(get_issuer_obj_addr(issuer_addr))
    }

    #[view]
    public fun get_user_obj(user_addr: address): Object<User> {
        object::address_to_object(get_user_obj_addr(user_addr))
    }

    #[view]
    public fun get_holding_obj(issuer_addr: address, holder_addr: address): Object<Holding> {
        object::address_to_object(get_holding_obj_addr(issuer_addr, holder_addr))
    }

    #[view]
    public fun get_issuer(
        issuer_obj: Object<Issuer>
    ): (address, String, u64) acquires Issuer {
        let issuer = borrow_global<Issuer>(object::object_address(&issuer_obj));
        (issuer.addr, issuer.username, issuer.total_issued_shares)
    }

    #[view]
    public fun get_issuer_holder_holdings(issuer_obj: Object<Issuer>): vector<Object<Holding>> acquires Issuer {
        let issuer = borrow_global<Issuer>(object::object_address(&issuer_obj));
        issuer.holder_holdings
    }

    #[view]
    public fun get_user_holdings(user_obj: Object<User>): vector<Object<Holding>> acquires User {
        let user = borrow_global<User>(object::object_address(&user_obj));
        user.holdings
    }

    #[view]
    public fun get_holding(holding_obj: Object<Holding>): (address, address, u64) acquires Holding {
        let holding = borrow_global<Holding>(object::object_address(&holding_obj));
        (holding.issuer, holding.holder, holding.shares)
    }

    #[view]
    public fun calculate_buy_share_cost(issuer_obj: Object<Issuer>, amount: u64): (u64, u64, u64, u64) acquires Issuer {
        let issuer_obj_addr = object::object_address(&issuer_obj);
        let issuer = borrow_global<Issuer>(issuer_obj_addr);
        let old_supply = issuer.total_issued_shares;

        let share_cost = calculate_share_cost(old_supply, amount);
        let issuer_fee = share_cost * 5 / 100;
        let protocol_fee = share_cost * 5 / 100;
        let total_cost = share_cost + issuer_fee + protocol_fee;

        (share_cost, issuer_fee, protocol_fee, total_cost)
    }

    #[view]
    public fun calculate_sell_share_cost(issuer_obj: Object<Issuer>, amount: u64): (u64, u64, u64, u64) acquires Issuer {
        let issuer_obj_addr = object::object_address(&issuer_obj);
        let issuer = borrow_global<Issuer>(issuer_obj_addr);
        let old_supply = issuer.total_issued_shares;

        let share_cost = calculate_share_cost(old_supply - amount, amount);
        let issuer_fee = share_cost * 5 / 100;
        let protocol_fee = share_cost * 5 / 100;
        let total_cost = issuer_fee + protocol_fee;

        (share_cost, issuer_fee, protocol_fee, total_cost)
    }

    // ================================= Helper functions ================================== //

    fun get_vault_signer(): signer acquires Vault {
        let vault = borrow_global<Vault>(@aptos_friend_addr);
        object::generate_signer_for_extending(&vault.extend_ref)
    }

    fun construct_issuer_object_seed(issuer_addr: address): vector<u8> {
        bcs::to_bytes(&string_utils::format2(&b"{}_issuer_{}", @aptos_friend_addr, issuer_addr))
    }

    fun construct_user_object_seed(user_addr: address): vector<u8> {
        bcs::to_bytes(&string_utils::format2(&b"{}_user_{}", @aptos_friend_addr, user_addr))
    }

    fun construct_holding_object_seed(issuer_addr: address, holder_addr: address): vector<u8> {
        bcs::to_bytes(
            &string_utils::format3(
                &b"{}_share_issued_by_{}_hold_by_{}",
                @aptos_friend_addr,
                issuer_addr,
                holder_addr,
            )
        )
    }

    fun get_oct_per_aptos(): u64 {
        math64::pow(10, (coin::decimals<AptosCoin>() as u64))
    }

    fun calculate_share_cost(supply: u64, amount: u64): u64 {
        let temp1 = supply - 1;
        let temp2 = 2 * temp1 + 1;
        let sum1 = temp1 * supply * temp2 / 6;

        let temp3 = temp1 + amount;
        let temp4 = supply + amount;
        let temp5 = 2 * temp3 + 1;
        let sum2 = temp3 * temp4 * temp5 / 6;

        let summation = sum2 - sum1;

        let share_cost = summation * get_oct_per_aptos() / 16000;
        share_cost
    }

    // ================================= Tests ================================== //

    #[test_only]
    use aptos_framework::account;
    #[test_only]
    use std::string;
    #[test_only]
    use aptos_framework::aptos_coin;

    #[test(aptos_framework = @aptos_framework, deployer = @aptos_friend_addr, user_1 = @0x998, user_2 = @0x997)]
    fun test_happy_path(
        aptos_framework: &signer,
        deployer: &signer,
        user_1: &signer,
        user_2: &signer,
    ) acquires User, IssuerRegistry, Issuer, Holding, Vault {
        // ================================= Setup ================================== //

        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let deployer_addr = signer::address_of(deployer);
        account::create_account_for_test(deployer_addr);
        coin::register<AptosCoin>(deployer);

        let user_1_addr = signer::address_of(user_1);
        account::create_account_for_test(user_1_addr);
        coin::register<AptosCoin>(user_1);

        let user_2_addr = signer::address_of(user_2);
        account::create_account_for_test(user_2_addr);
        coin::register<AptosCoin>(user_2);

        init_module(deployer);

        // ================================= User 1 issues share ================================== //

        issue_share(user_1, string::utf8(b"test_user_1"));
        let issuer_1_obj = get_issuer_obj(user_1_addr);

        {
            let (
                addr,
                username,
                total_issued_shares,
            ) = get_issuer(issuer_1_obj);
            let holder_holdings = get_issuer_holder_holdings(issuer_1_obj);
            assert!(addr == user_1_addr, 1);
            assert!(username == string::utf8(b"test_user_1"), 1);
            assert!(total_issued_shares == 1, 1);
            assert!(vector::length(&holder_holdings) == 1, 1);
            assert!(vector::borrow(&holder_holdings, 0) == &get_holding_obj(user_1_addr, user_1_addr), 1);
        };

        {
            let user_obj = get_user_obj(user_1_addr);
            let user_holdings = get_user_holdings(user_obj);
            assert!(vector::length(&user_holdings) == 1, 2);
            assert!(vector::borrow(&user_holdings, 0) == &get_holding_obj(user_1_addr, user_1_addr), 1);
        };

        {
            let holding_obj = get_holding_obj(user_1_addr, user_1_addr);
            let (issuer, holder, shares) = get_holding(holding_obj);
            assert!(issuer == user_1_addr, 3);
            assert!(holder == user_1_addr, 3);
            assert!(shares == 1, 3);
        };

        // ================================= User 1 buy 10 shares of its own share ================================== //

        let (share_cost_1, issuer_fee_1, protocol_fee_1, total_cost_1) = calculate_buy_share_cost(issuer_1_obj, 10);
        let coins = coin::mint(total_cost_1, &mint_cap);
        coin::deposit(user_1_addr, coins);

        buy_share(user_1, issuer_1_obj, 10);
        assert!(coin::balance<AptosCoin>(user_1_addr) == issuer_fee_1, 4);
        assert!(coin::balance<AptosCoin>(get_vault_addr()) == share_cost_1, 4);
        assert!(coin::balance<AptosCoin>(@aptos_friend_addr) == protocol_fee_1, 4);

        {
            let (_, _, total_issued_shares) = get_issuer(issuer_1_obj);
            let holder_holdings = get_issuer_holder_holdings(issuer_1_obj);
            assert!(total_issued_shares == 11, 5);
            assert!(vector::length(&holder_holdings) == 1, 5);
            assert!(vector::borrow(&holder_holdings, 0) == &get_holding_obj(user_1_addr, user_1_addr), 5);
        };

        {
            let user_obj = get_user_obj(user_1_addr);
            let user_holdings = get_user_holdings(user_obj);
            assert!(vector::length(&user_holdings) == 1, 6);
            assert!(vector::borrow(&user_holdings, 0) == &get_holding_obj(user_1_addr, user_1_addr), 6);
        };

        {
            let holding_obj = get_holding_obj(user_1_addr, user_1_addr);
            let (_, _, shares) = get_holding(holding_obj);
            assert!(shares == 11, 7);
        };

        // ================================= User 2 buy 5 shares of user 1's share ================================== //

        let (share_cost_2, issuer_fee_2, protocol_fee_2, total_cost_2) = calculate_buy_share_cost(issuer_1_obj, 5);
        let coins = coin::mint(total_cost_2, &mint_cap);
        coin::deposit(user_2_addr, coins);

        buy_share(user_2, issuer_1_obj, 5);
        assert!(coin::balance<AptosCoin>(user_2_addr) == 0, 8);
        assert!(coin::balance<AptosCoin>(user_1_addr) == issuer_fee_1 + issuer_fee_2, 8);
        assert!(coin::balance<AptosCoin>(get_vault_addr()) == share_cost_1 + share_cost_2, 8);
        assert!(coin::balance<AptosCoin>(@aptos_friend_addr) == protocol_fee_1 + protocol_fee_2, 8);

        {
            let (_, _, total_issued_shares) = get_issuer(issuer_1_obj);
            let holder_holdings = get_issuer_holder_holdings(issuer_1_obj);
            assert!(total_issued_shares == 16, 9);
            assert!(vector::length(&holder_holdings) == 2, 9);
            assert!(vector::borrow(&holder_holdings, 0) == &get_holding_obj(user_1_addr, user_1_addr), 9);
            assert!(vector::borrow(&holder_holdings, 1) == &get_holding_obj(user_1_addr, user_2_addr), 9);
        };

        {
            let user_1_obj = get_user_obj(user_1_addr);
            let user_1_holdings = get_user_holdings(user_1_obj);
            assert!(vector::length(&user_1_holdings) == 1, 10);
            assert!(vector::borrow(&user_1_holdings, 0) == &get_holding_obj(user_1_addr, user_1_addr), 10);

            let user_2_obj = get_user_obj(user_2_addr);
            let user_2_holdings = get_user_holdings(user_2_obj);
            assert!(vector::length(&user_2_holdings) == 1, 10);
            assert!(vector::borrow(&user_2_holdings, 0) == &get_holding_obj(user_1_addr, user_2_addr), 10);
        };

        {
            let holding_obj = get_holding_obj(user_1_addr, user_2_addr);
            let (_, _, shares) = get_holding(holding_obj);
            assert!(shares == 5, 11);
        };

        // ================================= User 1 sell 3 shares of its own share ================================== //

        let (share_cost_3, issuer_fee_3, protocol_fee_3, total_cost_3) = calculate_sell_share_cost(issuer_1_obj, 3);
        let coins = coin::mint(total_cost_3, &mint_cap);
        coin::deposit(user_1_addr, coins);

        sell_share(user_1, issuer_1_obj, 3);
        assert!(
            coin::balance<AptosCoin>(
                user_1_addr
            ) == issuer_fee_1 + issuer_fee_2 + issuer_fee_3 + share_cost_3,
            12
        );
        assert!(coin::balance<AptosCoin>(get_vault_addr()) == share_cost_1 + share_cost_2 - share_cost_3, 12);
        assert!(
            coin::balance<AptosCoin>(@aptos_friend_addr) == protocol_fee_1 + protocol_fee_2 + protocol_fee_3,
            12
        );

        {
            let (_, _, total_issued_shares) = get_issuer(issuer_1_obj);
            let holder_holdings = get_issuer_holder_holdings(issuer_1_obj);
            assert!(total_issued_shares == 13, 13);
            assert!(vector::length(&holder_holdings) == 2, 13);
            assert!(vector::borrow(&holder_holdings, 0) == &get_holding_obj(user_1_addr, user_1_addr), 13);
            assert!(vector::borrow(&holder_holdings, 1) == &get_holding_obj(user_1_addr, user_2_addr), 13);
        };

        {
            let user_1_obj = get_user_obj(user_1_addr);
            let user_1_holdings = get_user_holdings(user_1_obj);
            assert!(vector::length(&user_1_holdings) == 1, 14);
            assert!(vector::borrow(&user_1_holdings, 0) == &get_holding_obj(user_1_addr, user_1_addr), 14);

            let user_2_obj = get_user_obj(user_2_addr);
            let user_2_holdings = get_user_holdings(user_2_obj);
            assert!(vector::length(&user_2_holdings) == 1, 14);
            assert!(vector::borrow(&user_2_holdings, 0) == &get_holding_obj(user_1_addr, user_2_addr), 14);
        };

        {
            let holding_obj = get_holding_obj(user_1_addr, user_1_addr);
            let (_, _, shares) = get_holding(holding_obj);
            assert!(shares == 8, 15);
        };

        // ================================= User 2 sell all user 1's share it owns ================================== //

        let (share_cost_4, issuer_fee_4, protocol_fee_4, total_cost_4) = calculate_sell_share_cost(issuer_1_obj, 5);
        let coins = coin::mint(total_cost_4, &mint_cap);
        coin::deposit(user_2_addr, coins);

        sell_share(user_2, issuer_1_obj, 5);
        assert!(coin::balance<AptosCoin>(user_2_addr) == share_cost_4, 16);
        assert!(
            coin::balance<AptosCoin>(
                user_1_addr
            ) == issuer_fee_1 + issuer_fee_2 + issuer_fee_3 + issuer_fee_4 + share_cost_3,
            16
        );
        assert!(
            coin::balance<AptosCoin>(get_vault_addr()) == share_cost_1 + share_cost_2 - share_cost_3 - share_cost_4,
            16
        );
        assert!(
            coin::balance<AptosCoin>(
                @aptos_friend_addr
            ) == protocol_fee_1 + protocol_fee_2 + protocol_fee_3 + protocol_fee_4,
            16
        );

        {
            let (_, _, total_issued_shares) = get_issuer(issuer_1_obj);
            let holder_holdings = get_issuer_holder_holdings(issuer_1_obj);
            assert!(total_issued_shares == 8, 17);
            assert!(vector::length(&holder_holdings) == 1, 17);
            assert!(vector::borrow(&holder_holdings, 0) == &get_holding_obj(user_1_addr, user_1_addr), 17);
        };

        {
            let user_1_obj = get_user_obj(user_1_addr);
            let user_1_holdings = get_user_holdings(user_1_obj);
            assert!(vector::length(&user_1_holdings) == 1, 18);
            assert!(vector::borrow(&user_1_holdings, 0) == &get_holding_obj(user_1_addr, user_1_addr), 18);

            let user_2_obj = get_user_obj(user_2_addr);
            let user_2_holdings = get_user_holdings(user_2_obj);
            assert!(vector::length(&user_2_holdings) == 0, 18);
        };

        // ================================= Clean up ================================== //

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @aptos_framework, deployer = @aptos_friend_addr, user_1 = @0x998)]
    fun buy_sell_should_have_same_price_when_supply_is_not_changed(
        aptos_framework: &signer,
        deployer: &signer,
        user_1: &signer,
    ) acquires User, IssuerRegistry, Issuer, Holding, Vault {
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        let deployer_addr = signer::address_of(deployer);
        account::create_account_for_test(deployer_addr);
        coin::register<AptosCoin>(deployer);

        let user_1_addr = signer::address_of(user_1);
        account::create_account_for_test(user_1_addr);
        coin::register<AptosCoin>(user_1);

        init_module(deployer);

        issue_share(user_1, string::utf8(b"test_user_1"));
        let issuer_1_obj = get_issuer_obj(user_1_addr);

        let (share_cost_1, _, _, total_cost_1) = calculate_buy_share_cost(issuer_1_obj, 5);
        let coins = coin::mint(total_cost_1, &mint_cap);
        coin::deposit(user_1_addr, coins);
        buy_share(user_1, issuer_1_obj, 5);
        let (share_cost_2, _, _, _) = calculate_sell_share_cost(issuer_1_obj, 5);
        assert!(share_cost_1 == share_cost_2, 1);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
