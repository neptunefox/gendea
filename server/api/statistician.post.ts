import { useLLMService } from '../utils/llm'

interface StatisticianRequest {
  plan: string
  referenceClass?: string
  userCases?: Array<{
    description: string
    similarity: number
  }>
}

interface ComparableEffort {
  description: string
  successRate?: string
  timeToMilestone?: string
}

interface StatisticianResponse {
  comparableEfforts: ComparableEffort[]
  baseRates: {
    successRate?: string
    timeToFirstMilestone?: string
  }
  needsUserInput: boolean
}

export default defineEventHandler(async event => {
  const body = await readBody<StatisticianRequest>(event)
  const { plan, referenceClass, userCases } = body

  const llm = useLLMService()

  const systemPrompt = `You are a statistician agent that provides base rates and realistic expectations based on similar past efforts. Be honest about success rates and timelines.`

  let userPrompt: string

  if (userCases && userCases.length > 0) {
    const casesText = userCases
      .map((c, i) => `${i + 1}. ${c.description} (similarity: ${c.similarity}/10)`)
      .join('\n')

    userPrompt = `Based on these similar cases provided by the user:
${casesText}

For this plan: "${plan}"

Estimate:
1. Overall success rate
2. Time to first meaningful milestone

Format your response as JSON:
{
  "comparableEfforts": [
    {
      "description": "effort description",
      "successRate": "percentage or range",
      "timeToMilestone": "time estimate"
    }
  ],
  "baseRates": {
    "successRate": "overall percentage or range",
    "timeToFirstMilestone": "time estimate"
  },
  "needsUserInput": false
}`
  } else {
    const referenceText = referenceClass ? `\n\nReference class: "${referenceClass}"` : ''

    userPrompt = `For this plan: "${plan}"${referenceText}

List 3 comparable efforts and estimate base rates for:
1. Success rate
2. Time to first meaningful milestone

If you don't have enough data to provide reliable estimates, set needsUserInput to true.

Format your response as JSON:
{
  "comparableEfforts": [
    {
      "description": "effort description",
      "successRate": "percentage or range (if known)",
      "timeToMilestone": "time estimate (if known)"
    }
  ],
  "baseRates": {
    "successRate": "overall percentage or range (if known)",
    "timeToFirstMilestone": "time estimate (if known)"
  },
  "needsUserInput": true or false
}`
  }

  try {
    const response = await llm.generate(userPrompt, systemPrompt)
    const analysis = JSON.parse(response) as StatisticianResponse

    return {
      comparableEfforts: analysis.comparableEfforts.slice(0, 3),
      baseRates: analysis.baseRates,
      needsUserInput: analysis.needsUserInput
    }
  } catch (error) {
    console.error('Failed to generate statistician analysis:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate base rate analysis'
    })
  }
})
