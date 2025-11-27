import { eq, and } from 'drizzle-orm'

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
  const expectedVersion = body.version as number | undefined

  const [existingEdge] = await db.select().from(canvasEdges).where(eq(canvasEdges.id, id))

  if (!existingEdge) {
    throw createError({
      statusCode: 404,
      message: 'Edge not found'
    })
  }

  if (expectedVersion !== undefined && existingEdge.version !== expectedVersion) {
    throw createError({
      statusCode: 409,
      message: 'Conflict: Edge was modified by another user',
      data: {
        currentVersion: existingEdge.version,
        currentData: existingEdge
      }
    })
  }

  const updateData: Record<string, unknown> = {
    version: existingEdge.version + 1
  }

  if (body.type !== undefined) {
    updateData.type = body.type
  }

  if (body.label !== undefined) {
    updateData.label = body.label
  }

  if (body.style !== undefined) {
    updateData.style = body.style
  }

  const result = await db
    .update(canvasEdges)
    .set(updateData)
    .where(and(eq(canvasEdges.id, id), eq(canvasEdges.version, existingEdge.version)))
    .returning()

  if (result.length === 0) {
    const [currentEdge] = await db.select().from(canvasEdges).where(eq(canvasEdges.id, id))
    throw createError({
      statusCode: 409,
      message: 'Conflict: Edge was modified by another user',
      data: {
        currentVersion: currentEdge?.version ?? 0,
        currentData: currentEdge
      }
    })
  }

  return { edge: result[0] }
})
