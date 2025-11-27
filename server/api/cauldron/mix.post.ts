import { eq } from 'drizzle-orm'
import { createError } from 'h3'

import { cauldronIngredients, cauldronSessions } from '../../../db/schema'
import { db } from '../../db'
import {
  CAULDRON_SYNTHESIS_SYSTEM_PROMPT,
  buildCauldronSynthesisPrompt
} from '../../utils/langchain-prompts'
import { CauldronOutputSchema } from '../../utils/langchain-schemas'
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
    throw createError({
      statusCode: 404,
      message: 'Session not found'
    })
  }

  const ingredients = await db
    .select()
    .from(cauldronIngredients)
    .where(eq(cauldronIngredients.sessionId, sessionId))
    .orderBy(cauldronIngredients.order)

  if (ingredients.length < 3) {
    throw createError({
      statusCode: 400,
      message: 'At least 3 ingredients are required for mixing'
    })
  }

  const synthesizedText = await synthesizeIdeas(ingredients)

  await db
    .update(cauldronSessions)
    .set({ outputText: synthesizedText })
    .where(eq(cauldronSessions.id, sessionId))

  return { output: synthesizedText }
})

async function synthesizeIdeas(
  ingredients: Array<{ content: string; order: number }>
): Promise<string> {
  const langchain = useLangChainService()

  const prompt = buildCauldronSynthesisPrompt(ingredients)

  try {
    const result = await langchain.generateStructured({
      prompt,
      systemPrompt: CAULDRON_SYNTHESIS_SYSTEM_PROMPT,
      schema: CauldronOutputSchema
    })

    return result.synthesis
  } catch (error) {
    console.error('Failed to synthesize ideas:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to synthesize ideas. Please try again.'
    })
  }
}
