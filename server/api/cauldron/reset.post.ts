import { eq } from 'drizzle-orm'

import { cauldronIngredients } from '../../../db/schema'
import { db } from '../../db'
import { validateRequired, validateUUID } from '../../utils/validation'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { sessionId } = body

  validateRequired(sessionId, 'sessionId')
  validateUUID(sessionId, 'sessionId')

  await db.delete(cauldronIngredients).where(eq(cauldronIngredients.sessionId, sessionId))

  return { success: true }
})
