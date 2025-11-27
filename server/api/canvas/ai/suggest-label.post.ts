import { suggestConnectionLabel, mapRelationshipType } from '../../../utils/canvas-ai-service'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { sourceContent, targetContent } = body

  if (!sourceContent || !targetContent) {
    throw createError({
      statusCode: 400,
      message: 'Source and target content are required'
    })
  }

  const result = await suggestConnectionLabel(sourceContent, targetContent)

  return {
    label: result.label,
    relationship: mapRelationshipType(result.relationship)
  }
})
