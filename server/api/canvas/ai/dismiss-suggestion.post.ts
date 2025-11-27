import { eq } from 'drizzle-orm'
import { canvasNodes } from '../../../../db/schema'
import { db } from '../../../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { nodeId, suggestionType } = body

  if (!nodeId || !suggestionType) {
    throw createError({
      statusCode: 400,
      message: 'Node ID and suggestion type are required'
    })
  }

  const [node] = await db
    .select()
    .from(canvasNodes)
    .where(eq(canvasNodes.id, nodeId))
    .limit(1)

  if (!node) {
    throw createError({
      statusCode: 404,
      message: 'Node not found'
    })
  }

  const currentDismissed = (node.dismissedSuggestions as string[]) || []
  if (!currentDismissed.includes(suggestionType)) {
    await db
      .update(canvasNodes)
      .set({
        dismissedSuggestions: [...currentDismissed, suggestionType],
        updatedAt: new Date()
      })
      .where(eq(canvasNodes.id, nodeId))
  }

  return { success: true }
})
