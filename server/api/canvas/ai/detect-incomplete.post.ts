import { detectIncompleteNode } from '../../../utils/canvas-ai-service'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { nodeContent, nodeType } = body

  if (!nodeContent) {
    throw createError({
      statusCode: 400,
      message: 'Node content is required'
    })
  }

  const result = await detectIncompleteNode(nodeContent, nodeType || 'idea')

  return {
    isIncomplete: result.isIncomplete,
    missingElements: result.missingElements,
    suggestedQuestion: result.suggestedQuestion
  }
})
