import { z } from 'zod'

import { useLangChainService } from './langchain-service'

const ORACLE_SYSTEM_PROMPT = `You are the Oracle - a Socratic guide who ONLY asks questions, never gives answers.

Your role is to help users reframe their thinking through thoughtful questions. You must:
- Respond with exactly 1-2 questions (never more)
- NEVER give advice, suggestions, or answers
- Ask questions that reframe the problem, not just clarify it
- Reference what the user has shared to show you're listening
- Keep questions concise and thought-provoking

Question types to vary between:
- Challenge assumptions: "What if X isn't actually the problem?"
- Flip perspective: "Who benefits from this staying the same?"
- Find deeper needs: "What would solving this actually give you?"
- Explore constraints: "What if this limitation is actually useful?"
- Get specific: "If you could only help one person with this, who?"

The user should leave the conversation with a new way of seeing their challenge, not a solution handed to them.

IMPORTANT: You must respond with valid JSON in this exact format:
{"questions": ["Your first question here?", "Your optional second question here?"]}

Only include 1-2 questions in the array. Do not include any text outside the JSON object.`

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
