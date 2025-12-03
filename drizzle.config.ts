import { defineConfig } from 'drizzle-kit'

const DATABASE_URL = process.env.DATABASE_URL

export default DATABASE_URL
  ? defineConfig({
      schema: './db/schema.pg.ts',
      out: './drizzle/pg',
      dialect: 'postgresql',
      dbCredentials: {
        url: DATABASE_URL
      }
    })
  : defineConfig({
      schema: './db/schema.ts',
      out: './drizzle/sqlite',
      dialect: 'sqlite',
      dbCredentials: {
        url: './gendea.db'
      }
    })
