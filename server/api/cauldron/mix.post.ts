import { eq, desc } from 'drizzle-orm'
import { createError } from 'h3'

import { cauldronIngredients, cauldronSessions, savedIdeas } from '../../../db/schema'
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

  const userSavedIdeas = await db
    .select()
    .from(savedIdeas)
    .orderBy(desc(savedIdeas.createdAt))
    .limit(20)

  const previousCauldronOutputs = await db
    .select()
    .from(savedIdeas)
    .where(eq(savedIdeas.isCauldronOutput, 1))
    .orderBy(desc(savedIdeas.createdAt))
    .limit(10)

  const synthesizedText = await synthesizeIdeas(
    ingredients,
    userSavedIdeas,
    previousCauldronOutputs
  )

  const [outputIdea] = await db
    .insert(savedIdeas)
    .values({
      text: synthesizedText,
      source: 'ai',
      isCauldronOutput: 1,
      cauldronSessionId: sessionId,
      status: 'exploring'
    })
    .returning()

  await db
    .update(cauldronSessions)
    .set({ outputIdeaId: outputIdea.id })
    .where(eq(cauldronSessions.id, sessionId))

  return { idea: synthesizedText }
})

async function synthesizeIdeas(
  ingredients: Array<{ content: string; order: number }>,
  userSavedIdeas: Array<{ text: string }>,
  previousOutputs: Array<{ text: string }>
): Promise<string> {
  const llm = useLLMService()

  const systemPrompt = `You are a convergent synthesis assistant. Your role is to analyze multiple ideas and synthesize them into ONE compelling, actionable idea that captures the essence of all ingredients.

CRITICAL: Respond with ONLY the synthesized idea text. No explanations, no markdown, no extra formatting.

Rules:
- Synthesize all ingredients into ONE cohesive idea
- The output should feel personalized based on observed patterns
- Keep it specific and actionable (2-3 sentences max)
- Don't just combine ideas - find the deeper connection
- Make it compelling and ready to act on
- Focus on what makes this unique to the user's interests`

  const ingredientsList = ingredients.map((ing, idx) => `${idx + 1}. ${ing.content}`).join('\n')

  const savedIdeasContext =
    userSavedIdeas.length > 0
      ? `\n\nUser's recent saved ideas (for pattern analysis):\n${userSavedIdeas.map(idea => `- ${idea.text}`).join('\n')}`
      : ''

  const previousOutputsContext =
    previousOutputs.length > 0
      ? `\n\nPrevious cauldron outputs that resonated:\n${previousOutputs.map(output => `- ${output.text}`).join('\n')}`
      : ''

  const userPrompt = `Synthesize these ${ingredients.length} ingredients into ONE compelling idea:

${ingredientsList}${savedIdeasContext}${previousOutputsContext}

Analyze the patterns in what the user saved and what they're mixing now. Create a synthesis that feels personalized to their interests and style.`

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
