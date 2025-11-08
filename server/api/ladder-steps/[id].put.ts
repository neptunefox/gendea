import { db } from '../../db'
import { ladderSteps } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { text } = body

  if (!id || !text) {
    throw createError({
      statusCode: 400,
      message: 'id and text are required'
    })
  }

  const [step] = await db
    .update(ladderSteps)
    .set({
      text,
      updatedAt: new Date()
    })
    .where(eq(ladderSteps.id, id))
    .returning()

  if (!step) {
    throw createError({
      statusCode: 404,
      message: 'Ladder step not found'
    })
  }

  return { step }
})
