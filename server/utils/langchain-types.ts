export interface SparkHistoryEntry {
  prompt: string
  ideas?: string[]
}

export interface SparkIdea {
  text: string
}

export interface SparkLensResult {
  id: string
  title: string
  description: string
  researchCue: string
  whyItMatters: string
  ideas: SparkIdea[]
}

export interface SparkNudge {
  id: string
  title: string
  body: string
  actionLabel?: string
  researchCue: string
}

export interface CauldronIngredient {
  content: string
  order: number
}

export interface ContextMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LensBlueprint {
  id: string
  title: string
  description: string
  researchCue: string
  promptTemplate: (topic: string, historyText: string) => string
  fallbackIdeas: (topic: string) => string[]
}
