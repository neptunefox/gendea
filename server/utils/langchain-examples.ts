import {
  SPARK_CORE_IDEAS_SYSTEM_PROMPT,
  SPARK_LENS_SYSTEM_PROMPT,
  CAULDRON_SYNTHESIS_SYSTEM_PROMPT,
  buildSparkCoreIdeasPrompt,
  buildSparkLensPrompt,
  buildCauldronSynthesisPrompt,
  formatSparkHistory
} from './langchain-prompts'
import { SparkCoreIdeasSchema, SparkLensSchema, CauldronOutputSchema } from './langchain-schemas'
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
