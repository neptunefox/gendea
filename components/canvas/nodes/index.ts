export { default as StickyNoteNode } from './StickyNoteNode.vue'
export { default as ShapeNode } from './ShapeNode.vue'
export { default as TextBlockNode } from './TextBlockNode.vue'
export { default as InputNode } from './InputNode.vue'
export { default as ToolNode } from './ToolNode.vue'
export { default as TaskNode } from './TaskNode.vue'
export { default as IdeaNode } from './IdeaNode.vue'
export { default as GoalNode } from './GoalNode.vue'

export const nodeTypes = [
  'sticky-note',
  'shape',
  'text-block',
  'input',
  'tool',
  'task',
  'idea',
  'goal'
] as const

export type CanvasNodeType = (typeof nodeTypes)[number]
