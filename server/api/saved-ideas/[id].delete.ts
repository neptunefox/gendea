import { eq } from 'drizzle-orm'

import { savedIdeas, oracleSessions } from '../../../db/schema'
import { db } from '../../db'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID is required'
    })
  }

  await db.update(oracleSessions).set({ ideaId: null }).where(eq(oracleSessions.ideaId, id))
  await db.delete(savedIdeas).where(eq(savedIdeas.id, id))

  return { success: true }
})
