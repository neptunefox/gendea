ALTER TABLE canvas_nodes ADD COLUMN IF NOT EXISTS dismissed_suggestions jsonb DEFAULT '[]';
