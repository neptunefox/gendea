import { eq, and } from 'drizzle-orm'

import { canvasState } from '../../../db/schema'
import { db } from '../../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { projectId, viewportX, viewportY, zoom, version: expectedVersion } = body

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID is required'
    })
  }

  const [existing] = await db.select().from(canvasState).where(eq(canvasState.projectId, projectId))

  let state

  if (existing) {
    if (expectedVersion !== undefined && existing.version !== expectedVersion) {
      throw createError({
        statusCode: 409,
        message: 'Conflict: Canvas state was modified by another user',
        data: {
          currentVersion: existing.version,
          currentData: existing
        }
      })
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      version: existing.version + 1
    }

    if (viewportX !== undefined) updateData.viewportX = viewportX
    if (viewportY !== undefined) updateData.viewportY = viewportY
    if (zoom !== undefined) updateData.zoom = zoom

    const result = await db
      .update(canvasState)
      .set(updateData)
      .where(and(eq(canvasState.projectId, projectId), eq(canvasState.version, existing.version)))
      .returning()

    if (result.length === 0) {
      const [currentState] = await db.select().from(canvasState).where(eq(canvasState.projectId, projectId))
      throw createError({
        statusCode: 409,
        message: 'Conflict: Canvas state was modified by another user',
        data: {
          currentVersion: currentState?.version ?? 0,
          currentData: currentState
        }
      })
    }

    state = result[0]
  } else {
    const [created] = await db
      .insert(canvasState)
      .values({
        projectId,
        viewportX: viewportX || 0,
        viewportY: viewportY || 0,
        zoom: zoom || 1,
        version: 1
      })
      .returning()
    state = created
  }

  return { state }
})
