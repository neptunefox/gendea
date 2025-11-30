CREATE TABLE IF NOT EXISTS tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  date TEXT NOT NULL,
  card_options JSONB NOT NULL,
  chosen_card TEXT,
  interpretation TEXT,
  spark_prompt TEXT,
  used_as_input INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tarot_readings_visitor_date ON tarot_readings(visitor_id, date);
