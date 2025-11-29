import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { BaseMessage } from '@langchain/core/messages'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'
import type { z } from 'zod'

import { useRuntimeConfig } from '#imports'

interface LangChainConfig {
  provider: 'ollama' | 'openrouter' | 'gemini'
  model: string
  baseURL?: string
  apiKey?: string
  temperature?: number
}

interface GenerateOptions<T extends z.ZodType> {
  prompt: string
  systemPrompt?: string
  schema: T
  context?: Array<{ role: 'user' | 'assistant'; content: string }>
}

interface StreamOptions {
  prompt: string
  systemPrompt?: string
  context?: Array<{ role: 'user' | 'assistant'; content: string }>
  onToken: (token: string) => void
}

class LangChainService {
  private config: LangChainConfig
  private model: BaseChatModel

  constructor(config?: Partial<LangChainConfig>) {
    const runtimeConfig = useRuntimeConfig()

    this.config = {
      provider: (config?.provider || runtimeConfig.llmProvider || 'ollama') as
        | 'ollama'
        | 'openrouter'
        | 'gemini',
      model: config?.model || runtimeConfig.llmModel || 'gemma3:4b',
      baseURL: config?.baseURL || runtimeConfig.llmBaseUrl || 'http://localhost:11434',
      apiKey: config?.apiKey || runtimeConfig.llmApiKey,
      temperature: config?.temperature ?? 0.7
    }

    this.model = this.initializeModel()
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

    if (this.config.provider === 'gemini') {
      if (!this.config.apiKey) {
        throw new Error('Google API key not configured')
      }

      return new ChatGoogleGenerativeAI({
        apiKey: this.config.apiKey,
        model: this.config.model,
        temperature: this.config.temperature
      })
    }

    throw new Error(`Unsupported provider: ${this.config.provider}`)
  }

  async generateStructured<T extends z.ZodType>(options: GenerateOptions<T>): Promise<z.infer<T>> {
    const { prompt, systemPrompt, schema, context = [] } = options
    const messages = this.buildMessages(prompt, systemPrompt, context)

    if (this.config.provider === 'ollama') {
      const ollamaModel = new ChatOllama({
        baseUrl: this.config.baseURL,
        model: this.config.model,
        temperature: this.config.temperature,
        format: 'json'
      })
      const response = await ollamaModel.invoke(messages)
      const content = typeof response.content === 'string' ? response.content : ''
      return schema.parse(JSON.parse(content))
    }

    const structuredModel = this.model.withStructuredOutput(schema)
    return await structuredModel.invoke(messages)
  }

  private buildMessages(
    prompt: string,
    systemPrompt: string | undefined,
    context: Array<{ role: 'user' | 'assistant'; content: string }>
  ): BaseMessage[] {
    const msgs: BaseMessage[] = []

    if (systemPrompt) {
      msgs.push(new SystemMessage(systemPrompt))
    }

    context.forEach(msg => {
      if (msg.role === 'user') {
        msgs.push(new HumanMessage(msg.content))
      } else {
        msgs.push(new AIMessage(msg.content))
      }
    })

    msgs.push(new HumanMessage(prompt))

    return msgs
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

  async streamText(options: StreamOptions): Promise<string> {
    const { prompt, systemPrompt, context = [], onToken } = options
    const messages = this.buildMessages(prompt, systemPrompt, context)

    let fullText = ''

    const stream = await this.model.stream(messages)

    for await (const chunk of stream) {
      const content = typeof chunk.content === 'string' ? chunk.content : ''
      if (content) {
        fullText += content
        onToken(content)
      }
    }

    return fullText
  }
}

let langChainServiceInstance: LangChainService | null = null

export function useLangChainService(config?: Partial<LangChainConfig>): LangChainService {
  if (!langChainServiceInstance || config) {
    langChainServiceInstance = new LangChainService(config)
  }
  return langChainServiceInstance
}
