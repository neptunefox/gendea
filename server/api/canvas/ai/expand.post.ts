import { eq } from 'drizzle-orm'
import { expandNode, mapRelationshipType } from '../../../utils/canvas-ai-service'
import { canvasNodes, canvasEdges } from '../../../../db/schema'
import { db } from '../../../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { projectId, nodeId, nodeContent, nodeType } = body

  if (!projectId || !nodeId || !nodeContent) {
    throw createError({
      statusCode: 400,
      message: 'Project ID, node ID, and node content are required'
    })
  }

  const result = await expandNode(nodeContent, nodeType || 'idea')

  const [sourceNode] = await db
    .select()
    .from(canvasNodes)
    .where(eq(canvasNodes.id, nodeId))
    .limit(1)

  if (!sourceNode) {
    throw createError({
      statusCode: 404,
      message: 'Source node not found'
    })
  }

  const baseX = (sourceNode.position as { x: number; y: number }).x
  const baseY = (sourceNode.position as { x: number; y: number }).y

  const createdNodes = []
  for (let i = 0; i < result.nodes.length; i++) {
    const node = result.nodes[i]
    const angle = (2 * Math.PI * i) / result.nodes.length
    const radius = 200

    const [created] = await db
      .insert(canvasNodes)
      .values({
        projectId,
        type: node.type,
        position: {
          x: baseX + Math.cos(angle) * radius,
          y: baseY + Math.sin(angle) * radius
        },
        data: {
          text: node.content,
          ...node.metadata
        }
      })
      .returning()

    createdNodes.push(created)
  }

  const createdEdges = []
  for (const conn of result.connections) {
    const sourceId = conn.sourceIndex === 0 ? nodeId : createdNodes[conn.sourceIndex - 1]?.id
    const targetId = createdNodes[conn.targetIndex - 1]?.id

    if (sourceId && targetId) {
      const [edge] = await db
        .insert(canvasEdges)
        .values({
          projectId,
          sourceId,
          targetId,
          type: mapRelationshipType(conn.relationship),
          label: conn.relationship.replace('_', ' ')
        })
        .returning()

      createdEdges.push(edge)
    }
  }

  return {
    nodes: createdNodes,
    edges: createdEdges
  }
})
