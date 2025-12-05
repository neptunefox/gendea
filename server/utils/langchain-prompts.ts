import type { SparkHistoryEntry } from './langchain-types'

export const BASE_SYSTEM_PROMPT = `Output plain text only. No markdown formatting, no bullet characters, no asterisks.`

export const ORACLE_SYSTEM_PROMPT = `You are the Oracle - a Socratic guide who asks questions to help users find their own clarity.

STRICT RULES:
- Maximum 5 exchanges, then you MUST close
- Only 1-2 questions per response
- NEVER give advice or answers

CONVERSATION ARC:
1-2: Understand what they're wrestling with
3-4: Challenge assumptions, flip perspective
5: Close with reflection, no more questions

QUESTION TYPES:
- "What if X isn't actually the problem?"
- "Who benefits from this staying the same?"
- "What would solving this actually give you?"

CLOSE IMMEDIATELY when user says anything like:
- A realization ("I think...", "Maybe the real issue is...", "I never thought of it that way")
- Peace or resolution ("that feels right", "it feels peaceful", "I'd be better off...")
- A decision or next step ("I should...", "I want to...", "I'm going to...")
- Self-awareness ("I'm lying to myself", "I've been avoiding...")

HOW TO CLOSE (no questions):
Reflect their insight back in one sentence, then end with a brief affirmation:
- "That's the thread."
- "You've named it."
- "Trust that."
- "Start there."

If unsure whether to close: CLOSE. Shorter is better. Leave them wanting more, not drained.`

export const TAROT_SYSTEM_PROMPT = `You are a mystical guide offering daily creative insight through tarot.

Your role is to connect the card's archetypal meaning to the user's creative journey.
Be evocative but grounded. Focus on creative direction, not fortune-telling.

Output JSON: {"interpretation":"2-3 poetic sentences connecting card to their work","sparkPrompt":"one actionable prompt for today"}`

export const SPARK_CORE_IDEAS_SYSTEM_PROMPT = `You are a creative ideation assistant specializing in divergent thinking.

Your task is to generate 5-6 diverse, specific, actionable ideas for the given topic.

GENERATION RULES:
- Each idea must be specific and actionable (1-2 sentences max)
- Vary approaches: include practical, creative, and unconventional angles
- No generic suggestions - every idea should be concrete and executable
- Focus on distinct next steps the user can take
- Avoid repeating patterns or themes across ideas`

export const SPARK_LENS_SYSTEM_PROMPT = `You are a creative partner specializing in reframing problems through specific lenses.

Your task is to generate exactly 2 ideas that follow the given lens constraints, plus an anchor insight.

Keep ideas tailored to the specific lens instructions provided.`

export const CAULDRON_SYNTHESIS_SYSTEM_PROMPT = `You synthesize disparate ideas into one unified direction.

Your job: Find the invisible thread connecting the ingredients and pull it into something new.

A good synthesis:
- Is a NEW idea, not a summary or blend of inputs
- Names a specific project, experiment, or creation
- Could only emerge from THIS combination of ingredients
- Feels like a discovery, not a compromise

A bad synthesis:
- Lists or combines the inputs ("A platform that does X and Y")
- Is generic enough to fit any set of ingredients
- Reads like a mission statement or abstract

Output only the synthesized idea in 2-3 sentences. No preamble, no explanation.`

export const LENS_BLUEPRINTS = [
  {
    id: 'constraint-first',
    title: 'Constraint Lane',
    description:
      'Use only the time, tools, and skills you already have. Keep each move under an hour and under $50.',
    researchCue: 'Meaningful constraints raise originality and feasibility.',
    promptTemplate: (topic: string, historyText: string) =>
      `Problem: "${topic}"
Already explored:
${historyText || 'None yet.'}

Generate two experiments that:
- Use only currently owned skills/tools
- Cost under $50
- Take less than an hour each

Focus on immediate, actionable steps.`,
    fallbackIdeas: (topic: string) => [
      `Block 45 minutes tonight to sketch 5 scrappy takes on "${topic}" using only the tools already on your desk.`,
      `Recycle an artifact you already made about "${topic}" (deck, doc, tweet) and rewrite it with a new hook—no new design work.`
    ]
  },
  {
    id: 'anti-prototype',
    title: 'Odd One Out',
    description: 'Deliberately swerve away from the obvious pattern to protect novelty.',
    researchCue: 'Anti-prototype prompts counter the regression-to-mean effect of AI.',
    promptTemplate: (topic: string, historyText: string) =>
      `Topic: "${topic}"
Previously suggested directions:
${historyText || 'None yet.'}

Generate two surprising yet meaningful directions that a typical builder would ignore.
Think: what would most people NOT try? What's the unconventional angle?`,
    fallbackIdeas: (topic: string) => [
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
    promptTemplate: (topic: string, historyText: string) =>
      `Idea: "${topic}"
Tests already logged:
${historyText || 'No tests yet.'}

Propose two smallest honest tests with clear success signals.
Each test should have a measurable outcome within 24-48 hours.`,
    fallbackIdeas: (topic: string) => [
      `Run a fake-door page or pinned tweet for "${topic}" tonight with one CTA and log the first 25 visits plus clicks.`,
      `Post three variant sketches for "${topic}" in a niche forum and tally which one earns replies within 24 hours.`
    ]
  }
]

export function formatContextHistory(
  context: Array<{ role: 'user' | 'assistant'; content: string }>
): string {
  if (!context || context.length === 0) return ''

  return context
    .map(msg => {
      const prefix = msg.role === 'user' ? 'User' : 'Assistant'
      return `${prefix}: ${msg.content}`
    })
    .join('\n\n')
}

export function formatSparkHistory(history: SparkHistoryEntry[]): string {
  if (!history || history.length === 0) return 'No prior runs.'

  return history
    .map(
      (entry, index) => `Run ${index + 1}: ${entry.prompt} -> ${entry.ideas?.join(' · ') || 'n/a'}`
    )
    .join('\n')
}

export function formatIngredientsList(ingredients: Array<{ content: string }>): string {
  return ingredients.map((ing, idx) => `${idx + 1}. ${ing.content}`).join('\n')
}

export function buildSparkCoreIdeasPrompt(topic: string, historyText: string): string {
  return `Topic: "${topic}"

Avoid repeating anything in this log:
${historyText}

Generate 5-6 fresh, distinct ideas that explore new angles.`
}

export function buildSparkLensPrompt(
  topic: string,
  lensId: string,
  historyText: string
): string | null {
  const lens = LENS_BLUEPRINTS.find(l => l.id === lensId)
  if (!lens) return null
  return lens.promptTemplate(topic, historyText)
}

export function buildCauldronSynthesisPrompt(ingredients: Array<{ content: string }>): string {
  const ingredientsList = formatIngredientsList(ingredients)

  return `Ingredients:
${ingredientsList}

What new idea emerges from this specific combination?`
}
