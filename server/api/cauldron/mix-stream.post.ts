import { eq } from 'drizzle-orm'
import { createError, defineEventHandler, readBody, setResponseHeader } from 'h3'

import { cauldronIngredients, cauldronSessions } from '../../../db/schema'
import { db } from '../../db'
import { CAULDRON_SYNTHESIS_SYSTEM_PROMPT } from '../../utils/langchain-prompts'
import { useLangChainService } from '../../utils/langchain-service'
import { validateRequired, validateUUID } from '../../utils/validation'

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

  const ingredientsList = ingredients.map((ing, idx) => `${idx + 1}. ${ing.content}`).join('\n')

  const prompt = `Analyze the patterns in these ${ingredients.length} ingredients and synthesize them into ONE compelling, actionable idea (2-3 sentences). Don't output JSON, just write the synthesis directly as plain text:

${ingredientsList}

What themes, interests, or directions do these ingredients reveal? Create a synthesis that captures the deeper pattern.`

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
          systemPrompt: CAULDRON_SYNTHESIS_SYSTEM_PROMPT.replace(
            'OUTPUT REQUIREMENTS:\nYou must respond with a JSON object containing a "synthesis" field.\nThe synthesis must be at least 50 characters and capture the deeper pattern.',
            'OUTPUT REQUIREMENTS:\nWrite the synthesis directly as plain text. No JSON. Just the synthesized idea.'
          ),
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
      } catch (error) {
        controller.enqueue(`data: ${JSON.stringify({ error: 'Generation failed' })}\n\n`)
        controller.close()
      }
    }
  })

  return stream
})
