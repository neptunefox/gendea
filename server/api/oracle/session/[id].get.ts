import { eq } from 'drizzle-orm'

import { oracleSessions, oracleMessages, savedIdeas } from '../../../../db/schema'
import { db } from '../../../db'
import { validateRequired, validateUUID } from '../../../utils/validation'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  validateRequired(id, 'id')
  validateUUID(id!, 'id')

  const [session] = await db.select().from(oracleSessions).where(eq(oracleSessions.id, id!))

  if (!session) {
    throw createError({
      statusCode: 404,
      message: 'Session not found'
    })
  }

  const messages = await db
    .select()
    .from(oracleMessages)
    .where(eq(oracleMessages.sessionId, id!))
    .orderBy(oracleMessages.createdAt)

  let ideaText: string | undefined

  if (session.ideaId) {
    const [idea] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, session.ideaId))
    ideaText = idea?.text
  }

  return {
    session: {
      id: session.id,
      ideaId: session.ideaId,
      createdAt: session.createdAt
    },
    messages: messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
      sparkedAt: m.sparkedAt
    })),
    ideaText
  }
})
