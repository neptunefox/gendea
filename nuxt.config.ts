export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint'],
  runtimeConfig: {
    llmProvider: process.env.LLM_PROVIDER || 'ollama',
    llmModel: process.env.LLM_MODEL || 'qwen3:4b',
    llmBaseUrl: process.env.LLM_BASE_URL || 'http://localhost:11434',
    llmApiKey: process.env.LLM_API_KEY || ''
  }
})
