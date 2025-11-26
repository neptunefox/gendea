import { eq } from 'drizzle-orm'

import { canvasEdges } from '../../../../db/schema'
import { db } from '../../../db'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Edge ID is required'
    })
  }

  await db.delete(canvasEdges).where(eq(canvasEdges.id, id))

  return { success: true }
})
