import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/ideaflow'

const client = postgres(connectionString)
export const db = drizzle(client)
