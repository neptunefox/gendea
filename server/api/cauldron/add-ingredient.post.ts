import { eq } from 'drizzle-orm'

import { db, schema } from '../../db'
import { validateRequired, validateUUID } from '../../utils/validation'

const { cauldronIngredients, cauldronSessions } = schema

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { sessionId, sourceType, sourceId, content } = body

  validateRequired(sessionId, 'sessionId')
  validateUUID(sessionId, 'sessionId')
  validateRequired(sourceType, 'sourceType')
  validateRequired(content, 'content')

  if (!['saved', 'spark', 'user'].includes(sourceType)) {
    throw createError({
      statusCode: 400,
      message: 'sourceType must be one of: saved, spark, user'
    })
  }

  const existingIngredients = await db
    .select()
    .from(cauldronIngredients)
    .where(eq(cauldronIngredients.sessionId, sessionId))

  const nextOrder = existingIngredients.length

  const [ingredient] = await db
    .insert(cauldronIngredients)
    .values({
      sessionId,
      sourceType,
      sourceId: sourceId || null,
      content,
      order: nextOrder
    })
    .returning()

  const ingredientIds = [...existingIngredients.map(i => i.id), ingredient.id]

  await db.update(cauldronSessions).set({ ingredientIds }).where(eq(cauldronSessions.id, sessionId))

  return { ingredient }
})
