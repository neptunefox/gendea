import { useLLMService } from '../utils/llm'

interface PlanRequest {
  idea: string
  constraints: {
    timeCap: boolean
    moneyCap: boolean
    skillsOnHand: boolean
  }
}

interface TestOption {
  metric: string
  passThreshold: string
  failThreshold: string
}

interface MicroPlan {
  description: string
  tests: TestOption[]
}

export default defineEventHandler(async event => {
  const body = await readBody<PlanRequest>(event)
  const { idea, constraints } = body

  const llm = useLLMService()

  const constraintText = buildConstraintText(constraints)

  const systemPrompt = `You are a planning agent that creates practical micro-plans. Each plan should be concrete, actionable, and include a smallest honest test with clear metrics and thresholds.

CRITICAL: You must respond with ONLY valid JSON. No explanations, no markdown, no code blocks. Just the raw JSON array.`

  const userPrompt = `Generate 2 micro-plans for this idea: "${idea}"

${constraintText}

For each plan:
1. Describe a concrete, actionable approach
2. Propose 2-3 smallest honest tests, each with:
   - A specific metric to measure
   - A pass threshold (what success looks like)
   - A fail threshold (what failure looks like)

Respond with ONLY this JSON structure (no markdown, no code blocks):
[
  {
    "description": "plan description",
    "tests": [
      {
        "metric": "what to measure",
        "passThreshold": "success criteria",
        "failThreshold": "failure criteria"
      }
    ]
  }
]`

  try {
    let response = await llm.generate(userPrompt, systemPrompt)

    response = response.trim()
    if (response.startsWith('```json')) {
      response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (response.startsWith('```')) {
      response = response.replace(/```\n?/g, '')
    }

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('No JSON array found in response:', response)
      throw new Error('Failed to extract JSON from LLM response')
    }

    const plans = JSON.parse(jsonMatch[0]) as MicroPlan[]

    return {
      plans: plans.slice(0, 2)
    }
  } catch (error) {
    console.error('Failed to generate plans:', error)

    return {
      plans: [
        {
          description: `Test ${idea} with a small prototype`,
          tests: [
            {
              metric: 'User feedback score',
              passThreshold: '3+ positive responses',
              failThreshold: 'Less than 2 positive responses'
            },
            {
              metric: 'Time to complete',
              passThreshold: 'Under 1 hour',
              failThreshold: 'Over 2 hours'
            }
          ]
        },
        {
          description: `Research and validate ${idea} with existing examples`,
          tests: [
            {
              metric: 'Similar examples found',
              passThreshold: '3+ working examples',
              failThreshold: 'No working examples'
            }
          ]
        }
      ]
    }
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
