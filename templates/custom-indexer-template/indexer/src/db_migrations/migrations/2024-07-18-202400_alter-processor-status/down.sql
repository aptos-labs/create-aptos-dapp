-- This file should undo anything in `up.sql`
ALTER TABLE IF EXISTS processor_status
ALTER COLUMN last_updated
DROP DEFAULT;