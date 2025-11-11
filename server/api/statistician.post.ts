import { createError } from 'h3'
import { useLLMService } from '../utils/llm'
import { db } from '../db'
import { archives } from '../../db/schema'

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

  const allArchives = await db.select().from(archives)

  const llm = useLLMService()

  const systemPrompt = `You are a statistician agent that provides base rates and realistic expectations based on similar past efforts. Be honest about success rates and timelines.

CRITICAL: You must respond with ONLY valid JSON. No explanations, no markdown, no code blocks. Just the raw JSON object.`

  let archiveContext = ''
  if (allArchives.length > 0) {
    const archiveSummaries = allArchives
      .map(
        (a, i) =>
          `${i + 1}. Branch: ${a.branchId} | Tests: ${a.tests.map(t => `${t.description} (${t.metric}${t.result ? ': ' + t.result : ''})`).join('; ')} | Evidence: ${a.evidence} | Advice: ${a.adviceToSelf}`
      )
      .join('\n')
    archiveContext = `\n\nPast learning archives from similar efforts (${allArchives.length} total):\n${archiveSummaries}\n\nAnalyze these archives to identify patterns relevant to the current plan. Use test results, evidence, and advice to inform your base rate estimates and comparable efforts.`
  }

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

Respond with ONLY this JSON structure (no markdown, no code blocks):
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

    userPrompt = `For this plan: "${plan}"${referenceText}${archiveContext}

List 3 comparable efforts and estimate base rates for:
1. Success rate
2. Time to first meaningful milestone

${allArchives.length > 0 ? 'Prioritize insights from the archived learnings above. Extract patterns from test results, evidence, and advice that relate to this plan.' : ''}

If you don't have enough data to provide reliable estimates, set needsUserInput to true.

Respond with ONLY this JSON structure (no markdown, no code blocks):
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
    let response = await llm.generate(userPrompt, systemPrompt)

    response = response.trim()
    if (response.startsWith('```json')) {
      response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (response.startsWith('```')) {
      response = response.replace(/```\n?/g, '')
    }

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
