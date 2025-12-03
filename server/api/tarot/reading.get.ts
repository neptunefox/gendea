import { eq, and } from 'drizzle-orm'
import { defineEventHandler, getQuery } from 'h3'

import { getRandomCards, getCardById } from '../../data/tarot-deck'
import { db, schema } from '../../db'

const { tarotReadings } = schema

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const visitorId = (query.visitorId as string) || 'anonymous'
  const today = new Date().toISOString().split('T')[0]

  const existing = await db
    .select()
    .from(tarotReadings)
    .where(and(eq(tarotReadings.visitorId, visitorId), eq(tarotReadings.date, today)))
    .limit(1)

  if (existing.length > 0) {
    const reading = existing[0]
    const cardOptions = (reading.cardOptions as string[]).map(id => getCardById(id)).filter(Boolean)

    return {
      status: reading.chosenCard ? 'complete' : 'pending',
      cardOptions,
      chosenCard: reading.chosenCard ? getCardById(reading.chosenCard) : null,
      interpretation: reading.interpretation,
      sparkPrompt: reading.sparkPrompt,
      readingId: reading.id
    }
  }

  const seed = `${visitorId}-${today}`
  const cards = getRandomCards(3, seed)
  const cardIds = cards.map(c => c.id)

  const [newReading] = await db
    .insert(tarotReadings)
    .values({
      visitorId,
      date: today,
      cardOptions: cardIds
    })
    .returning()

  return {
    status: 'pending',
    cardOptions: cards,
    chosenCard: null,
    interpretation: null,
    sparkPrompt: null,
    readingId: newReading.id
  }
})
