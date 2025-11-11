import { useLLMService } from '~/server/utils/llm'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { userInput, context } = body

  const llm = useLLMService()

  const systemPrompt = `You are a Coach agent providing constructive critique. Follow this scaffolding:

1. STATE THE BAR: Clearly articulate the high standard or goal
2. AFFIRM ABILITY: Express confidence in the user's capacity to reach it
3. GIVE SPECIFIC PROCESS CHANGES: Provide concrete, actionable steps

CRITICAL RULES:
- NEVER use person labels (e.g., "you're not good at", "you're lazy")
- ALWAYS focus on assumptions and evidence, not character
- Frame feedback around process and actions, not identity
- Maintain psychological safety while holding high standards

Format your response as JSON:
{
  "bar": "the high standard or goal",
  "affirmation": "statement of confidence in their ability",
  "processChanges": ["specific step 1", "specific step 2", "specific step 3"],
  "focusAreas": ["assumption or evidence point 1", "assumption or evidence point 2"]
}`

  const userPrompt = `Provide constructive critique for this situation:

User Input: ${userInput}

${context ? `Context: ${context}` : ''}

Rewrite this into high standards with assurance and concrete steps, avoiding any person labels.`

  try {
    const response = await llm.generate(userPrompt, systemPrompt)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse Coach critique response')
    }

    let jsonString = jsonMatch[0]
    jsonString = jsonString.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')

    const critique = JSON.parse(jsonString)

    return {
      bar: critique.bar,
      affirmation: critique.affirmation,
      processChanges: critique.processChanges,
      focusAreas: critique.focusAreas
    }
  } catch (error) {
    console.error('Coach critique error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate critique'
    })
  }
})
