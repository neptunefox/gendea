import { db } from '../db'
import { sql } from 'drizzle-orm'
import { useLLMService } from '../utils/llm'

export default defineEventHandler(async () => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      llm: 'unknown'
    }
  }

  try {
    await db.execute(sql`SELECT 1`)
    health.services.database = 'ok'
  } catch {
    health.services.database = 'error'
    health.status = 'degraded'
  }

  try {
    const llm = useLLMService()
    await llm.generate('test', 'Respond with "ok"')
    health.services.llm = 'ok'
  } catch {
    health.services.llm = 'error'
    health.status = 'degraded'
  }

  return health
})
