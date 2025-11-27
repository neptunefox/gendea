import { eq } from 'drizzle-orm'

import { canvasNodes, canvasEdges } from '../../../../db/schema'
import { db } from '../../../db'
import { detectDisconnectedClusters } from '../../../utils/canvas-ai-service'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { projectId } = body

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID is required'
    })
  }

  const [nodes, edges] = await Promise.all([
    db.select().from(canvasNodes).where(eq(canvasNodes.projectId, projectId)),
    db.select().from(canvasEdges).where(eq(canvasEdges.projectId, projectId))
  ])

  if (nodes.length < 2) {
    return {
      hasDisconnectedClusters: false,
      clusters: [],
      suggestedAction: null
    }
  }

  const nodeData = nodes.map(n => ({
    id: n.id,
    type: n.type,
    content: (n.data as { text?: string })?.text || ''
  }))

  const edgeData = edges.map(e => ({
    sourceId: e.sourceId,
    targetId: e.targetId
  }))

  const result = await detectDisconnectedClusters(nodeData, edgeData)

  return {
    hasDisconnectedClusters: result.hasDisconnectedClusters,
    clusters: result.clusters,
    suggestedAction: result.suggestedAction
  }
})
