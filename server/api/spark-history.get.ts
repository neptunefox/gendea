import { db } from '../db'
import { sparkRuns } from '../../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const runs = await db.select().from(sparkRuns).orderBy(desc(sparkRuns.createdAt)).limit(30)

  return { runs }
})
