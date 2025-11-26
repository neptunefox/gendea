import { eq } from 'drizzle-orm'

import { canvasNodes } from '../../../../db/schema'
import { db } from '../../../db'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Node ID is required'
    })
  }

  await db.delete(canvasNodes).where(eq(canvasNodes.id, id))

  return { success: true }
})
