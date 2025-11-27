import { eq } from 'drizzle-orm'

import { canvasNodes, canvasEdges } from '../../../../db/schema'
import { db } from '../../../db'

interface PlanNode {
  id: string
  type: string
  text: string
  completed?: boolean
  coachOrigin?: boolean
}

interface PlanSummary {
  totalNodes: number
  taskNodes: PlanNode[]
  goalNodes: PlanNode[]
  completedTasks: number
  totalTasks: number
  progressPercent: number
  hasStructure: boolean
}

export default defineEventHandler(async (event): Promise<PlanSummary> => {
  const projectId = getRouterParam(event, 'projectId')

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID is required'
    })
  }

  const nodes = await db.select().from(canvasNodes).where(eq(canvasNodes.projectId, projectId))
  const edges = await db.select().from(canvasEdges).where(eq(canvasEdges.projectId, projectId))

  const taskNodes: PlanNode[] = nodes
    .filter(n => n.type === 'task')
    .map(n => {
      const data = n.data as Record<string, unknown>
      return {
        id: n.id,
        type: n.type,
        text: (data.text as string) || 'Untitled task',
        completed: !!data.completed,
        coachOrigin: !!data.coachOrigin
      }
    })

  const goalNodes: PlanNode[] = nodes
    .filter(n => n.type === 'goal')
    .map(n => {
      const data = n.data as Record<string, unknown>
      return {
        id: n.id,
        type: n.type,
        text: (data.text as string) || 'Untitled goal',
        completed: !!data.achieved,
        coachOrigin: !!data.coachOrigin
      }
    })

  const completedTasks = taskNodes.filter(t => t.completed).length
  const totalTasks = taskNodes.length
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const hasStructure = nodes.length > 0 || edges.length > 0

  return {
    totalNodes: nodes.length,
    taskNodes,
    goalNodes,
    completedTasks,
    totalTasks,
    progressPercent,
    hasStructure
  }
})
