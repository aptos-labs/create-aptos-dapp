#[test_only]
module message_board_addr::test_end_to_end {
    use std::signer;
    use std::string;
    use std::vector;

    use aptos_framework::event;

    use message_board_addr::message_board;

    #[test(aptos_framework = @aptos_framework, deployer = @message_board_addr, sender = @0x100)]
    fun test_end_to_end(aptos_framework: &signer, deployer: &signer, sender: &signer) {
        let sender_addr = signer::address_of(sender);

        message_board::init_module_for_test(aptos_framework, deployer);

        message_board::create_message(sender, string::utf8(b"hello world"));
        let events = event::emitted_events();
        let message_obj = message_board::get_message_obj_from_create_message_event(vector::borrow(&events, 0));
        let (content, creator, _, _) = message_board::get_message_content(message_obj);
        assert!(content == string::utf8(b"hello world"), 1);
        assert!(creator == sender_addr, 1);

        message_board::update_message(sender, message_obj, string::utf8(b"hello move"));
        let events = event::emitted_events();
        // Since we force event type to be UpdateMessageEvent when calling get_message_obj_from_update_message_event()
        // This will filter out other events (e.g. CreateMessageEvent) when calling event::emitted_events()
        let message_obj = message_board::get_message_obj_from_update_message_event(vector::borrow(&events, 0));
        let (content, creator, _, _) = message_board::get_message_content(message_obj);
        assert!(content == string::utf8(b"hello move"), 2);
        assert!(creator == sender_addr, 2);
    }

    #[test(aptos_framework = @aptos_framework, deployer = @message_board_addr, sender1 = @0x100, sender2 = @0x101)]
    #[expected_failure(abort_code = 1, location = message_board_addr::message_board)]
    fun test_only_creator_can_update(aptos_framework: &signer, deployer: &signer, sender1: &signer, sender2: &signer) {
        message_board::init_module_for_test(aptos_framework, deployer);

        message_board::create_message(sender1, string::utf8(b"hello world"));

        let events = event::emitted_events();
        let message_obj = message_board::get_message_obj_from_create_message_event(vector::borrow(&events, 0));

        message_board::update_message(sender2, message_obj, string::utf8(b"hello move"));
    }
}
