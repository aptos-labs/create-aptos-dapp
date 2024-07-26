script {
    use std::signer;
    use std::string;

    use friend_tech_addr::friend_tech;

    fun issue_share_and_buy_share(sender: &signer) {
        let sender_addr = signer::address_of(sender);
        // issue my share
        friend_tech::issue_share(sender, string::utf8(b"user_1"));
        let issuer_obj = friend_tech::get_issuer_obj(sender_addr);
        // buy 10 shares of my own share
        friend_tech::buy_share(sender, issuer_obj, 10);
    }
}
