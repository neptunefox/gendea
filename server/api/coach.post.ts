import { createError } from 'nuxt/app'
import { useLLMService } from '~/server/utils/llm'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { action, context, mode = 'plan' } = body

  const llm = useLLMService()

  if (mode === 'critique') {
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

    const userPrompt = `Rewrite this critique into high standards with assurance and concrete steps:

Input: ${action}

${context ? `Context: ${context}` : ''}

Avoid any person labels and focus on assumptions and evidence.`

    try {
      const response = await llm.generate(userPrompt, systemPrompt)

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to parse Coach critique response')
      }

      const critique = JSON.parse(jsonMatch[0])

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
  }

  const systemPrompt = `You are a Coach agent helping users create effective if-then plans. Your role is to:
1. Turn vague user actions into concrete, specific if-then plans
2. Suggest appropriate dates, times, and places based on the action
3. Maintain psychological safety by focusing on process, not person
4. State high standards while affirming the user's ability to reach them

Format your response as JSON with these fields:
{
  "action": "specific action statement",
  "suggestedDate": "YYYY-MM-DD format, within next 7 days",
  "suggestedTime": "HH:MM format in 24-hour time",
  "suggestedPlace": "specific location",
  "reasoning": "brief explanation of your suggestions"
}`

  const userPrompt = `Help me create an if-then plan for this action:

Action: ${action}

${context ? `Context: ${context}` : ''}

Provide a concrete if-then plan with specific date, time, and place suggestions.`

  try {
    const response = await llm.generate(userPrompt, systemPrompt)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse Coach response')
    }

    const plan = JSON.parse(jsonMatch[0])

    return {
      action: plan.action,
      suggestedDate: plan.suggestedDate,
      suggestedTime: plan.suggestedTime,
      suggestedPlace: plan.suggestedPlace,
      reasoning: plan.reasoning
    }
  } catch (error) {
    console.error('Coach agent error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate if-then plan'
    })
  }
})
