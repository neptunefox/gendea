export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  features: {
    inlineStyles: true
  },
  runtimeConfig: {
    llmProvider: process.env.LLM_PROVIDER || 'ollama',
    llmModel: process.env.LLM_MODEL || 'gemma3:4b',
    llmBaseUrl: process.env.LLM_BASE_URL || 'http://localhost:11434',
    llmApiKey: process.env.LLM_API_KEY || ''
  },
  app: {
    head: {
      title: 'Gendea - Idea Flow',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Structured creative thinking from capture to execution'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap'
        }
      ]
    }
  }
})
