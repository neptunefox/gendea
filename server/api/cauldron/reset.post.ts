import { eq } from 'drizzle-orm'

import { db, schema } from '../../db'
import { validateRequired, validateUUID } from '../../utils/validation'

const { cauldronIngredients } = schema

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { sessionId } = body

  validateRequired(sessionId, 'sessionId')
  validateUUID(sessionId, 'sessionId')

  await db.delete(cauldronIngredients).where(eq(cauldronIngredients.sessionId, sessionId))

  return { success: true }
})
