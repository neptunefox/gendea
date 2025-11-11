import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'

const connectionString = process.env.DATABASE_URL || 'postgresql://everest@localhost:5432/gendea'

async function main() {
  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)

  console.log('Creating tables...')

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS branches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      state TEXT NOT NULL DEFAULT 'Seeded',
      missed_plans INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT NOT NULL,
      text TEXT NOT NULL,
      name TEXT,
      rationale TEXT,
      constraints JSONB,
      metric TEXT,
      threshold JSONB,
      if_then_plan JSONB,
      energy_rating INTEGER,
      expectancy_rating INTEGER,
      parent_id UUID REFERENCES nodes(id),
      child_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      branch_id UUID NOT NULL,
      is_anonymous INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    ALTER TABLE nodes 
    ADD COLUMN IF NOT EXISTS name TEXT;
  `)

  await db.execute(sql`
    ALTER TABLE nodes 
    ADD COLUMN IF NOT EXISTS is_anonymous INTEGER NOT NULL DEFAULT 0;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS north_stars (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id UUID NOT NULL UNIQUE,
      text TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ladder_steps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id UUID NOT NULL,
      text TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id UUID NOT NULL UNIQUE,
      description TEXT NOT NULL,
      constraints JSONB,
      metric TEXT NOT NULL,
      pass_threshold TEXT NOT NULL,
      fail_threshold TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS accountability_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL UNIQUE,
      enabled INTEGER NOT NULL DEFAULT 0,
      recipient_email TEXT,
      frequency TEXT NOT NULL DEFAULT 'weekly',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS archives (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id UUID NOT NULL UNIQUE,
      tests JSONB NOT NULL,
      evidence TEXT NOT NULL,
      advice_to_self TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS progress_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id UUID NOT NULL,
      what_happened TEXT NOT NULL,
      what_learned TEXT NOT NULL,
      what_next TEXT NOT NULL,
      energy_rating INTEGER,
      expectancy_rating INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS archive_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      archive_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    ALTER TABLE branches 
    ADD COLUMN IF NOT EXISTS outside_view_analysis JSONB;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS saved_ideas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text TEXT NOT NULL,
      source TEXT NOT NULL,
      parent_idea_id UUID,
      tags JSONB DEFAULT '[]'::jsonb,
      is_ready_to_build INTEGER NOT NULL DEFAULT 0,
      branch_id UUID,
      status TEXT NOT NULL DEFAULT 'exploring',
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

  console.log('[SUCCESS] Tables created successfully!')

  await client.end()
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
