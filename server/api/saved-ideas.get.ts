import { db } from '../db'
import { savedIdeas } from '../../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const ideas = await db.select().from(savedIdeas).orderBy(desc(savedIdeas.createdAt))

  return { ideas }
})
