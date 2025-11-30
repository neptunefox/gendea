import { eq } from 'drizzle-orm'
import { createError } from 'h3'

import { savedIdeas } from '../../../db/schema'
import { db } from '../../db'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID is required'
    })
  }

  const body = await readBody(event)

  const updateData: Record<string, unknown> = {}

  if (body.text !== undefined) {
    updateData.text = body.text
  }

  if (body.tags !== undefined) {
    updateData.tags = body.tags
  }

  try {
    await db.update(savedIdeas).set(updateData).where(eq(savedIdeas.id, id))

    const [updated] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, id))

    return { idea: updated }
  } catch (error) {
    console.error('Failed to update idea:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update idea'
    })
  }
})
