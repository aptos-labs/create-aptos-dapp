// @generated automatically by Diesel CLI.

diesel::table! {
    ledger_infos (chain_id) {
        chain_id -> Int8,
    }
}

diesel::table! {
    messages (message_obj_addr) {
        #[max_length = 300]
        message_obj_addr -> Varchar,
        #[max_length = 300]
        creator_addr -> Varchar,
        creation_timestamp -> Int8,
        last_update_timestamp -> Int8,
        last_update_event_idx -> Int8,
        content -> Text,
    }
}

diesel::table! {
    processor_status (processor) {
        #[max_length = 50]
        processor -> Varchar,
        last_success_version -> Int8,
        last_updated -> Timestamp,
        last_transaction_timestamp -> Nullable<Timestamp>,
    }
}

diesel::table! {
    user_stats (user_addr) {
        #[max_length = 300]
        user_addr -> Varchar,
        creation_timestamp -> Int8,
        last_update_timestamp -> Int8,
        created_messages -> Int8,
        updated_messages -> Int8,
        s1_points -> Int8,
        total_points -> Int8,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    ledger_infos,
    messages,
    processor_status,
    user_stats,
);
