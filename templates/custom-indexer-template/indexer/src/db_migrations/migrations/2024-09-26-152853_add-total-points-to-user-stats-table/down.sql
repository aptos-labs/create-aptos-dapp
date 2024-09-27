-- This file should undo anything in `up.sql`
ALTER TABLE IF EXISTS user_stats
DROP COLUMN IF EXISTS total_points;