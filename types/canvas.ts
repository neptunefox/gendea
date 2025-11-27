export type EdgeRelationshipType = 'leads-to' | 'requires' | 'blocks' | 'relates-to'

export const EDGE_RELATIONSHIP_TYPES: EdgeRelationshipType[] = [
  'leads-to',
  'requires',
  'blocks',
  'relates-to'
]

export type CanvasNodeType =
  | 'sticky-note'
  | 'shape'
  | 'text-block'
  | 'input'
  | 'tool'
  | 'task'
  | 'idea'
  | 'goal'

export const CANVAS_NODE_TYPES: CanvasNodeType[] = [
  'sticky-note',
  'shape',
  'text-block',
  'input',
  'tool',
  'task',
  'idea',
  'goal'
]

export interface StickyNoteData {
  text?: string
  color?: string
}

export interface ShapeData {
  shape?: 'rectangle' | 'circle' | 'arrow'
  label?: string
  fill?: string
  stroke?: string
  width?: number
  height?: number
}

export interface TextBlockData {
  text?: string
}

export interface InputNodeData {
  question?: string
  answer?: string
}

export interface ToolNodeData {
  name?: string
  description?: string
  url?: string
}

export interface TaskNodeData {
  text?: string
  completed?: boolean
  dueDate?: string
}

export interface IdeaNodeData {
  text?: string
  tags?: string[]
  isCauldronOutput?: boolean
}

export interface GoalNodeData {
  text?: string
  metric?: string
  achieved?: boolean
  achievedAt?: string
}

export interface EdgeStyle {
  stroke: string
  strokeWidth: number
  strokeDasharray: string
}

export const EDGE_STYLES: Record<EdgeRelationshipType, EdgeStyle> = {
  'leads-to': {
    stroke: '#d4756f',
    strokeWidth: 2,
    strokeDasharray: 'none'
  },
  'requires': {
    stroke: '#8b7a75',
    strokeWidth: 2,
    strokeDasharray: '5,5'
  },
  'blocks': {
    stroke: '#c26660',
    strokeWidth: 3,
    strokeDasharray: 'none'
  },
  'relates-to': {
    stroke: '#b8a8a3',
    strokeWidth: 1.5,
    strokeDasharray: '3,3'
  }
}
