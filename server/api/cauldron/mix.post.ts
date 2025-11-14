import { eq } from 'drizzle-orm'
import { createError } from 'h3'

import { cauldronIngredients, cauldronSessions } from '../../../db/schema'
import { db } from '../../db'
import { useLLMService } from '../../utils/llm'
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
  const llm = useLLMService()

  const systemPrompt = `You are a convergent synthesis assistant. Your role is to analyze patterns across multiple ideas and synthesize them into ONE compelling, actionable idea.

CRITICAL: Respond with ONLY the synthesized idea text. No explanations, no markdown, no extra formatting.

Process:
1. Identify common themes, patterns, and connections across ALL ingredients
2. Find the deeper underlying interest or direction these ingredients point toward
3. Synthesize into ONE cohesive, actionable idea that captures the essence

Rules:
- Analyze patterns within the provided ingredients only
- Don't just combine ideas - find what they reveal about the user's interests
- Keep it specific and actionable (2-3 sentences max)
- Make it compelling and ready to act on
- The output should feel like a natural evolution of the ingredients`

  const ingredientsList = ingredients.map((ing, idx) => `${idx + 1}. ${ing.content}`).join('\n')

  const userPrompt = `Analyze the patterns in these ${ingredients.length} ingredients and synthesize them into ONE compelling idea:

${ingredientsList}

What themes, interests, or directions do these ingredients reveal? Create a synthesis that captures the deeper pattern.`

  try {
    const response = await llm.generate(userPrompt, systemPrompt)
    return response.trim()
  } catch (error) {
    console.error('Failed to synthesize ideas:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to synthesize ideas. Please try again.'
    })
  }
}
