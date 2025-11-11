import { createError } from 'h3'
import { useLLMService } from '~/server/utils/llm'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { whatNext, context } = body

  if (!whatNext) {
    throw createError({
      statusCode: 400,
      message: 'whatNext is required'
    })
  }

  const llm = useLLMService()

  const systemPrompt = `You are a Coach agent generating if-then plan suggestions. Your role is to:
1. Create TWO distinct if-then plan options based on the user's "what next" statement
2. Make each option concrete and actionable
3. Suggest appropriate dates (within next 7 days), times, and places
4. Keep suggestions realistic and achievable

Format your response as JSON with exactly two suggestions:
{
  "suggestions": [
    {
      "action": "specific action statement",
      "suggestedDate": "YYYY-MM-DD format",
      "suggestedTime": "HH:MM format in 24-hour time",
      "suggestedPlace": "specific location",
      "reasoning": "brief explanation"
    },
    {
      "action": "alternative specific action",
      "suggestedDate": "YYYY-MM-DD format",
      "suggestedTime": "HH:MM format in 24-hour time",
      "suggestedPlace": "specific location",
      "reasoning": "brief explanation"
    }
  ]
}`

  const userPrompt = `Generate TWO if-then plan suggestions for this next action:

What Next: ${whatNext}

${context ? `Context: ${context}` : ''}

Provide two distinct, concrete if-then plans with specific date, time, and place suggestions.`

  try {
    const response = await llm.generate(userPrompt, systemPrompt)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse Coach suggestions response')
    }

    const result = JSON.parse(jsonMatch[0])

    if (!result.suggestions || result.suggestions.length !== 2) {
      throw new Error('Expected exactly 2 suggestions')
    }

    return result
  } catch (error) {
    console.error('If-then suggestions error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate if-then suggestions'
    })
  }
})
