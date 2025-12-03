import { desc } from 'drizzle-orm'

import { db, schema } from '../db'

const { savedIdeas } = schema

export default defineEventHandler(async () => {
  const ideas = await db.select().from(savedIdeas).orderBy(desc(savedIdeas.createdAt))

  return { ideas }
})
