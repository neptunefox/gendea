import { createError, defineEventHandler, readBody } from 'h3'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

import { tarotReadings, savedIdeas, sparkRuns } from '../../../db/schema'
import { db } from '../../db'
import { getCardById } from '../../data/tarot-deck'
import { useLangChainService } from '../../utils/langchain-service'

const TarotInterpretationSchema = z.object({
  interpretation: z.string().min(20),
  sparkPrompt: z.string().min(10)
})

const TAROT_SYSTEM_PROMPT = `You are a mystical guide offering daily creative insight through tarot.

Your role is to connect the card's archetypal meaning to the user's creative journey.
Be evocative but grounded. Focus on creative direction, not fortune-telling.

Output JSON: {"interpretation":"2-3 poetic sentences connecting card to their work","sparkPrompt":"one actionable prompt for today"}`

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { readingId, cardId, visitorId } = body as {
    readingId: string
    cardId: string
    visitorId?: string
  }

  if (!readingId || !cardId) {
    throw createError({ statusCode: 400, statusMessage: 'Reading ID and card ID required' })
  }

  const card = getCardById(cardId)
  if (!card) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid card' })
  }

  const [reading] = await db
    .select()
    .from(tarotReadings)
    .where(eq(tarotReadings.id, readingId))
    .limit(1)

  if (!reading) {
    throw createError({ statusCode: 404, statusMessage: 'Reading not found' })
  }

  if (reading.chosenCard) {
    return {
      card: getCardById(reading.chosenCard),
      interpretation: reading.interpretation,
      sparkPrompt: reading.sparkPrompt
    }
  }

  const cardOptions = reading.cardOptions as string[]
  if (!cardOptions.includes(cardId)) {
    throw createError({ statusCode: 400, statusMessage: 'Card not in options' })
  }

  const recentSparks = await db
    .select({ prompt: sparkRuns.prompt })
    .from(sparkRuns)
    .orderBy(desc(sparkRuns.createdAt))
    .limit(5)

  const recentIdeas = await db
    .select({ text: savedIdeas.text })
    .from(savedIdeas)
    .orderBy(desc(savedIdeas.createdAt))
    .limit(5)

  const sparkHistory = recentSparks.map(s => s.prompt).join(', ') || 'No recent explorations'
  const savedIdeasSummary = recentIdeas.map(i => i.text).join('; ') || 'No saved ideas yet'

  const prompt = `Card drawn: ${card.name} (${card.archetype})
Traditional meaning: ${card.meaning}
Keywords: ${card.keywords.join(', ')}

User's recent explorations: ${sparkHistory}
User's saved ideas: ${savedIdeasSummary}

Generate a personalized interpretation and spark prompt.`

  const langchain = useLangChainService()

  try {
    const result = await langchain.generateStructured({
      prompt,
      systemPrompt: TAROT_SYSTEM_PROMPT,
      schema: TarotInterpretationSchema
    })

    await db
      .update(tarotReadings)
      .set({
        chosenCard: cardId,
        interpretation: result.interpretation,
        sparkPrompt: result.sparkPrompt
      })
      .where(eq(tarotReadings.id, readingId))

    return {
      card,
      interpretation: result.interpretation,
      sparkPrompt: result.sparkPrompt
    }
  } catch (error) {
    console.error('Failed to generate tarot interpretation:', error)

    const fallbackInterpretation = `${card.name} arrives today as ${card.archetype.toLowerCase()}. ${card.meaning}`
    const fallbackPrompt = card.creativePrompt

    await db
      .update(tarotReadings)
      .set({
        chosenCard: cardId,
        interpretation: fallbackInterpretation,
        sparkPrompt: fallbackPrompt
      })
      .where(eq(tarotReadings.id, readingId))

    return {
      card,
      interpretation: fallbackInterpretation,
      sparkPrompt: fallbackPrompt
    }
  }
})
