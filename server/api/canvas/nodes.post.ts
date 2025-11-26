import { canvasNodes } from '../../../db/schema'
import { db } from '../../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { projectId, type, position, data } = body

  if (!projectId || !type || !position || !data) {
    throw createError({
      statusCode: 400,
      message: 'Project ID, type, position, and data are required'
    })
  }

  const [node] = await db
    .insert(canvasNodes)
    .values({
      projectId,
      type,
      position,
      data
    })
    .returning()

  return { node }
})
