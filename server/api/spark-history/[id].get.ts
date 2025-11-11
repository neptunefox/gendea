import { db } from '../../db'
import { sparkRuns } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'

export default defineEventHandler(async event => {
  const id = event.context.params?.id

  if (!id || typeof id !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Run id is required'
    })
  }

  const [run] = await db.select().from(sparkRuns).where(eq(sparkRuns.id, id)).limit(1)

  if (!run) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Run not found'
    })
  }

  return { run }
})
