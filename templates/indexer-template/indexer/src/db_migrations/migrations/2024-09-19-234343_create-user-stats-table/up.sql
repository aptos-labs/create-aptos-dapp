-- Your SQL goes here
CREATE TABLE
    user_stats (
        user_addr VARCHAR(300) NOT NULL UNIQUE PRIMARY KEY,
        creation_timestamp BIGINT NOT NULL,
        last_update_timestamp BIGINT NOT NULL,
        created_messages BIGINT NOT NULL,
        updated_messages BIGINT NOT NULL,
        -- Season 1 points
        s1_points BIGINT NOT NULL,
        -- All seasons points
        total_points BIGINT NOT NULL
    );