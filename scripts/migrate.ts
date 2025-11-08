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
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
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

  console.log('[SUCCESS] Tables created successfully!')

  await client.end()
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
