import { useLLMService } from '../../utils/llm'

interface AlternativesRequest {
  branchId: string
  northStar: string
  failedApproach: string
}

export default defineEventHandler(async event => {
  const body = await readBody<AlternativesRequest>(event)
  const { branchId, northStar, failedApproach } = body

  if (!branchId || !northStar) {
    throw createError({
      statusCode: 400,
      message: 'branchId and northStar are required'
    })
  }

  const llm = useLLMService()

  const prompt = `You are helping someone find alternative routes to their goal after their current approach stalled.

North Star (their core goal): ${northStar}

Previous approach that didn't work: ${failedApproach || 'Not specified'}

Generate 3 alternative approaches that:
1. Still serve the same North Star
2. Are meaningfully different from the failed approach
3. Are concrete and actionable
4. Consider what might have caused the previous approach to fail

Format your response as a JSON array of objects with "title" and "description" fields.
Example: [{"title": "Approach name", "description": "Brief description of the approach"}]

Return only the JSON array, no other text.`

  const response = await llm.generate(prompt)

  let alternatives
  try {
    alternatives = JSON.parse(response)
  } catch {
    alternatives = [
      {
        title: 'Simplified Version',
        description: 'Start with a much smaller, simpler version of the same goal'
      },
      {
        title: 'Different Angle',
        description: 'Approach the same goal from a completely different direction'
      },
      {
        title: 'Partner Up',
        description: 'Find someone to collaborate with who has complementary skills'
      }
    ]
  }

  return { alternatives }
})
