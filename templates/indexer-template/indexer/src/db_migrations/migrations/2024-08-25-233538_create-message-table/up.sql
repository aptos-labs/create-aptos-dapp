-- Your SQL goes here
CREATE TABLE messages (
    message_obj_addr VARCHAR(300) NOT NULL UNIQUE PRIMARY KEY,
    creator_addr VARCHAR(300) NOT NULL,
    creation_timestamp BIGINT NOT NULL,
    last_update_timestamp BIGINT NOT NULL,
    -- we store the event index so when we update in batch,
    -- we ignore when the event index is less than the last update event index
    last_update_event_idx BIGINT NOT NULL,
    content TEXT NOT NULL
);