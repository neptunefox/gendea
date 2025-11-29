import { createError, setResponseHeader } from 'h3'

import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { mode, idea } = body

  if (mode !== 'test-suggestions') {
    throw createError({ statusCode: 400, message: 'Only test-suggestions mode supports streaming' })
  }

  const config = useRuntimeConfig()
  const provider = config.llmProvider || 'ollama'
  const model = config.llmModel || 'gemma3:4b'
  const baseURL = config.llmBaseUrl || 'http://localhost:11434'
  const apiKey = config.llmApiKey

  const systemPrompt = `You are a research-backed coach helping users design tiny, honest tests.

Return EXACT JSON format - output each test object on its own line as it's ready:
{"test":{"description":"test description","successSignal":"measurable signal"}}

Rules:
- Each test should take less than 1 hour and cost under $50
- Tests must have clear, measurable success signals
- Focus on gathering evidence, not building the full thing
- Keep descriptions to 1-2 sentences max
- Output exactly 3 tests, one JSON object per line`

  const userPrompt = `Idea: "${idea}"

Generate 3 smallest honest tests to validate this idea. Output each test as a separate JSON line.`

  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (provider === 'ollama') {
          await streamOllama(controller, encoder, baseURL, model, systemPrompt, userPrompt)
        } else if (provider === 'openrouter') {
          await streamOpenRouter(controller, encoder, apiKey, model, systemPrompt, userPrompt)
        }
        controller.close()
      } catch (error) {
        console.error('Stream error:', error)
        controller.enqueue(
          encoder.encode(
            `data: {"error":"${error instanceof Error ? error.message : 'Stream failed'}"}\n\n`
          )
        )
        controller.close()
      }
    }
  })

  return stream
})

async function streamOllama(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  baseURL: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
) {
  const response = await fetch(`${baseURL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: true
    })
  })

  if (!response.ok || !response.body) {
    throw new Error('Failed to connect to Ollama')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const chunk = JSON.parse(line)
        if (chunk.message?.content) {
          controller.enqueue(
            encoder.encode(`data: {"token":"${escapeJson(chunk.message.content)}"}\n\n`)
          )
        }
      } catch {
        // Skip malformed lines
      }
    }
  }

  controller.enqueue(encoder.encode(`data: {"done":true}\n\n`))
}

async function streamOpenRouter(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  apiKey: string | undefined,
  model: string,
  systemPrompt: string,
  userPrompt: string
) {
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Idea Studio'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: true
    })
  })

  if (!response.ok || !response.body) {
    throw new Error('Failed to connect to OpenRouter')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') continue

      try {
        const chunk = JSON.parse(data)
        const content = chunk.choices?.[0]?.delta?.content
        if (content) {
          controller.enqueue(encoder.encode(`data: {"token":"${escapeJson(content)}"}\n\n`))
        }
      } catch {
        // Skip malformed lines
      }
    }
  }

  controller.enqueue(encoder.encode(`data: {"done":true}\n\n`))
}

function escapeJson(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}
