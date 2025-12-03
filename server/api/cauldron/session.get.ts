import { desc, eq } from 'drizzle-orm'

import { db, schema } from '../../db'

const { cauldronSessions, cauldronIngredients } = schema

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const { userId } = query

  if (!userId || typeof userId !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'userId is required'
    })
  }

  const [session] = await db
    .select()
    .from(cauldronSessions)
    .where(eq(cauldronSessions.userId, userId))
    .orderBy(desc(cauldronSessions.createdAt))
    .limit(1)

  if (!session) {
    return { session: null, ingredients: [] }
  }

  const ingredients = await db
    .select()
    .from(cauldronIngredients)
    .where(eq(cauldronIngredients.sessionId, session.id))
    .orderBy(cauldronIngredients.order)

  return { session, ingredients }
})
