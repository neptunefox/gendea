import { eq } from 'drizzle-orm'

import { canvasNodes, canvasEdges, canvasState, savedIdeas, branches } from '../../../db/schema'
import { db } from '../../db'

type WorkflowState = 'Seeded' | 'Diverging' | 'Clarifying' | 'Planning' | 'Testing' | 'Reviewing' | 'Stalled' | 'Action crisis' | 'Archived'

function deriveWorkflowState(idea: { status: string; testCommitment?: unknown; testResult?: unknown } | null): WorkflowState {
  if (!idea) return 'Seeded'
  
  if (idea.status === 'done') return 'Archived'
  if (idea.status === 'building') {
    if (idea.testResult) return 'Reviewing'
    if (idea.testCommitment) return 'Testing'
    return 'Planning'
  }
  if (idea.status === 'ready') return 'Clarifying'
  return 'Diverging'
}

export default defineEventHandler(async event => {
  const projectId = getRouterParam(event, 'projectId')

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'Project ID is required'
    })
  }

  const nodes = await db.select().from(canvasNodes).where(eq(canvasNodes.projectId, projectId))

  const edges = await db.select().from(canvasEdges).where(eq(canvasEdges.projectId, projectId))

  const [state] = await db.select().from(canvasState).where(eq(canvasState.projectId, projectId))

  const [idea] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, projectId))
  
  let workflowState: WorkflowState = 'Seeded'
  
  if (idea?.branchId) {
    const [branch] = await db.select().from(branches).where(eq(branches.id, idea.branchId))
    if (branch) {
      workflowState = branch.state as WorkflowState
    }
  } else {
    workflowState = deriveWorkflowState(idea)
  }

  return {
    nodes,
    edges,
    state: state || null,
    workflowState
  }
})
