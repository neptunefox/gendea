import { eq, inArray } from 'drizzle-orm'

import { db, schema } from '../../db'
import { validateRequired, validateUUID } from '../../utils/validation'

const { sparkRuns, savedIdeas, oracleSessions, oracleMessages, cauldronIngredients } = schema

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  validateRequired(id, 'id')
  validateUUID(id!, 'id')

  const [run] = await db.select().from(sparkRuns).where(eq(sparkRuns.id, id!))

  if (!run) {
    throw createError({
      statusCode: 404,
      message: 'Spark run not found'
    })
  }

  const ideaTexts = run.coreIdeas?.map(i => i.text) ?? []

  if (ideaTexts.length > 0) {
    const relatedIdeas = await db
      .select({ id: savedIdeas.id })
      .from(savedIdeas)
      .where(inArray(savedIdeas.text, ideaTexts))

    const ideaIds = relatedIdeas.map(i => i.id)

    if (ideaIds.length > 0) {
      const relatedSessions = await db
        .select({ id: oracleSessions.id })
        .from(oracleSessions)
        .where(inArray(oracleSessions.ideaId, ideaIds))

      const sessionIds = relatedSessions.map(s => s.id)

      if (sessionIds.length > 0) {
        await db.delete(oracleMessages).where(inArray(oracleMessages.sessionId, sessionIds))
        await db.delete(oracleSessions).where(inArray(oracleSessions.id, sessionIds))
      }

      await db.delete(cauldronIngredients).where(inArray(cauldronIngredients.sourceId, ideaIds))
      await db.delete(savedIdeas).where(inArray(savedIdeas.id, ideaIds))
    }
  }

  await db.delete(sparkRuns).where(eq(sparkRuns.id, id!))

  return { success: true, id }
})
