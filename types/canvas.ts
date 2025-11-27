export type EdgeRelationshipType = 'leads-to' | 'requires' | 'blocks' | 'relates-to'

export const EDGE_RELATIONSHIP_TYPES: EdgeRelationshipType[] = [
  'leads-to',
  'requires',
  'blocks',
  'relates-to'
]

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
