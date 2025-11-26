import { eq } from 'drizzle-orm'

import { canvasState } from '../../../db/schema'
import { db } from '../../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { projectId, viewportX, viewportY, zoom } = body

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID is required'
    })
  }

  const [existing] = await db.select().from(canvasState).where(eq(canvasState.projectId, projectId))

  let state

  if (existing) {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    }

    if (viewportX !== undefined) updateData.viewportX = viewportX
    if (viewportY !== undefined) updateData.viewportY = viewportY
    if (zoom !== undefined) updateData.zoom = zoom

    await db.update(canvasState).set(updateData).where(eq(canvasState.projectId, projectId))

    const [updated] = await db.select().from(canvasState).where(eq(canvasState.projectId, projectId))
    state = updated
  } else {
    const [created] = await db
      .insert(canvasState)
      .values({
        projectId,
        viewportX: viewportX || 0,
        viewportY: viewportY || 0,
        zoom: zoom || 1
      })
      .returning()
    state = created
  }

  return { state }
})
