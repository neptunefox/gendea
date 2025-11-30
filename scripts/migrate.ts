import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || 'postgresql://everest@localhost:5432/gendea'

async function main() {
  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)

  console.log('Creating tables...')

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS saved_ideas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text TEXT NOT NULL,
      source TEXT NOT NULL,
      tags JSONB DEFAULT '[]'::jsonb,
      is_cauldron_output INTEGER NOT NULL DEFAULT 0,
      cauldron_session_id UUID,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS spark_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prompt TEXT NOT NULL,
      core_ideas JSONB NOT NULL,
      lenses JSONB NOT NULL,
      nudges JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS cauldron_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      ingredient_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      output_idea_id UUID,
      output_text TEXT,
      patterns JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS cauldron_ingredients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES cauldron_sessions(id),
      source_type TEXT NOT NULL,
      source_id TEXT,
      content TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      added_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS oracle_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      visitor_id TEXT NOT NULL,
      idea_id UUID REFERENCES saved_ideas(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS oracle_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES oracle_sessions(id),
      role TEXT NOT NULL CHECK (role IN ('user', 'oracle')),
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      sparked_at TIMESTAMP
    );
  `)

  console.log('[SUCCESS] Tables created successfully!')

  await client.end()
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
