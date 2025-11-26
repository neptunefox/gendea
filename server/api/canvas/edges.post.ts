import { canvasEdges } from '../../../db/schema'
import { db } from '../../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { projectId, sourceId, targetId, type, label, style } = body

  if (!projectId || !sourceId || !targetId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID, source ID, and target ID are required'
    })
  }

  const [edge] = await db
    .insert(canvasEdges)
    .values({
      projectId,
      sourceId,
      targetId,
      type: type || null,
      label: label || null,
      style: style || null
    })
    .returning()

  return { edge }
})
