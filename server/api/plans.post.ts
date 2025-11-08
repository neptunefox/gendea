import { useLLMService } from '../utils/llm'

interface PlanRequest {
  idea: string
  constraints: {
    timeCap: boolean
    moneyCap: boolean
    skillsOnHand: boolean
  }
}

interface MicroPlan {
  description: string
  test: {
    metric: string
    passThreshold: string
    failThreshold: string
  }
}

export default defineEventHandler(async event => {
  const body = await readBody<PlanRequest>(event)
  const { idea, constraints } = body

  const llm = useLLMService()

  const constraintText = buildConstraintText(constraints)

  const systemPrompt = `You are a planning agent that creates practical micro-plans. Each plan should be concrete, actionable, and include a smallest honest test with clear metrics and thresholds.`

  const userPrompt = `Generate 2 micro-plans for this idea: "${idea}"

${constraintText}

For each plan:
1. Describe a concrete, actionable approach
2. Include one smallest honest test with:
   - A specific metric to measure
   - A pass threshold (what success looks like)
   - A fail threshold (what failure looks like)

Format your response as JSON array with this structure:
[
  {
    "description": "plan description",
    "test": {
      "metric": "what to measure",
      "passThreshold": "success criteria",
      "failThreshold": "failure criteria"
    }
  }
]`

  try {
    const response = await llm.generate(userPrompt, systemPrompt)
    const plans = JSON.parse(response) as MicroPlan[]

    return {
      plans: plans.slice(0, 2)
    }
  } catch (error) {
    console.error('Failed to generate plans:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate plans'
    })
  }
})

function buildConstraintText(constraints: PlanRequest['constraints']): string {
  const activeConstraints: string[] = []

  if (constraints.timeCap) {
    activeConstraints.push('- Time limit: 1 hour maximum')
  }
  if (constraints.moneyCap) {
    activeConstraints.push('- Budget limit: $100 maximum')
  }
  if (constraints.skillsOnHand) {
    activeConstraints.push('- Use only existing skills and resources')
  }

  if (activeConstraints.length === 0) {
    return ''
  }

  return `Constraints:\n${activeConstraints.join('\n')}`
}
