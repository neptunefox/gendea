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

export interface CanvasNodeData {
  id: string
  type: string
  content: string
  position?: { x: number; y: number }
  metadata?: {
    color?: string
    icon?: string
    link?: string
    completed?: boolean
  }
}

export interface CanvasEdgeData {
  id: string
  sourceId: string
  targetId: string
  label?: string
  relationship?: 'leads_to' | 'requires' | 'blocks' | 'relates_to'
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
