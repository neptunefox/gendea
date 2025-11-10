export type NodeType = 'Idea' | 'Assumption' | 'Plan' | 'Test' | 'Result' | 'Decision' | 'Lesson'

export interface Node {
  id: string
  type: NodeType
  text: string
  name?: string
  rationale?: string
  constraints?: string[]
  metric?: string
  threshold?: {
    pass?: number
    fail?: number
  }
  ifThenPlan?: {
    date?: string
    time?: string
    place?: string
    action?: string
  }
  energyRating?: number
  expectancyRating?: number
  parentId?: string
  childIds: string[]
  branchId: string
  isAnonymous?: number
  createdAt: Date
  updatedAt: Date
}

export interface NorthStar {
  id: string
  branchId: string
  text: string
  createdAt: Date
  updatedAt: Date
}

export interface LadderStep {
  id: string
  branchId: string
  text: string
  order: number
  createdAt: Date
  updatedAt: Date
}
