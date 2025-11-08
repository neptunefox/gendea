import { useLLMService } from '../utils/llm'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { problem, userIdeas } = body

  const aiIdeas = await generateDivergerIdeas(problem, userIdeas)

  return {
    ideas: aiIdeas
  }
})

async function generateDivergerIdeas(problem: string, userIdeas: string[]): Promise<string[]> {
  const ideas: string[] = []

  const antiPrototypePrompt = `Given the problem: "${problem}"
User has suggested: ${userIdeas.join(', ')}

Generate ONE creative solution that deliberately avoids the obvious or common approaches. Think of what most people would NOT do.`

  const oneHourPrompt = `Given the problem: "${problem}"

Generate ONE solution that can be completed in under 1 hour. Be specific and actionable.`

  const under100Prompt = `Given the problem: "${problem}"

Generate ONE solution that costs less than $100. Focus on resourcefulness and creativity within budget.`

  const weirdPrompt = `Given the problem: "${problem}"

Generate ONE weird, unconventional, or playful solution. Don't worry about practicality - be creative and surprising.`

  const constraintPrompt = `Given the problem: "${problem}"

Generate ONE solution using only skills and resources you already have. No new purchases or learning required.`

  const prompts = [
    antiPrototypePrompt,
    oneHourPrompt,
    under100Prompt,
    weirdPrompt,
    constraintPrompt
  ]

  for (const prompt of prompts) {
    const idea = await generateSingleIdea(prompt)
    ideas.push(idea)
  }

  return ideas.slice(0, 3)
}

async function generateSingleIdea(prompt: string): Promise<string> {
  const llm = useLLMService()
  const systemPrompt =
    'You are a creative ideation assistant. Generate concise, actionable ideas. Respond with just the idea itself, no preamble or explanation.'

  try {
    const idea = await llm.generate(prompt, systemPrompt)
    return idea.trim()
  } catch (error) {
    console.error('Failed to generate idea:', error)
    return `[Error generating idea: ${error instanceof Error ? error.message : 'Unknown error'}]`
  }
}
