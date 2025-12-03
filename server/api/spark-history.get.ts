import { desc } from 'drizzle-orm'

import { db, schema } from '../db'

const { sparkRuns } = schema

export default defineEventHandler(async () => {
  const runs = await db.select().from(sparkRuns).orderBy(desc(sparkRuns.createdAt)).limit(30)

  return { runs }
})
