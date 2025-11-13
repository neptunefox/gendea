import { eq } from 'drizzle-orm'

import { northStars } from '../../../db/schema'
import { db } from '../../db'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { text } = body

  if (!id || !text) {
    throw createError({
      statusCode: 400,
      message: 'id and text are required'
    })
  }

  const [northStar] = await db
    .update(northStars)
    .set({
      text,
      updatedAt: new Date()
    })
    .where(eq(northStars.id, id))
    .returning()

  if (!northStar) {
    throw createError({
      statusCode: 404,
      message: 'North Star not found'
    })
  }

  return { northStar }
})
