import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'

import { sparkRuns } from '../../db/schema'
import { db } from '../db'
import { useLangChainService } from '../utils/langchain-service'

const SparkIdeaSchema = z.object({
  text: z.string().min(10)
})

const SparkIdeasWrapperSchema = z.object({
  ideas: z.array(SparkIdeaSchema).min(3).max(6)
})

const LensOutputSchema = z.object({
  ideas: z.array(z.string().min(5)).min(1).max(2),
  anchor: z.string().min(5)
})

interface SparkIdea {
  text: string
}

interface SparkHistoryEntry {
  prompt: string
  ideas?: string[]
}

interface LensBlueprint {
  id: string
  title: string
  description: string
  researchCue: string
  prompt: (topic: string, historyText: string) => string
  fallbackIdeas: (topic: string) => string[]
}

interface LensResult {
  id: string
  title: string
  description: string
  researchCue: string
  whyItMatters: string
  ideas: SparkIdea[]
}

interface SparkNudge {
  id: string
  title: string
  body: string
  actionLabel?: string
  researchCue: string
}

const lensBlueprints: LensBlueprint[] = [
  {
    id: 'constraint-first',
    title: 'Constraint Lane',
    description: 'Use only the time, tools, and skills you already have.',
    researchCue: 'Meaningful constraints raise originality and feasibility.',
    prompt: (topic, historyText) => `Problem: "${topic}"
Already explored: ${historyText || 'None yet.'}

Design two experiments using only owned skills/tools, under $50, under an hour each.

Output JSON: {"ideas":["idea 1","idea 2"],"anchor":"why constraints help"}`,
    fallbackIdeas: topic => [
      `Block 45 minutes to sketch 5 takes on "${topic}" using tools on your desk.`,
      `Recycle an artifact about "${topic}" and rewrite it with a new hook.`
    ]
  },
  {
    id: 'anti-prototype',
    title: 'Odd One Out',
    description: 'Deliberately swerve away from the obvious pattern.',
    researchCue: 'Anti-prototype prompts counter regression-to-mean.',
    prompt: (topic, historyText) => `Topic: "${topic}"
Previously suggested: ${historyText || 'None yet.'}

Give two surprising directions a typical builder would ignore.

Output JSON: {"ideas":["idea 1","idea 2"],"anchor":"why this reframing helps"}`,
    fallbackIdeas: topic => [
      `Translate "${topic}" into an offline ritual and try with five people.`,
      `Build an extreme version of "${topic}" (only voice, only outdoors).`
    ]
  },
  {
    id: 'small-tests',
    title: 'Smallest Honest Tests',
    description: 'Tiny experiments with pass/fail thresholds.',
    researchCue: 'Rapid tests surface evidence quickly.',
    prompt: (topic, historyText) => `Idea: "${topic}"
Tests logged: ${historyText || 'No tests yet.'}

Propose two smallest honest tests with clear success signals within 24-48 hours.

Output JSON: {"ideas":["test 1","test 2"],"anchor":"why evidence matters"}`,
    fallbackIdeas: topic => [
      `Run a fake-door page for "${topic}" with one CTA, log 25 visits.`,
      `Post three variant sketches for "${topic}" in a forum, tally replies.`
    ]
  }
]

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { input, history, isBranch } = body as {
    input?: string
    history?: SparkHistoryEntry[]
    isBranch?: boolean
  }

  if (!input || typeof input !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Input is required' })
  }

  const normalizedHistory =
    Array.isArray(history) && isBranch
      ? history.filter(entry => entry?.prompt && typeof entry.prompt === 'string')
      : []

  const seenIdeas = buildHistorySet(normalizedHistory)
  const coreIdeas = await generateSparkIdeas(input, normalizedHistory, seenIdeas)
  coreIdeas.forEach(idea => seenIdeas.add(normalizeIdea(idea.text)))
  const lenses = await generateResearchLanes(input, normalizedHistory, seenIdeas)
  const nudges = buildNudges(input)

  const runId = await persistSparkRun({ prompt: input, coreIdeas, lenses, nudges })

  return { id: runId, coreIdeas, lenses, nudges }
})

