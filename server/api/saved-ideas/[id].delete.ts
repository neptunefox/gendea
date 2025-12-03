import { eq } from 'drizzle-orm'

import { db, schema } from '../../db'

const { savedIdeas, oracleSessions } = schema

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
