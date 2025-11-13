import { savedIdeas } from '../../db/schema'
import { db } from '../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { text, source, parentIdeaId, tags, status } = body

  if (!text || !source) {
    throw createError({
      statusCode: 400,
      message: 'Text and source are required'
    })
  }

  const [savedIdea] = await db
    .insert(savedIdeas)
    .values({
      text,
      source,
      parentIdeaId: parentIdeaId || null,
      tags: tags || [],
      status: status || 'exploring'
    })
    .returning()

  return { idea: savedIdea }
})
