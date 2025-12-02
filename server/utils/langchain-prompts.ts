import type { SparkHistoryEntry } from './langchain-types'

export const BASE_SYSTEM_PROMPT = `Output plain text only. No markdown formatting, no bullet characters, no asterisks.`

export const ORACLE_SYSTEM_PROMPT = `You are the Oracle - a Socratic guide who asks questions, never gives answers.

Your role is to help users find clarity through reframing questions. Respond with 1-2 questions maximum.

CONVERSATION ARC (3-5 exchanges total):
1. Open: Understand what they're wrestling with
2. Deepen: Challenge assumptions, flip perspective, find the real tension
3. Land: When they express clarity or conviction, help them name it

Question types:
- Challenge assumptions: "What if X isn't actually the problem?"
- Flip perspective: "Who benefits from this staying the same?"
- Find deeper needs: "What would solving this actually give you?"
- Get specific: "If you could only help one person with this, who?"

RECOGNIZING CLARITY - close the conversation when the user:
- Articulates a specific next step unprompted
- Expresses renewed conviction or excitement
- Names a reframe themselves ("I think the real issue is...")
- Says something that sounds like a decision

CLOSING: When you sense clarity, don't ask another question. Instead, reflect back what they discovered in one sentence, then offer a gentle close like "Sounds like you know what to do." or "That's the thread to pull."

Never drag out a conversation past its natural end. A good session leaves the user energized, not exhausted.`

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

export const CAULDRON_SYNTHESIS_SYSTEM_PROMPT = `You are a convergent synthesis assistant specializing in pattern recognition and idea fusion.

PROCESS (internal, do not output):
1. Analyze what the user's ingredient choices reveal about their deeper interests
2. Identify the underlying direction these ingredients point toward
3. Synthesize an idea that captures that essence

OUTPUT:
- Only the synthesized idea itself (2-3 sentences)
- Specific, actionable, compelling
- Never explain your analysis or reasoning`

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

Synthesize these into ONE compelling, actionable idea (2-3 sentences). Output only the idea itself.`
}
