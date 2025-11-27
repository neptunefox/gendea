import { eq } from 'drizzle-orm'
import { tidyUpNodes } from '../../../utils/canvas-ai-service'
import { canvasNodes } from '../../../../db/schema'
import { db } from '../../../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { projectId, nodeIds } = body

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID is required'
    })
  }

  const allNodes = await db
    .select()
    .from(canvasNodes)
    .where(eq(canvasNodes.projectId, projectId))

  const nodesToOrganize = nodeIds
    ? allNodes.filter(n => nodeIds.includes(n.id))
    : allNodes

  if (nodesToOrganize.length === 0) {
    return { clusters: [] }
  }

  const nodeData = nodesToOrganize.map(n => ({
    id: n.id,
    type: n.type,
    content: (n.data as { text?: string })?.text || ''
  }))

  const result = await tidyUpNodes(nodeData)

  const layoutPositions = calculateClusterPositions(result.clusters, nodesToOrganize)

  for (const [nodeId, position] of Object.entries(layoutPositions)) {
    await db
      .update(canvasNodes)
      .set({
        position,
        updatedAt: new Date()
      })
      .where(eq(canvasNodes.id, nodeId))
  }

  return {
    clusters: result.clusters,
    updatedPositions: layoutPositions
  }
})

function calculateClusterPositions(
  clusters: Array<{ name: string; nodeIds: string[]; layout: string }>,
  nodes: Array<{ id: string; position: unknown }>
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}
  const clusterSpacing = 400
  const nodeSpacing = 150

  clusters.forEach((cluster, clusterIndex) => {
    const clusterBaseX = clusterIndex * clusterSpacing
    const clusterBaseY = 100

    cluster.nodeIds.forEach((nodeId, nodeIndex) => {
      if (cluster.layout === 'linear') {
        positions[nodeId] = {
          x: clusterBaseX,
          y: clusterBaseY + nodeIndex * nodeSpacing
        }
      } else if (cluster.layout === 'radial') {
        if (nodeIndex === 0) {
          positions[nodeId] = { x: clusterBaseX, y: clusterBaseY }
        } else {
          const angle = (2 * Math.PI * (nodeIndex - 1)) / (cluster.nodeIds.length - 1)
          positions[nodeId] = {
            x: clusterBaseX + Math.cos(angle) * nodeSpacing,
            y: clusterBaseY + Math.sin(angle) * nodeSpacing
          }
        }
      } else {
        const cols = Math.ceil(Math.sqrt(cluster.nodeIds.length))
        const row = Math.floor(nodeIndex / cols)
        const col = nodeIndex % cols
        positions[nodeId] = {
          x: clusterBaseX + col * nodeSpacing,
          y: clusterBaseY + row * nodeSpacing
        }
      }
    })
  })

  return positions
}
