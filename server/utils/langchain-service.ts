import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { BaseMessage } from '@langchain/core/messages'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { useRuntimeConfig } from '#imports'
import type { z } from 'zod'

interface LangChainConfig {
  provider: 'ollama' | 'openrouter'
  model: string
  baseURL?: string
  apiKey?: string
  temperature?: number
  maxRetries?: number
}

interface GenerateOptions<T extends z.ZodType> {
  prompt: string
  systemPrompt?: string
  schema: T
  context?: Array<{ role: 'user' | 'assistant'; content: string }>
  maxRetries?: number
}

type Message = { role: 'human' | 'ai'; content: string }

class LangChainService {
  private config: LangChainConfig
  private model: BaseChatModel
  private outputParser: StringOutputParser

  constructor(config?: Partial<LangChainConfig>) {
    const runtimeConfig = useRuntimeConfig()

    this.config = {
      provider: (config?.provider || runtimeConfig.llmProvider || 'ollama') as
        | 'ollama'
        | 'openrouter',
      model: config?.model || runtimeConfig.llmModel || 'gemma3:4b',
      baseURL: config?.baseURL || runtimeConfig.llmBaseUrl || 'http://localhost:11434',
      apiKey: config?.apiKey || runtimeConfig.llmApiKey,
      temperature: config?.temperature ?? 0.7,
      maxRetries: config?.maxRetries ?? 3
    }

    this.model = this.initializeModel()
    this.outputParser = new StringOutputParser()
  }

  private initializeModel(): BaseChatModel {
    if (this.config.provider === 'ollama') {
      return new ChatOllama({
        baseUrl: this.config.baseURL,
        model: this.config.model,
        temperature: this.config.temperature
      })
    }

    if (this.config.provider === 'openrouter') {
      if (!this.config.apiKey) {
        throw new Error('OpenRouter API key not configured')
      }

      return new ChatOpenAI({
        apiKey: this.config.apiKey,
        model: this.config.model,
        temperature: this.config.temperature,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Idea Studio'
          }
        }
      })
    }

    throw new Error(`Unsupported provider: ${this.config.provider}`)
  }

  async generateStructured<T extends z.ZodType>(options: GenerateOptions<T>): Promise<z.infer<T>> {
    const { prompt, systemPrompt, schema, context = [], maxRetries } = options
    const retries = maxRetries ?? this.config.maxRetries ?? 3

    let lastError: Error | null = null

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const messages = this.buildMessages(
          prompt,
          systemPrompt,
          context,
          attempt > 0 ? lastError?.message : undefined
        )
        const chain = this.model.pipe(this.outputParser)
        const rawOutput = await chain.invoke(messages)

        const jsonStr = this.extractJson(rawOutput)
        const parsed = JSON.parse(jsonStr)
        const validated = schema.parse(parsed)

        return validated as z.infer<T>
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < retries - 1) {
          console.warn(`Attempt ${attempt + 1}/${retries} failed:`, lastError.message)
        }
      }
    }

    throw new Error(`Failed after ${retries} attempts: ${lastError?.message}`)
  }

  private buildMessages(
    prompt: string,
    systemPrompt: string | undefined,
    context: Array<{ role: 'user' | 'assistant'; content: string }>,
    retryHint?: string
  ): BaseMessage[] {
    const msgs: BaseMessage[] = []

    const sysContent = systemPrompt
      ? `${systemPrompt}\n\nCRITICAL: Output ONLY valid JSON. No markdown, no explanations, no extra text before or after the JSON.`
      : 'Output ONLY valid JSON. No markdown, no explanations, no extra text.'

    msgs.push(new SystemMessage(sysContent))

    context.forEach(msg => {
      if (msg.role === 'user') {
        msgs.push(new HumanMessage(msg.content))
      } else {
        msgs.push(new AIMessage(msg.content))
      }
    })

    const userPrompt = retryHint
      ? `${prompt}\n\nPrevious attempt failed: ${retryHint}. Please output valid JSON only.`
      : prompt

    msgs.push(new HumanMessage(userPrompt))

    return msgs
  }

  private extractJson(raw: string): string {
    const cleaned = raw
      .trim()
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()

    try {
      JSON.parse(cleaned)
      return cleaned
    } catch {
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        try {
          JSON.parse(arrayMatch[0])
          return arrayMatch[0]
        } catch {
          return this.fixJson(arrayMatch[0])
        }
      }

      const objectMatch = cleaned.match(/\{[\s\S]*\}/)
      if (objectMatch) {
        try {
          JSON.parse(objectMatch[0])
          return objectMatch[0]
        } catch {
          return this.fixJson(objectMatch[0])
        }
      }

      return cleaned
    }
  }

  private fixJson(jsonStr: string): string {
    let fixed = jsonStr
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
      .replace(/:\s*'([^']*)'/g, ': "$1"')

    try {
      JSON.parse(fixed)
      return fixed
    } catch {
      return jsonStr
    }
  }

  async generateWithFallback<T extends z.ZodType>(
    options: GenerateOptions<T>,
    fallback: z.infer<T>
  ): Promise<z.infer<T>> {
    try {
      return await this.generateStructured(options)
    } catch (error) {
      console.error('LangChain generation failed, using fallback:', error)
      return fallback
    }
  }
}

let langChainServiceInstance: LangChainService | null = null

export function useLangChainService(config?: Partial<LangChainConfig>): LangChainService {
  if (!langChainServiceInstance || config) {
    langChainServiceInstance = new LangChainService(config)
  }
  return langChainServiceInstance
}
