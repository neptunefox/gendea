-- Drop unused canvas tables
DROP TABLE IF EXISTS canvas_edges CASCADE;
DROP TABLE IF EXISTS canvas_nodes CASCADE;
DROP TABLE IF EXISTS canvas_state CASCADE;

-- Drop unused workflow/coach tables
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS north_stars CASCADE;
DROP TABLE IF EXISTS ladder_steps CASCADE;
DROP TABLE IF EXISTS archives CASCADE;
DROP TABLE IF EXISTS archive_views CASCADE;
DROP TABLE IF EXISTS progress_logs CASCADE;
DROP TABLE IF EXISTS accountability_settings CASCADE;

-- Remove unused columns from saved_ideas
ALTER TABLE saved_ideas DROP COLUMN IF EXISTS parent_idea_id;
ALTER TABLE saved_ideas DROP COLUMN IF EXISTS is_ready_to_build;
ALTER TABLE saved_ideas DROP COLUMN IF EXISTS branch_id;
ALTER TABLE saved_ideas DROP COLUMN IF EXISTS status;
ALTER TABLE saved_ideas DROP COLUMN IF EXISTS north_star;
ALTER TABLE saved_ideas DROP COLUMN IF EXISTS test_commitment;
ALTER TABLE saved_ideas DROP COLUMN IF EXISTS test_result;
ALTER TABLE saved_ideas DROP COLUMN IF EXISTS dismissed_nudges;
ALTER TABLE saved_ideas DROP COLUMN IF EXISTS last_active_view;
