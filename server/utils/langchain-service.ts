import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { ChatOpenAI } from '@langchain/community/chat_models/openai'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts'
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

class LangChainService {
  private config: LangChainConfig
  private model: BaseChatModel

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
  }

  private initializeModel(): BaseChatModel {
    if (this.config.provider === 'ollama') {
      return new ChatOllama({
        baseUrl: this.config.baseURL,
        model: this.config.model,
        temperature: this.config.temperature,
        format: 'json'
      })
    } else if (this.config.provider === 'openrouter') {
      if (!this.config.apiKey) {
        throw new Error('OpenRouter API key not configured')
      }

      return new ChatOpenAI({
        openAIApiKey: this.config.apiKey,
        modelName: this.config.model,
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

    const parser = StructuredOutputParser.fromZodSchema(schema)
    const formatInstructions = parser.getFormatInstructions()

    const messages = []

    if (systemPrompt) {
      messages.push({
        role: 'system' as const,
        content: `${systemPrompt}\n\n${formatInstructions}`
      })
    } else {
      messages.push({
        role: 'system' as const,
        content: formatInstructions
      })
    }

    context.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? ('human' as const) : ('ai' as const),
        content: msg.content
      })
    })

    messages.push({
      role: 'human' as const,
      content: prompt
    })

    let lastError: Error | null = null

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const promptTemplate = ChatPromptTemplate.fromMessages(
          messages.map(msg => {
            if (msg.role === 'system') {
              return ['system', msg.content]
            } else if (msg.role === 'human') {
              return HumanMessagePromptTemplate.fromTemplate(msg.content)
            } else {
              return ['ai', msg.content]
            }
          })
        )

        const chain = promptTemplate.pipe(this.model).pipe(parser)
        const result = await chain.invoke({})

        return result as z.infer<T>
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < retries - 1) {
          console.warn(
            `Schema validation failed (attempt ${attempt + 1}/${retries}):`,
            lastError.message
          )

          messages.push({
            role: 'human' as const,
            content: `The previous response failed validation: ${lastError.message}. Please try again with valid JSON that matches the schema.`
          })
        }
      }
    }

    throw new Error(
      `Failed to generate valid structured output after ${retries} attempts: ${lastError?.message}`
    )
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
