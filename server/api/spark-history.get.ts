import { desc } from 'drizzle-orm'

import { sparkRuns } from '../../db/schema'
import { db } from '../db'

export default defineEventHandler(async () => {
  const runs = await db.select().from(sparkRuns).orderBy(desc(sparkRuns.createdAt)).limit(30)

  return { runs }
})
