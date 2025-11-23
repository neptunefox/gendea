import {
  SparkCoreIdeasSchema,
  SparkLensSchema,
  CauldronOutputSchema,
  CanvasExpandSchema,
  ProactiveQuestionSchema
} from './langchain-schemas'
import { useLangChainService } from './langchain-service'

export async function exampleSparkGeneration(topic: string) {
  const langchain = useLangChainService()

  const result = await langchain.generateStructured({
    prompt: `Generate 5-6 diverse, specific, actionable ideas for: "${topic}"`,
    systemPrompt: `You are a creative ideation assistant. Generate diverse, specific, actionable ideas.
Each idea must be specific and actionable (1-2 sentences max).
Vary the approach (practical, creative, unconventional).`,
    schema: SparkCoreIdeasSchema
  })

  return result
}

export async function exampleLensGeneration(topic: string, lensPrompt: string) {
  const langchain = useLangChainService()

  const result = await langchain.generateStructured({
    prompt: lensPrompt,
    systemPrompt: `You are a creative partner who outputs strict JSON.
Ideas should be punchy (max 2 sentences) and tailored to the instructions.`,
    schema: SparkLensSchema
  })

  return result
}

export async function exampleCauldronSynthesis(ingredients: string[]) {
  const langchain = useLangChainService()

  const ingredientsList = ingredients.map((ing, idx) => `${idx + 1}. ${ing}`).join('\n')

  const result = await langchain.generateStructured({
    prompt: `Analyze the patterns in these ${ingredients.length} ingredients and synthesize them into ONE compelling idea:\n\n${ingredientsList}`,
    systemPrompt: `You are a convergent synthesis assistant. Analyze patterns across multiple ideas and synthesize them into ONE compelling, actionable idea.
The synthesis should be 2-3 sentences that capture the deeper pattern.`,
    schema: CauldronOutputSchema
  })

  return result
}

export async function exampleCanvasExpand(nodeContent: string) {
  const langchain = useLangChainService()

  const result = await langchain.generateStructured({
    prompt: `Expand this idea into 3-5 related subtasks or concepts: "${nodeContent}"`,
    systemPrompt: `You are a planning assistant. Generate related nodes that break down or expand the given idea.`,
    schema: CanvasExpandSchema
  })

  return result
}

export async function exampleProactiveQuestion(nodeContent: string) {
  const langchain = useLangChainService()

  const result = await langchain.generateStructured({
    prompt: `Analyze this idea and determine if it needs clarification: "${nodeContent}"`,
    systemPrompt: `You are a proactive assistant. Determine if the idea is vague and needs clarifying questions.`,
    schema: ProactiveQuestionSchema
  })

  return result
}

export async function exampleWithContext(topic: string, previousIdeas: string[]) {
  const langchain = useLangChainService()

  const context = previousIdeas.map((idea, idx) => ({
    role: 'user' as const,
    content: `Previous idea ${idx + 1}: ${idea}`
  }))

  const result = await langchain.generateStructured({
    prompt: `Generate new ideas for "${topic}" that are different from the previous ones.`,
    systemPrompt: 'You are a creative ideation assistant.',
    schema: SparkCoreIdeasSchema,
    context
  })

  return result
}

export async function exampleWithFallback(topic: string) {
  const langchain = useLangChainService()

  const fallback = {
    synthesis: `A synthesized idea about ${topic} (fallback)`
  }

  const result = await langchain.generateWithFallback(
    {
      prompt: `Synthesize: ${topic}`,
      schema: CauldronOutputSchema
    },
    fallback
  )

  return result
}
