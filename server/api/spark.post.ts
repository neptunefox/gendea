import { createError } from 'h3'

import { sparkRuns } from '../../db/schema'
import { db } from '../db'
import { useLLMService } from '../utils/llm'

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
    description:
      'Use only the time, tools, and skills you already have. Keep each move under an hour and under $50.',
    researchCue: 'Meaningful constraints raise originality and feasibility.',
    prompt: (topic, historyText) => `Problem: "${topic}"
Already explored:\n${historyText || 'None yet.'}
You are designing two experiments that use only currently owned skills/tools, cost under $50, and take less than an hour each.
Return EXACT JSON:
{"ideas":["idea one","idea two"],"anchor":"one short sentence on why constraints boost creativity"}`,
    fallbackIdeas: topic => [
      `Block 45 minutes tonight to sketch 5 scrappy takes on "${topic}" using only the tools already on your desk.`,
      `Recycle an artifact you already made about "${topic}" (deck, doc, tweet) and rewrite it with a new hook—no new design work.`
    ]
  },
  {
    id: 'anti-prototype',
    title: 'Odd One Out',
    description: 'Deliberately swerve away from the obvious pattern to protect novelty.',
    researchCue: 'Anti-prototype prompts counter the regression-to-mean effect of AI.',
    prompt: (topic, historyText) => `You are an inventive friend who avoids the default moves.
Topic: "${topic}"
Previously suggested directions:\n${historyText || 'None yet.'}
Give two surprising yet still meaningful directions that a typical app builder would ignore.
Return EXACT JSON:
{"ideas":["idea one","idea two"],"anchor":"one short sentence explaining the reframing"}`,
    fallbackIdeas: topic => [
      `Translate "${topic}" into an offline ritual (analog kit, postcard, walk) and try it with five people before any software.`,
      `Build a deliberately extreme version of "${topic}" (only voice, only outdoors, or only five minutes) to surface fresh constraints.`
    ]
  },
  {
    id: 'small-tests',
    title: 'Smallest Honest Tests',
    description: 'Translate the spark into tiny experiments with pass/fail thresholds.',
    researchCue:
      'Rapid tests surface evidence quickly and keep attention on the work, not opinions.',
    prompt: (
      topic,
      historyText
    ) => `Given the idea "${topic}", propose two smallest honest tests with clear success signals.
We already logged:\n${historyText || 'No tests yet.'}
Return EXACT JSON:
{"ideas":["test idea with measurable signal","another test"],"anchor":"short reminder about evidence"}`,
    fallbackIdeas: topic => [
      `Run a fake-door page or pinned tweet for "${topic}" tonight with one CTA and log the first 25 visits plus clicks.`,
      `Post three variant sketches for "${topic}" in a niche forum and tally which one earns replies within 24 hours.`
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
    throw createError({
      statusCode: 400,
      statusMessage: 'Input is required'
    })
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

  await persistSparkRun({
    prompt: input,
    coreIdeas,
    lenses,
    nudges
  })

  return {
    coreIdeas,
    lenses,
    nudges
  }
})

