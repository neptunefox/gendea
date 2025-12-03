import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import * as sqliteSchema from '../db/schema'
import * as pgSchema from '../db/schema.pg'

type Database = BetterSQLite3Database<typeof sqliteSchema> | NodePgDatabase<typeof pgSchema>

const DATABASE_URL = process.env.DATABASE_URL

let _db: Database | null = null
let _isPostgres = false
let _initialized = false

async function initDatabase(): Promise<Database> {
  if (_initialized && _db) return _db

  if (DATABASE_URL) {
    const { drizzle } = await import('drizzle-orm/node-postgres')
    const { Pool } = await import('pg')

    const pool = new Pool({
      connectionString: DATABASE_URL
    })

    _isPostgres = true
    _db = drizzle(pool, { schema: pgSchema })
  } else {
    const { drizzle } = await import('drizzle-orm/better-sqlite3')
    const Database = (await import('better-sqlite3')).default

    const sqlite = new Database('./gendea.db')
    _db = drizzle(sqlite, { schema: sqliteSchema })
  }

  _initialized = true
  return _db
}

export const dbPromise = initDatabase()

export const db = new Proxy({} as Database, {
  get(_, prop) {
    if (!_db) {
      throw new Error('Database not initialized. Ensure db plugin runs first.')
    }
    return (_db as Record<string | symbol, unknown>)[prop]
  }
})

export const isPostgres = () => _isPostgres
