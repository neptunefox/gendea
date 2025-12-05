import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody, setResponseHeader } from 'h3'

import { db, schema } from '../../db'
import {
  buildCauldronSynthesisPrompt,
  CAULDRON_SYNTHESIS_SYSTEM_PROMPT
} from '../../utils/langchain-prompts'
import { useLangChainService } from '../../utils/langchain-service'
import { validateRequired, validateUUID } from '../../utils/validation'

const { cauldronIngredients, cauldronSessions } = schema

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { sessionId } = body

  validateRequired(sessionId, 'sessionId')
  validateUUID(sessionId, 'sessionId')

  const [session] = await db
    .select()
    .from(cauldronSessions)
    .where(eq(cauldronSessions.id, sessionId))

  if (!session) {
    throw createError({ statusCode: 404, message: 'Session not found' })
  }

  const ingredients = await db
    .select()
    .from(cauldronIngredients)
    .where(eq(cauldronIngredients.sessionId, sessionId))
    .orderBy(cauldronIngredients.order)

  if (ingredients.length < 3) {
    throw createError({ statusCode: 400, message: 'At least 3 ingredients required' })
  }

  const prompt = buildCauldronSynthesisPrompt(ingredients)

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
          systemPrompt: CAULDRON_SYNTHESIS_SYSTEM_PROMPT,
          onToken: (token: string) => {
            fullText += token
            controller.enqueue(`data: ${JSON.stringify({ token })}\n\n`)
          }
        })

        await db
          .update(cauldronSessions)
          .set({ outputText: fullText })
          .where(eq(cauldronSessions.id, sessionId))

        controller.enqueue(`data: ${JSON.stringify({ done: true, output: fullText })}\n\n`)
        controller.close()
      } catch {
        controller.enqueue(`data: ${JSON.stringify({ error: 'Generation failed' })}\n\n`)
        controller.close()
      }
    }
  })

  return stream
})
