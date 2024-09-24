script {
    use std::string;

    use message_board_addr::message_board;

    // This Move script runs atomically, i.e. it creates 2 messages in the same transaction.
    // Move script is how we batch multiple function calls in 1 tx
    // Similar to Solana allows multiple instructions in 1 tx
    fun create_2_messages(sender: &signer) {
        message_board::create_message(sender, string::utf8(b"hello hhohohoho"));
        message_board::create_message(sender, string::utf8(b"hello yeyeeee"));
    }
}
