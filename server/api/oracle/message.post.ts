import { eq } from 'drizzle-orm'

import { db, schema } from '../../db'
import {
  generateOracleResponse,
  formatOracleResponse,
  type OracleContext
} from '../../utils/oracle-service'
import { validateRequired, validateUUID } from '../../utils/validation'

const { oracleSessions, oracleMessages, savedIdeas } = schema

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { sessionId, message } = body

  validateRequired(sessionId, 'sessionId')
  validateUUID(sessionId, 'sessionId')
  validateRequired(message, 'message')

  const [session] = await db.select().from(oracleSessions).where(eq(oracleSessions.id, sessionId))

  if (!session) {
    throw createError({
      statusCode: 404,
      message: 'Session not found'
    })
  }

  const [userMessage] = await db
    .insert(oracleMessages)
    .values({
      sessionId,
      role: 'user',
      content: message
    })
    .returning()

  const existingMessages = await db
    .select()
    .from(oracleMessages)
    .where(eq(oracleMessages.sessionId, sessionId))
    .orderBy(oracleMessages.createdAt)

  const conversationHistory: OracleContext[] = existingMessages
    .filter(m => m.id !== userMessage.id)
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }))

  let ideaContext: string | undefined
  if (session.ideaId) {
    const [idea] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, session.ideaId))
    ideaContext = idea?.text
  }

  const oracleResponse = await generateOracleResponse({
    userMessage: message,
    conversationHistory,
    ideaContext
  })

  const responseText = formatOracleResponse(oracleResponse)

  const [oracleMessage] = await db
    .insert(oracleMessages)
    .values({
      sessionId,
      role: 'oracle',
      content: responseText
    })
    .returning()

  await db
    .update(oracleSessions)
    .set({ updatedAt: new Date() })
    .where(eq(oracleSessions.id, sessionId))

  return {
    question: responseText,
    messageId: oracleMessage.id
  }
})
