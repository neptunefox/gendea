import type { SparkHistoryEntry } from './langchain-types'

export const SPARK_CORE_IDEAS_SYSTEM_PROMPT = `You are a creative ideation assistant specializing in divergent thinking.

Your task is to generate 5-6 diverse, specific, actionable ideas for the given topic.

GENERATION RULES:
- Each idea must be specific and actionable (1-2 sentences max)
- Vary approaches: include practical, creative, and unconventional angles
- No generic suggestions - every idea should be concrete and executable
- Focus on distinct next steps the user can take
- Avoid repeating patterns or themes across ideas

OUTPUT FORMAT - You MUST respond with ONLY a JSON array like this example:
[{"text":"First specific idea here"},{"text":"Second specific idea here"},{"text":"Third specific idea here"},{"text":"Fourth specific idea here"},{"text":"Fifth specific idea here"}]

Do NOT wrap in an object. Output ONLY the array starting with [ and ending with ].`

export const SPARK_LENS_SYSTEM_PROMPT = `You are a creative partner specializing in reframing problems through specific lenses.

Your task is to generate exactly 2 ideas that follow the given lens constraints, plus an anchor insight.

OUTPUT FORMAT - You MUST respond with ONLY a JSON object like this example:
{"ideas":["First punchy idea here","Second punchy idea here"],"anchor":"One sentence explaining the insight"}

Keep ideas tailored to the specific lens instructions provided.`

export const CAULDRON_SYNTHESIS_SYSTEM_PROMPT = `You are a convergent synthesis assistant specializing in pattern recognition and idea fusion.

Your task is to analyze multiple ingredients and synthesize them into ONE compelling, actionable idea.

SYNTHESIS PROCESS:
1. Identify common themes, patterns, and connections across ALL ingredients
2. Find the deeper underlying interest or direction these ingredients point toward
3. Synthesize into ONE cohesive idea that captures the essence

SYNTHESIS RULES:
- Don't just combine ideas - find what they reveal about the user's interests
- The synthesis should feel like a natural evolution, not a forced mashup
- Keep it specific and actionable (2-3 sentences)
- Make it compelling and ready to act on

OUTPUT REQUIREMENTS:
You must respond with a JSON object containing a "synthesis" field.
The synthesis must be at least 50 characters and capture the deeper pattern.`

export const CANVAS_EXPAND_SYSTEM_PROMPT = `You are a planning assistant specializing in breaking down ideas into actionable components.

Your task is to expand a given idea into 3-5 related subtasks, concepts, or supporting ideas.

EXPANSION RULES:
- Generate nodes that logically connect to the original idea
- Include a mix of: subtasks, prerequisites, related concepts, or next steps
- Each node should be specific and actionable
- Vary node types appropriately (task, idea, goal, tool, input)

CONNECTION RULES:
- Define meaningful relationships between nodes
- Use "leads_to" for sequential steps
- Use "requires" for prerequisites
- Use "blocks" for dependencies
- Use "relates_to" for conceptual connections

OUTPUT REQUIREMENTS:
- "nodes": Array of 3-5 node objects with type, content, and optional metadata
- "connections": Array of connection objects linking nodes by index (0 = original node)`

export const CANVAS_TIDY_UP_SYSTEM_PROMPT = `You are an organization assistant specializing in visual information architecture.

Your task is to analyze a set of nodes and organize them into logical clusters or flows.

ORGANIZATION RULES:
- Group related nodes by theme, sequence, or dependency
- Suggest appropriate layout patterns for each cluster
- Use "grid" for related but independent items
- Use "linear" for sequential steps or processes
- Use "radial" for central concepts with satellites

OUTPUT REQUIREMENTS:
- "clusters": Array of cluster objects
- Each cluster has: name, nodeIds (array of node IDs), and layout type`

export const CANVAS_CONNECTION_LABEL_SYSTEM_PROMPT = `You are a relationship analyst specializing in identifying connections between concepts.

Your task is to suggest an appropriate label and relationship type for a connection between two nodes.

RELATIONSHIP TYPES:
- "leads_to": One thing naturally progresses to another
- "requires": One thing is a prerequisite for another
- "blocks": One thing prevents or delays another
- "relates_to": General conceptual connection

OUTPUT REQUIREMENTS:
- "label": A concise label (3-50 characters) describing the relationship
- "relationship": One of the four relationship types above`

export const PROACTIVE_QUESTION_SYSTEM_PROMPT = `You are a proactive assistant that identifies when ideas need clarification.

Your task is to analyze an idea and determine if it's too vague to act on.

VAGUENESS INDICATORS:
- Missing specific details (who, what, when, where, how)
- Unclear scope or boundaries
- Abstract concepts without concrete examples
- Missing success criteria or goals

DECISION CRITERIA:
- Only ask if the question would genuinely help clarify the idea
- Don't ask obvious or trivial questions
- Focus on the most important missing piece

OUTPUT REQUIREMENTS:
- "shouldAsk": Boolean indicating if clarification is needed
- "question": The clarifying question (if shouldAsk is true)
- "reason": Brief explanation of why this question helps (if shouldAsk is true)`

