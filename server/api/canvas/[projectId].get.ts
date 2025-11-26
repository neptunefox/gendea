import { eq } from 'drizzle-orm'

import { canvasNodes, canvasEdges, canvasState } from '../../../db/schema'
import { db } from '../../db'

export default defineEventHandler(async event => {
  const projectId = getRouterParam(event, 'projectId')

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID is required'
    })
  }

  const nodes = await db.select().from(canvasNodes).where(eq(canvasNodes.projectId, projectId))

  const edges = await db.select().from(canvasEdges).where(eq(canvasEdges.projectId, projectId))

  const [state] = await db.select().from(canvasState).where(eq(canvasState.projectId, projectId))

  return {
    nodes,
    edges,
    state: state || null
  }
})
