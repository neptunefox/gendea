-- Add relationship type constraint to canvas_edges table
-- This migration adds an enum constraint for edge types

-- First, update any NULL type values to 'relates-to' (default)
UPDATE canvas_edges SET type = 'relates-to' WHERE type IS NULL;

-- Add check constraint for relationship types
ALTER TABLE canvas_edges 
ADD CONSTRAINT canvas_edges_type_check 
CHECK (type IN ('leads-to', 'requires', 'blocks', 'relates-to'));

-- Set default value for type column
ALTER TABLE canvas_edges 
ALTER COLUMN type SET DEFAULT 'relates-to';
