import { useRuntimeConfig } from '#imports'

interface LLMConfig {
  provider: 'ollama' | 'openrouter'
  model: string
  baseURL?: string
  apiKey?: string
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LLMResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

class LLMService {
  private config: LLMConfig

  constructor(config?: Partial<LLMConfig>) {
    const runtimeConfig = useRuntimeConfig()

    this.config = {
      provider: (config?.provider || runtimeConfig.llmProvider || 'ollama') as
        | 'ollama'
        | 'openrouter',
      model: config?.model || runtimeConfig.llmModel || 'gemma3:4b',
      baseURL: config?.baseURL || runtimeConfig.llmBaseUrl || 'http://localhost:11434',
      apiKey: config?.apiKey || runtimeConfig.llmApiKey
    }
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: LLMMessage[] = []

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }

    messages.push({ role: 'user', content: prompt })

    const response = await this.chat(messages)
    return response.content
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      if (this.config.provider === 'ollama') {
        return await this.ollamaChat(messages)
      } else if (this.config.provider === 'openrouter') {
        return await this.openrouterChat(messages)
      }

      throw new Error(`Unsupported provider: ${this.config.provider}`)
    } catch (error) {
      console.error('LLM generation error:', error)
      throw new Error(
        `Failed to generate LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private async ollamaChat(messages: LLMMessage[]): Promise<LLMResponse> {
    interface OllamaResponse {
      message?: { content: string }
      prompt_eval_count?: number
      eval_count?: number
    }

    const rawResponse = await $fetch<string>(`${this.config.baseURL}/api/chat`, {
      method: 'POST',
      body: {
        model: this.config.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        stream: false
      }
    })

    const response: OllamaResponse =
      typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse

    if (!response.message?.content) {
      throw new Error(`Invalid response from Ollama: missing message.content`)
    }

    let content = response.message.content

    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.every(item => item.text)) {
        content = JSON.stringify(parsed.map(item => ({ text: item.text })))
      }
    } catch {
      // Content is not JSON, use as-is
    }

    return {
      content,
      usage:
        response.prompt_eval_count || response.eval_count
          ? {
              promptTokens: response.prompt_eval_count || 0,
              completionTokens: response.eval_count || 0,
              totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0)
            }
          : undefined
    }
  }

  private async openrouterChat(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    interface OpenRouterResponse {
      choices: Array<{ message: { content: string } }>
      usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
      }
    }

    const response = await $fetch<OpenRouterResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Idea Flow App'
        },
        body: {
          model: this.config.model,
          messages
        }
      }
    )

    return {
      content: response.choices[0].message.content,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens
          }
        : undefined
    }
  }
}

let llmServiceInstance: LLMService | null = null

export function useLLMService(config?: Partial<LLMConfig>): LLMService {
  if (!llmServiceInstance || config) {
    llmServiceInstance = new LLMService(config)
  }
  return llmServiceInstance
}
