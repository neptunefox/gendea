import { eq } from 'drizzle-orm'

import { oracleSessions, savedIdeas } from '../../../db/schema'
import { db } from '../../db'
import { validateUUID } from '../../utils/validation'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { visitorId, ideaId } = body

  if (!visitorId) {
    throw createError({
      statusCode: 400,
      message: 'visitorId is required'
    })
  }

  if (ideaId) {
    validateUUID(ideaId, 'ideaId')

    const [idea] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, ideaId))

    if (!idea) {
      throw createError({
        statusCode: 404,
        message: 'Idea not found'
      })
    }
  }

  const [session] = await db
    .insert(oracleSessions)
    .values({
      visitorId,
      ideaId: ideaId || null
    })
    .returning()

  let ideaText: string | undefined

  if (ideaId) {
    const [idea] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, ideaId))
    ideaText = idea?.text
  }

  return {
    sessionId: session.id,
    ideaText
  }
})
