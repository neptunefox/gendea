import { useLLMService } from '../utils/llm'

interface SkepticRequest {
  plan: string
  userFailureReason?: string
}

interface FailureCause {
  cause: string
  test: string
}

interface SkepticResponse {
  failureCauses: FailureCause[]
  criticalAssumption: string
}

export default defineEventHandler(async event => {
  const body = await readBody<SkepticRequest>(event)
  const { plan, userFailureReason } = body

  const llm = useLLMService()

  const systemPrompt = `You are a skeptic agent that helps identify risks through pre-mortem analysis. Imagine the plan has failed six months from now and identify the most likely causes.

CRITICAL: You must respond with ONLY valid JSON. No explanations, no markdown, no code blocks. Just the raw JSON object.`

  const userContext = userFailureReason ? `\n\nUser's concern: "${userFailureReason}"` : ''

  const userPrompt = `Imagine it's six months from now and this plan has failed: "${plan}"${userContext}

Identify the 3 most likely causes of failure, each with one specific test to validate that risk.

Then, identify which assumption would most likely change first if this plan is heading toward failure.

Respond with ONLY this JSON structure (no markdown, no code blocks):
{
  "failureCauses": [
    {
      "cause": "description of failure cause",
      "test": "specific test to validate this risk"
    }
  ],
  "criticalAssumption": "the assumption most likely to change first"
}`

  try {
    let response = await llm.generate(userPrompt, systemPrompt)

    response = response.trim()
    if (response.startsWith('```json')) {
      response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (response.startsWith('```')) {
      response = response.replace(/```\n?/g, '')
    }

    const analysis = JSON.parse(response) as SkepticResponse

    return {
      failureCauses: analysis.failureCauses.slice(0, 3),
      criticalAssumption: analysis.criticalAssumption
    }
  } catch (error) {
    console.error('Failed to generate skeptic analysis:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate risk analysis'
    })
  }
})
