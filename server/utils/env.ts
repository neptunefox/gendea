export function validateEnv(): void {
  const config = useRuntimeConfig()

  if (!config.llmProvider) {
    throw new Error('LLM_PROVIDER environment variable is required')
  }

  if (!config.llmModel) {
    throw new Error('LLM_MODEL environment variable is required')
  }

  if (config.llmProvider === 'openrouter' && !config.llmApiKey) {
    throw new Error('LLM_API_KEY is required when using OpenRouter provider')
  }

  if (config.llmProvider === 'ollama' && !config.llmBaseUrl) {
    throw new Error('LLM_BASE_URL is required when using Ollama provider')
  }
}