async function generateSparkIdeas(
  input: string,
  history: SparkHistoryEntry[],
  seenIdeas: Set<string>
): Promise<SparkIdea[]> {
  const langchain = useLangChainService()

  const systemPrompt = `You are a creative ideation assistant. Generate 5-6 diverse, specific, actionable ideas.

Rules:
- Each idea must be specific and actionable (1-2 sentences max)
- Vary approaches: practical, creative, unconventional
- No generic suggestions
- Focus on concrete next steps

Output format: {"ideas":[{"text":"idea 1"},{"text":"idea 2"},{"text":"idea 3"},{"text":"idea 4"},{"text":"idea 5"}]}`

  const historyText = history
    .map((entry, i) => `Run ${i + 1}: ${entry.prompt} -> ${entry.ideas?.join(' · ') || 'n/a'}`)
    .join('\n')

  const prompt = `Topic: "${input}"
Avoid repeating: ${historyText || 'No prior runs.'}

Generate 5-6 fresh ideas as JSON.`

  try {
    const result = await langchain.generateStructured({
      prompt,
      systemPrompt,
      schema: SparkIdeasWrapperSchema
    })

    const filtered = result.ideas
      .filter(item => item.text && item.text.length >= 10)
      .filter(item => !seenIdeas.has(normalizeIdea(item.text)))

    if (filtered.length > 0) return filtered

    throw new Error('No valid ideas generated')
  } catch (error) {
    console.error('Failed to generate spark ideas:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate ideas. Please try again.'
    })
  }
}

async function generateResearchLanes(
  topic: string,
  history: SparkHistoryEntry[],
  seenIdeas: Set<string>
): Promise<LensResult[]> {
  const historyText = history.map((entry, i) => `Run ${i + 1}: ${entry.prompt}`).join('\n')

  return Promise.all(
    lensBlueprints.map(blueprint => generateLane(topic, blueprint, historyText, seenIdeas))
  )
}

async function generateLane(
  topic: string,
  blueprint: LensBlueprint,
  historyText: string,
  seenIdeas: Set<string>
): Promise<LensResult> {
  const langchain = useLangChainService()

  const systemPrompt = `You are a creative partner. Output strict JSON only.
Format: {"ideas":["idea one","idea two"],"anchor":"one sentence insight"}`

  try {
    const result = await langchain.generateStructured({
      prompt: blueprint.prompt(topic, historyText),
      systemPrompt,
      schema: LensOutputSchema
    })

    const freshIdeas = result.ideas.filter(text => !seenIdeas.has(normalizeIdea(text)))
    const finalIdeas =
      freshIdeas.length > 0 ? freshIdeas : blueprint.fallbackIdeas(topic).slice(0, 2)

    finalIdeas.forEach(text => seenIdeas.add(normalizeIdea(text)))

    return {
      id: blueprint.id,
      title: blueprint.title,
      description: blueprint.description,
      researchCue: blueprint.researchCue,
      whyItMatters: result.anchor || blueprint.researchCue,
      ideas: finalIdeas.map(text => ({ text: text.trim() }))
    }
  } catch (error) {
    console.error(`Failed to generate lens ${blueprint.id}, using fallback:`, error)
    const fallbackIdeas = blueprint.fallbackIdeas(topic).slice(0, 2)
    fallbackIdeas.forEach(text => seenIdeas.add(normalizeIdea(text)))

    return {
      id: blueprint.id,
      title: blueprint.title,
      description: blueprint.description,
      researchCue: blueprint.researchCue,
      whyItMatters: blueprint.researchCue,
      ideas: fallbackIdeas.map(text => ({ text }))
    }
  }
}

function buildNudges(topic: string): SparkNudge[] {
  return [
    {
      id: 'log-it',
      title: 'Pin it + plan it',
      body: `Write the current wording of "${topic}" and add one if-then cue (when + where).`,
      researchCue: 'Implementation intentions increase follow-through.'
    },
    {
      id: 'incubate',
      title: 'Incubate on purpose',
      body: `Take a 10-minute walk, then reopen the "${topic}" thread.`,
      actionLabel: 'Start 10-minute timer',
      researchCue: 'Brief breaks elevate insight.'
    },
    {
      id: 'novelty-dose',
      title: 'Inject novelty',
      body: `Queue one unrelated input for "${topic}" before your next pass.`,
      researchCue: 'Diversifying experiences expands cognitive flexibility.'
    }
  ]
}

function buildHistorySet(history: SparkHistoryEntry[]): Set<string> {
  const seen = new Set<string>()
  history.forEach(entry => {
    entry.ideas?.forEach(idea => {
      if (idea) seen.add(normalizeIdea(idea))
    })
  })
  return seen
}

function normalizeIdea(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

async function persistSparkRun(entry: {
  prompt: string
  coreIdeas: SparkIdea[]
  lenses: LensResult[]
  nudges: SparkNudge[]
}): Promise<string | undefined> {
  try {
    const [result] = await db
      .insert(sparkRuns)
      .values({
        prompt: entry.prompt,
        coreIdeas: entry.coreIdeas,
        lenses: entry.lenses,
        nudges: entry.nudges
      })
      .returning({ id: sparkRuns.id })
    return result?.id
  } catch (error) {
    console.error('Failed to persist spark run:', error)
    return undefined
  }
}
