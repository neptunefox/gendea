import { eq } from 'drizzle-orm'
import { setResponseHeader } from 'h3'

import { oracleSessions, oracleMessages, savedIdeas } from '../../../db/schema'
import { db } from '../../db'
import { ORACLE_SYSTEM_PROMPT } from '../../utils/langchain-prompts'
import { useLangChainService } from '../../utils/langchain-service'
import { validateRequired, validateUUID } from '../../utils/validation'

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

  await db.insert(oracleMessages).values({
    sessionId,
    role: 'user',
    content: message
  })

  const existingMessages = await db
    .select()
    .from(oracleMessages)
    .where(eq(oracleMessages.sessionId, sessionId))
    .orderBy(oracleMessages.createdAt)

  const conversationHistory = existingMessages.map(m => ({
    role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
    content: m.content
  }))

  let prompt = message
  if (session.ideaId && existingMessages.length <= 1) {
    const [idea] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, session.ideaId))
    if (idea) {
      prompt = `Context - the user is exploring this idea: "${idea.text}"\n\nTheir message: ${message}`
    }
  }

  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  const langchain = useLangChainService()
  let fullText = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await langchain.streamText({
          prompt,
          systemPrompt: ORACLE_SYSTEM_PROMPT,
          context: conversationHistory.slice(0, -1),
          onToken: (token: string) => {
            fullText += token
            controller.enqueue(`data: ${JSON.stringify({ token })}\n\n`)
          }
        })

        const [oracleMessage] = await db
          .insert(oracleMessages)
          .values({
            sessionId,
            role: 'oracle',
            content: fullText
          })
          .returning()

        await db
          .update(oracleSessions)
          .set({ updatedAt: new Date() })
          .where(eq(oracleSessions.id, sessionId))

        controller.enqueue(
          `data: ${JSON.stringify({ done: true, messageId: oracleMessage.id, question: fullText })}\n\n`
        )
        controller.close()
      } catch {
        const fallbackQuestion =
          'What would change if you approached this from the opposite direction?'

        const [oracleMessage] = await db
          .insert(oracleMessages)
          .values({
            sessionId,
            role: 'oracle',
            content: fallbackQuestion
          })
          .returning()

        controller.enqueue(
          `data: ${JSON.stringify({ done: true, messageId: oracleMessage.id, question: fallbackQuestion })}\n\n`
        )
        controller.close()
      }
    }
  })

  return stream
})
