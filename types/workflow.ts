export type WorkflowState = 
  | 'Seeded'
  | 'Diverging'
  | 'Clarifying'
  | 'Planning'
  | 'Testing'
  | 'Reviewing'
  | 'Stalled'
  | 'Action crisis'
  | 'Archived'

export interface WorkflowContext {
  branchId: string
  missedPlans: number
  expectancyRating?: number
}

export type WorkflowEvent =
  | { type: 'SAVE' }
  | { type: 'SLOTS_FILLED' }
  | { type: 'TIMER_ENDED' }
  | { type: 'NORTH_STAR_PINNED' }
  | { type: 'THRESHOLDS_SET' }
  | { type: 'LOG_ENTRY' }
  | { type: 'PLAN_MISSED' }
  | { type: 'LOW_EXPECTANCY' }
  | { type: 'EXIT' }
  | { type: 'COMPLETE' }