async function generateSparkIdeas(
  input: string,
  history: SparkHistoryEntry[],
  seenIdeas: Set<string>
): Promise<SparkIdea[]> {
  const llm = useLLMService()

  const systemPrompt = `You are a creative ideation assistant. Generate 5-6 diverse, specific, actionable ideas.

CRITICAL: Respond with ONLY valid JSON. No explanations, no markdown, no extra text.

Format: [{"text":"idea 1"},{"text":"idea 2"},{"text":"idea 3"},{"text":"idea 4"},{"text":"idea 5"}]

Rules:
- Each idea must be specific and actionable
- Vary the approach (practical, creative, unconventional)
- Keep each idea to 1-2 sentences max
- No generic suggestions
- Focus on concrete next steps`

  const historyText = history
    .map(
      (entry, index) => `Run ${index + 1}: ${entry.prompt} -> ${entry.ideas?.join(' · ') || 'n/a'}`
    )
    .join('\n')

  const userPrompt = `Topic: "${input}"
Avoid repeating anything in this log:\n${historyText || 'No prior runs.'}
Return only new, distinct angles.`

  try {
    const response = await llm.generate(userPrompt, systemPrompt)
    const parsed = JSON.parse(extractJson(response))

    if (Array.isArray(parsed) && parsed.length > 0) {
      const filtered = parsed
        .slice(0, 6)
        .filter((item: { text: string }) => item.text && item.text.length > 10)
        .filter(item => !seenIdeas.has(normalizeIdea(item.text)))

      if (filtered.length > 0) {
        return filtered
      }
    }

    throw new Error('Invalid response format')
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
  const historyText = history.map((entry, index) => `Run ${index + 1}: ${entry.prompt}`).join('\n')

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
  const llm = useLLMService()
  const systemPrompt = `You are a creative partner who outputs strict JSON. Each answer MUST follow:
{"ideas":["idea one","idea two"],"anchor":"one sentence"}

Ideas should be punchy (max 2 sentences) and tailored to the instructions.`

  try {
    const raw = await llm.generate(blueprint.prompt(topic, historyText), systemPrompt)
    const cleaned = extractJson(raw)
    const parsed = JSON.parse(cleaned) as { ideas?: string[]; anchor?: string }

    const ideaTexts = Array.isArray(parsed.ideas)
      ? parsed.ideas.filter(text => typeof text === 'string' && text.trim().length > 0)
      : []

    const freshIdeas = ideaTexts.filter(text => !seenIdeas.has(normalizeIdea(text)))

    const finalIdeas =
      freshIdeas.length > 0 ? freshIdeas : blueprint.fallbackIdeas(topic).slice(0, 2)

    finalIdeas.forEach(text => seenIdeas.add(normalizeIdea(text)))

    return {
      id: blueprint.id,
      title: blueprint.title,
      description: blueprint.description,
      researchCue: blueprint.researchCue,
      whyItMatters: parsed.anchor?.trim() || blueprint.researchCue,
      ideas: finalIdeas.map(text => ({ text: text.trim() }))
    }
  } catch (error) {
    console.error(`Failed to generate lens ${blueprint.id}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate ${blueprint.title}. Please try again.`
    })
  }
}

function buildNudges(topic: string): SparkNudge[] {
  return [
    {
      id: 'log-it',
      title: 'Pin it + plan it',
      body: `Write the current wording of "${topic}" and add one if-then cue (when + where). That trims the Zeigarnik buzz so you can return on autopilot.`,
      researchCue:
        'Implementation intentions quiet unfinished-goal rumination and increase follow-through.'
    },
    {
      id: 'incubate',
      title: 'Incubate on purpose',
      body: `Take a 10-minute walk or light chore, then reopen the same "${topic}" thread. Incubation helps divergent thinking without pressure.`,
      actionLabel: 'Start 10-minute timer',
      researchCue: 'Brief undemanding breaks elevate insight on the last-seen problem.'
    },
    {
      id: 'novelty-dose',
      title: 'Inject novelty',
      body: `Queue one Mars-adjacent input for "${topic}" (museum stream, unrelated meetup, different workspace) before your next pass. Novelty widens associative range.`,
      researchCue: 'Diversifying experiences expands cognitive flexibility and spark.'
    }
  ]
}

function extractJson(raw: string): string {
  let cleanedResponse = raw.trim()
  cleanedResponse = cleanedResponse.replace(/```json\n?/gi, '').replace(/```\n?/g, '')

  const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    return sanitizeJsonString(arrayMatch[0])
  }

  const objectMatch = cleanedResponse.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    return sanitizeJsonString(objectMatch[0])
  }

  return sanitizeJsonString(cleanedResponse)
}

function sanitizeJsonString(jsonStr: string): string {
  let inString = false
  let escaped = false
  let result = ''

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i]

    if (char === '"' && !escaped) {
      inString = !inString
      result += char
      continue
    }

    if (char === '\\' && !escaped) {
      escaped = true
      result += char
      continue
    }

    if (inString && !escaped) {
      const code = char.charCodeAt(0)
      if (code < 32 || (code >= 127 && code <= 159)) {
        const escapeMap: Record<string, string> = {
          '\b': '\\b',
          '\f': '\\f',
          '\n': '\\n',
          '\r': '\\r',
          '\t': '\\t'
        }
        result += escapeMap[char] || ''
        continue
      }
    }

    escaped = false
    result += char
  }

  return result
}

function buildHistorySet(history: SparkHistoryEntry[]): Set<string> {
  const seen = new Set<string>()

  history.forEach(entry => {
    entry.ideas?.forEach(idea => {
      if (idea) {
        seen.add(normalizeIdea(idea))
      }
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
}) {
  try {
    await db.insert(sparkRuns).values({
      prompt: entry.prompt,
      coreIdeas: entry.coreIdeas,
      lenses: entry.lenses,
      nudges: entry.nudges
    })
  } catch (error) {
    console.error('Failed to persist spark run:', error)
  }
}
