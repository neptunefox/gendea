import { db, schema } from '../db'

const { savedIdeas } = schema

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { text, source, tags, isCauldronOutput, cauldronSessionId } = body

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
      tags: tags || [],
      isCauldronOutput: isCauldronOutput ? 1 : 0,
      cauldronSessionId: cauldronSessionId || null
    })
    .returning()

  return { idea: savedIdea }
})
