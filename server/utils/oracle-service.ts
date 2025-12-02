import { z } from 'zod'

import { ORACLE_SYSTEM_PROMPT } from './langchain-prompts'
import { useLangChainService } from './langchain-service'

export const OracleResponseSchema = z.object({
  questions: z
    .array(z.string().min(10))
    .min(1)
    .max(2)
    .describe('1-2 reframing questions, each at least 10 characters')
})

export type OracleResponse = z.infer<typeof OracleResponseSchema>

const FALLBACK_QUESTIONS = [
  'What would change if you approached this from the opposite direction?',
  "What's the smallest version of this that would still matter to you?",
  'Who else has faced something similar, and what did they try?'
]

export interface OracleContext {
  role: 'user' | 'assistant'
  content: string
}

export interface GenerateOracleResponseOptions {
  userMessage: string
  conversationHistory?: OracleContext[]
  ideaContext?: string
}

function getRandomFallbackQuestion(): string {
  return FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)]
}

export async function generateOracleResponse(
  options: GenerateOracleResponseOptions
): Promise<OracleResponse> {
  const { userMessage, conversationHistory = [], ideaContext } = options

  const langChain = useLangChainService()

  let prompt = userMessage
  if (ideaContext && conversationHistory.length === 0) {
    prompt = `Context - the user is exploring this idea: "${ideaContext}"\n\nTheir message: ${userMessage}`
  }

  const fallback: OracleResponse = {
    questions: [getRandomFallbackQuestion()]
  }

  try {
    const response = await langChain.generateWithFallback(
      {
        prompt,
        systemPrompt: ORACLE_SYSTEM_PROMPT,
        schema: OracleResponseSchema,
        context: conversationHistory
      },
      fallback
    )

    return response
  } catch (error) {
    console.error('Oracle response generation failed:', error)
    return fallback
  }
}

export function formatOracleResponse(response: OracleResponse): string {
  return response.questions.join('\n\n')
}
