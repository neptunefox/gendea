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

  const body = await readBody(event)

  const updateData: Record<string, unknown> = {}

  if (body.type !== undefined) {
    updateData.type = body.type
  }

  if (body.label !== undefined) {
    updateData.label = body.label
  }

  if (body.style !== undefined) {
    updateData.style = body.style
  }

  await db.update(canvasEdges).set(updateData).where(eq(canvasEdges.id, id))

  const [updated] = await db.select().from(canvasEdges).where(eq(canvasEdges.id, id))

  return { edge: updated }
})
