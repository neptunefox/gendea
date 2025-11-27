import { eq } from 'drizzle-orm'
import { createError } from 'h3'

import { savedIdeas, canvasState } from '../../../db/schema'
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

  if (body.status) {
    updateData.status = body.status
  }

  if (body.northStar !== undefined) {
    updateData.northStar = body.northStar
  }

  if (body.testCommitment !== undefined) {
    updateData.testCommitment = body.testCommitment
  }

  if (body.testResult !== undefined) {
    updateData.testResult = body.testResult
  }

  if (body.dismissedNudges !== undefined) {
    updateData.dismissedNudges = body.dismissedNudges
  }

  if (body.lastActiveView !== undefined) {
    updateData.lastActiveView = body.lastActiveView
  }

  try {
    const [current] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, id))

    await db.update(savedIdeas).set(updateData).where(eq(savedIdeas.id, id))

    const [updated] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, id))

    if (body.status === 'building' && current?.status !== 'building') {
      const [existingCanvas] = await db
        .select()
        .from(canvasState)
        .where(eq(canvasState.projectId, id))

      if (!existingCanvas) {
        await db.insert(canvasState).values({
          projectId: id,
          viewportX: 0,
          viewportY: 0,
          zoom: 1
        })
      }
    }

    return { idea: updated }
  } catch (error) {
    console.error('Failed to update idea:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update idea'
    })
  }
})
