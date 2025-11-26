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

  const body = await readBody(event)

  const updateData: Record<string, unknown> = {
    updatedAt: new Date()
  }

  if (body.position !== undefined) {
    updateData.position = body.position
  }

  if (body.data !== undefined) {
    updateData.data = body.data
  }

  if (body.type !== undefined) {
    updateData.type = body.type
  }

  await db.update(canvasNodes).set(updateData).where(eq(canvasNodes.id, id))

  const [updated] = await db.select().from(canvasNodes).where(eq(canvasNodes.id, id))

  return { node: updated }
})
