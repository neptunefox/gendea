import { canvasEdges } from '../../../db/schema'
import { db } from '../../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { projectId, sourceId, targetId, type, label, style, relationshipType } = body

  if (!projectId || !sourceId || !targetId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID, source ID, and target ID are required'
    })
  }

  const edgeStyle = style || {}
  if (relationshipType) {
    edgeStyle.relationshipType = relationshipType
  } else if (!edgeStyle.relationshipType) {
    edgeStyle.relationshipType = 'relates-to'
  }

  const [edge] = await db
    .insert(canvasEdges)
    .values({
      projectId,
      sourceId,
      targetId,
      type: type || 'relationship',
      label: label || null,
      style: edgeStyle
    })
    .returning()

  return { edge }
})
