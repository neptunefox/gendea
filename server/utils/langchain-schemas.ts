import { z } from 'zod'

export const SparkIdeaSchema = z.object({
  text: z
    .string()
    .min(10)
    .describe('A specific, actionable idea (1-2 sentences, minimum 10 characters)')
})

export const SparkCoreIdeasSchema = z
  .array(SparkIdeaSchema)
  .min(5)
  .max(6)
  .describe('Array of 5-6 diverse, specific, actionable ideas')

export const SparkLensSchema = z.object({
  ideas: z
    .array(z.string().min(10))
    .length(2)
    .describe('Exactly two specific ideas following the lens constraints (each min 10 chars)'),
  anchor: z
    .string()
    .min(10)
    .describe('One sentence explaining the reframing or insight (min 10 chars)')
})

export const CauldronOutputSchema = z.object({
  synthesis: z
    .string()
    .min(50)
    .describe(
      'A compelling, actionable synthesized idea capturing the deeper pattern (2-3 sentences, min 50 chars)'
    )
})

export type SparkCoreIdeas = z.infer<typeof SparkCoreIdeasSchema>
export type SparkLensOutput = z.infer<typeof SparkLensSchema>
export type CauldronOutput = z.infer<typeof CauldronOutputSchema>
