script {
    use std::string;

    use aptos_framework::object;

    use message_board_addr::message_board;

    // This Move script runs atomically
    fun update_message(sender: &signer) {
        let message_obj_addr_1 =
            @0x4d78c35d85ab22061e25b5ec540a7fabc89e58799dc58462305c9cc318ef6dad;
        message_board::update_message(
            sender,
            object::address_to_object(message_obj_addr_1),
            string::utf8(b"updated message 3")
        );

        let message_obj_addr_2 =
            @0x663ecbbaaa75dc8f96d257684251e0678d8153f9f4872c61cf67025bdb51c7f9;
        message_board::update_message(
            sender,
            object::address_to_object(message_obj_addr_2),
            string::utf8(b"updated message 4")
        );
        message_board::update_message(
            sender,
            object::address_to_object(message_obj_addr_2),
            string::utf8(b"updated message 5")
        );

    }
}
