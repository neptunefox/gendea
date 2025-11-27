import { eq, inArray } from 'drizzle-orm'

import { savedIdeas, canvasNodes, canvasEdges } from '../../../db/schema'
import { db } from '../../db'

async function removeCanvasNodesForDeletedIdea(ideaId: string) {
  const allNodes = await db.select().from(canvasNodes)

  const matchingNodes = allNodes.filter(node => {
    const data = node.data as Record<string, unknown>
    return data.savedIdeaId === ideaId && !data.coachOrigin
  })

  if (matchingNodes.length === 0) return

  const nodeIds = matchingNodes.map(n => n.id)

  await db.delete(canvasEdges).where(inArray(canvasEdges.sourceId, nodeIds))
  await db.delete(canvasEdges).where(inArray(canvasEdges.targetId, nodeIds))

  for (const nodeId of nodeIds) {
    await db.delete(canvasNodes).where(eq(canvasNodes.id, nodeId))
  }
}

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID is required'
    })
  }

  await removeCanvasNodesForDeletedIdea(id)

  await db.delete(savedIdeas).where(eq(savedIdeas.id, id))

  return { success: true }
})
