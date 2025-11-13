import { desc } from 'drizzle-orm'

import { savedIdeas } from '../../db/schema'
import { db } from '../db'

export default defineEventHandler(async () => {
  const ideas = await db.select().from(savedIdeas).orderBy(desc(savedIdeas.createdAt))

  return { ideas }
})
