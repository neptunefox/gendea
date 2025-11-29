import {
  SPARK_CORE_IDEAS_SYSTEM_PROMPT,
  SPARK_LENS_SYSTEM_PROMPT,
  CAULDRON_SYNTHESIS_SYSTEM_PROMPT,
  CANVAS_EXPAND_SYSTEM_PROMPT,
  CANVAS_CONNECTION_LABEL_SYSTEM_PROMPT,
  PROACTIVE_QUESTION_SYSTEM_PROMPT,
  PROACTIVE_TOOL_SYSTEM_PROMPT,
  buildSparkCoreIdeasPrompt,
  buildSparkLensPrompt,
  buildCauldronSynthesisPrompt,
  buildCanvasExpandPrompt,
  buildCanvasConnectionLabelPrompt,
  buildProactiveQuestionPrompt,
  buildProactiveToolPrompt,
  formatSparkHistory
} from './langchain-prompts'
import {
  SparkCoreIdeasSchema,
  SparkLensSchema,
  CauldronOutputSchema,
  CanvasExpandSchema,
  CanvasConnectionLabelSchema,
  ProactiveQuestionSchema,
  ProactiveToolSchema
} from './langchain-schemas'
import { useLangChainService } from './langchain-service'
import type { SparkHistoryEntry } from './langchain-types'

export async function generateSparkCoreIdeas(topic: string, history: SparkHistoryEntry[] = []) {
  const langchain = useLangChainService()
  const historyText = formatSparkHistory(history)

  const result = await langchain.generateStructured({
    prompt: buildSparkCoreIdeasPrompt(topic, historyText),
    systemPrompt: SPARK_CORE_IDEAS_SYSTEM_PROMPT,
    schema: SparkCoreIdeasSchema
  })

  return result
}

export async function generateSparkLens(
  topic: string,
  lensId: string,
  history: SparkHistoryEntry[] = []
) {
  const langchain = useLangChainService()
  const historyText = formatSparkHistory(history)
  const prompt = buildSparkLensPrompt(topic, lensId, historyText)

  if (!prompt) {
    throw new Error(`Unknown lens: ${lensId}`)
  }

  const result = await langchain.generateStructured({
    prompt,
    systemPrompt: SPARK_LENS_SYSTEM_PROMPT,
    schema: SparkLensSchema
  })

  return result
}

export async function generateCauldronSynthesis(ingredients: Array<{ content: string }>) {
  const langchain = useLangChainService()

  const result = await langchain.generateStructured({
    prompt: buildCauldronSynthesisPrompt(ingredients),
    systemPrompt: CAULDRON_SYNTHESIS_SYSTEM_PROMPT,
    schema: CauldronOutputSchema
  })

  return result
}

export async function generateCanvasExpand(nodeContent: string, nodeType: string = 'idea') {
  const langchain = useLangChainService()

  const result = await langchain.generateStructured({
    prompt: buildCanvasExpandPrompt(nodeContent, nodeType),
    systemPrompt: CANVAS_EXPAND_SYSTEM_PROMPT,
    schema: CanvasExpandSchema
  })

  return result
}

export async function generateCanvasConnectionLabel(sourceContent: string, targetContent: string) {
  const langchain = useLangChainService()

  const result = await langchain.generateStructured({
    prompt: buildCanvasConnectionLabelPrompt(sourceContent, targetContent),
    systemPrompt: CANVAS_CONNECTION_LABEL_SYSTEM_PROMPT,
    schema: CanvasConnectionLabelSchema
  })

  return result
}

export async function generateProactiveQuestion(nodeContent: string, nodeType: string = 'idea') {
  const langchain = useLangChainService()

  const result = await langchain.generateStructured({
    prompt: buildProactiveQuestionPrompt(nodeContent, nodeType),
    systemPrompt: PROACTIVE_QUESTION_SYSTEM_PROMPT,
    schema: ProactiveQuestionSchema
  })

  return result
}

export async function generateProactiveTool(nodeContent: string) {
  const langchain = useLangChainService()

  const result = await langchain.generateStructured({
    prompt: buildProactiveToolPrompt(nodeContent),
    systemPrompt: PROACTIVE_TOOL_SYSTEM_PROMPT,
    schema: ProactiveToolSchema
  })

  return result
}

export async function generateWithContext(topic: string, previousIdeas: string[]) {
  const langchain = useLangChainService()

  const context = previousIdeas.map((idea, idx) => ({
    role: 'user' as const,
    content: `Previous idea ${idx + 1}: ${idea}`
  }))

  const result = await langchain.generateStructured({
    prompt: buildSparkCoreIdeasPrompt(topic, previousIdeas.join('\n')),
    systemPrompt: SPARK_CORE_IDEAS_SYSTEM_PROMPT,
    schema: SparkCoreIdeasSchema,
    context
  })

  return result
}

export async function generateWithFallback(topic: string) {
  const langchain = useLangChainService()

  const fallback = {
    synthesis: `A synthesized idea about ${topic} (fallback)`
  }

  const result = await langchain.generateWithFallback(
    {
      prompt: buildCauldronSynthesisPrompt([{ content: topic }]),
      systemPrompt: CAULDRON_SYNTHESIS_SYSTEM_PROMPT,
      schema: CauldronOutputSchema
    },
    fallback
  )

  return result
}