export const PROACTIVE_TOOL_SYSTEM_PROMPT = `You are a resource assistant that identifies when ideas could benefit from specific tools.

Your task is to analyze an idea and determine if a tool or resource would help.

TOOL SUGGESTION CRITERIA:
- The idea mentions a task that has well-known tools
- The user seems to be reinventing something that exists
- A specific resource would significantly accelerate progress

DECISION CRITERIA:
- Only suggest if the tool is directly relevant
- Prefer well-established, accessible tools
- Don't suggest tools for simple tasks

OUTPUT REQUIREMENTS:
- "shouldSuggest": Boolean indicating if a tool should be suggested
- "toolName": Name of the suggested tool (if shouldSuggest is true)
- "toolLink": URL to the tool (if shouldSuggest is true)
- "reason": Brief explanation of why this tool helps (if shouldSuggest is true)`

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

export function formatCanvasNodes(
  nodes: Array<{ id: string; type: string; content: string }>
): string {
  return nodes.map(node => `[${node.id}] (${node.type}): ${node.content}`).join('\n')
}

export function buildSparkCoreIdeasPrompt(topic: string, historyText: string): string {
  return `Topic: "${topic}"

Avoid repeating anything in this log:
${historyText}

Generate 5-6 fresh, distinct ideas that explore new angles.

Remember: Output ONLY a JSON array like [{"text":"idea 1"},{"text":"idea 2"},...] with no other text.`
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

  return `Analyze the patterns in these ${ingredients.length} ingredients and synthesize them into ONE compelling idea:

${ingredientsList}

What themes, interests, or directions do these ingredients reveal? Create a synthesis that captures the deeper pattern.`
}

export function buildCanvasExpandPrompt(nodeContent: string, nodeType: string): string {
  return `Expand this ${nodeType} into 3-5 related components:

"${nodeContent}"

Consider: What subtasks, prerequisites, related concepts, or next steps would help develop this further?`
}

export function buildCanvasTidyUpPrompt(
  nodes: Array<{ id: string; type: string; content: string }>
): string {
  const nodesList = formatCanvasNodes(nodes)

  return `Organize these ${nodes.length} nodes into logical clusters:

${nodesList}

Group by theme, sequence, or dependency. Suggest the best layout for each cluster.`
}

export function buildCanvasConnectionLabelPrompt(
  sourceContent: string,
  targetContent: string
): string {
  return `Suggest a relationship label for this connection:

Source: "${sourceContent}"
Target: "${targetContent}"

What is the nature of the relationship between these two items?`
}

export function buildProactiveQuestionPrompt(nodeContent: string, nodeType: string): string {
  return `Analyze this ${nodeType} for vagueness:

"${nodeContent}"

Is this specific enough to act on? If not, what's the most important clarifying question?`
}

export function buildProactiveToolPrompt(nodeContent: string): string {
  return `Analyze this idea for tool opportunities:

"${nodeContent}"

Would a specific tool or resource significantly help with this? Only suggest if highly relevant.`
}

export const UNRELATED_CONNECTION_SYSTEM_PROMPT = `You are an assistant that identifies when two connected nodes lack a clear logical relationship.

Your task is to analyze a connection between two nodes and determine if they seem unrelated.

RELATEDNESS CRITERIA:
- One leads to or enables the other
- They share a common theme or goal
- One is a prerequisite or dependency of the other
- They are part of the same workflow or process

DECISION CRITERIA:
- Only flag as unrelated if there's no reasonable connection
- Consider indirect relationships and creative connections
- Suggest intermediate steps that could bridge the gap

OUTPUT REQUIREMENTS:
- "areUnrelated": Boolean indicating if the nodes lack a clear connection
- "suggestedIntermediateSteps": 1-3 steps that could bridge the gap (if unrelated)
- "reasoning": Brief explanation of why they seem unrelated (if unrelated)`

export const DISCONNECTED_CLUSTERS_SYSTEM_PROMPT = `You are an assistant that identifies disconnected groups of nodes on a canvas.

Your task is to analyze a set of nodes and their connections to find isolated clusters.

CLUSTER IDENTIFICATION:
- Nodes connected by edges form a cluster
- Nodes with no connections are isolated
- Multiple separate groups indicate disconnected clusters

DECISION CRITERIA:
- Only flag if there are genuinely separate groups that could benefit from organization
- Consider if grouping or connecting would improve clarity
- Suggest the most appropriate action based on the content

OUTPUT REQUIREMENTS:
- "hasDisconnectedClusters": Boolean indicating if there are isolated groups
- "clusters": Array of identified clusters with nodeIds and theme (if disconnected)
- "suggestedAction": Recommended action - "group", "connect", or "organize" (if disconnected)`

export function buildUnrelatedConnectionPrompt(
  sourceContent: string,
  targetContent: string
): string {
  return `Analyze the relationship between these two connected nodes:

Source: "${sourceContent}"
Target: "${targetContent}"

Do these nodes have a clear logical connection? If not, what intermediate steps could bridge them?`
}

export function buildDisconnectedClustersPrompt(
  nodes: Array<{ id: string; type: string; content: string }>,
  edges: Array<{ sourceId: string; targetId: string }>
): string {
  const nodesList = nodes.map(n => `[${n.id}] (${n.type}): ${n.content}`).join('\n')
  const edgesList =
    edges.length > 0
      ? edges.map(e => `${e.sourceId} -> ${e.targetId}`).join('\n')
      : 'No connections'

  return `Analyze these canvas nodes and their connections:

NODES:
${nodesList}

CONNECTIONS:
${edgesList}

Are there disconnected clusters that could benefit from organization?`
}
