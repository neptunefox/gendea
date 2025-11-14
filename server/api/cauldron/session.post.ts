import { createError } from 'h3'

import { cauldronSessions } from '../../../db/schema'
import { db } from '../../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { userId } = body

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'userId is required'
    })
  }

  const [session] = await db
    .insert(cauldronSessions)
    .values({
      userId,
      ingredientIds: [],
      outputIdeaId: null,
      patterns: null
    })
    .returning()

  return { session }
})
