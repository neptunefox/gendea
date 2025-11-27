import { detectUnrelatedConnection } from '../../../utils/canvas-ai-service'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { sourceContent, targetContent } = body

  if (!sourceContent || !targetContent) {
    throw createError({
      statusCode: 400,
      message: 'Source and target content are required'
    })
  }

  const result = await detectUnrelatedConnection(sourceContent, targetContent)

  return {
    areUnrelated: result.areUnrelated,
    suggestedIntermediateSteps: result.suggestedIntermediateSteps,
    reasoning: result.reasoning
  }
})
