import { eq } from 'drizzle-orm'

import { canvasNodes, savedIdeas, branches } from '../../../../db/schema'
import { workflowService } from '../../../../lib/workflow-service'
import { db } from '../../../db'

type WorkflowState = 'Seeded' | 'Diverging' | 'Clarifying' | 'Planning' | 'Testing' | 'Reviewing' | 'Stalled' | 'Action crisis' | 'Archived'

async function syncTaskCompletionToCoach(node: typeof canvasNodes.$inferSelect, completed: boolean) {
  const data = node.data as Record<string, unknown>
  if (node.type !== 'task' || !data.coachOrigin || !data.savedIdeaId) {
    return
  }

  const savedIdeaId = data.savedIdeaId as string

  try {
    const [idea] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, savedIdeaId))
    if (!idea || !idea.testCommitment) return

    if (completed && !idea.testResult) {
      await db
        .update(savedIdeas)
        .set({
          testResult: {
            outcome: 'worked',
            completedAt: new Date().toISOString()
          }
        })
        .where(eq(savedIdeas.id, savedIdeaId))
      
      if (idea.branchId) {
        await transitionWorkflowOnTaskComplete(idea.branchId)
      }
    } else if (!completed && idea.testResult) {
      await db
        .update(savedIdeas)
        .set({
          testResult: null
        })
        .where(eq(savedIdeas.id, savedIdeaId))
    }
  } catch (error) {
    console.error('Failed to sync task completion to Coach:', error)
  }
}

async function transitionWorkflowOnTaskComplete(branchId: string) {
  try {
    const [branch] = await db.select().from(branches).where(eq(branches.id, branchId))
    if (!branch) return

    if (branch.state === 'Testing') {
      workflowService.getOrCreateActor(branchId, {
        missedPlans: branch.missedPlans
      })

      const snapshot = workflowService.transition(branchId, { type: 'LOG_ENTRY' })

      await db
        .update(branches)
        .set({
          state: snapshot.value as WorkflowState,
          missedPlans: snapshot.context.missedPlans,
          updatedAt: new Date()
        })
        .where(eq(branches.id, branchId))
    }
  } catch (error) {
    console.error('Failed to transition workflow on task complete:', error)
  }
}

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Node ID is required'
    })
  }

  const body = await readBody(event)

  const [existingNode] = await db.select().from(canvasNodes).where(eq(canvasNodes.id, id))
  const existingData = existingNode?.data as Record<string, unknown> | undefined
  const wasCompleted = existingData?.completed

  const updateData: Record<string, unknown> = {
    updatedAt: new Date()
  }

  if (body.position !== undefined) {
    updateData.position = body.position
  }

  if (body.data !== undefined) {
    updateData.data = body.data
  }

  if (body.type !== undefined) {
    updateData.type = body.type
  }

  if (body.parentNode !== undefined) {
    updateData.parentNodeId = body.parentNode
  }

  await db.update(canvasNodes).set(updateData).where(eq(canvasNodes.id, id))

  const [updated] = await db.select().from(canvasNodes).where(eq(canvasNodes.id, id))

  const newData = updated?.data as Record<string, unknown> | undefined
  const isNowCompleted = newData?.completed

  if (updated && wasCompleted !== isNowCompleted) {
    await syncTaskCompletionToCoach(updated, !!isNowCompleted)
  }

  return { node: updated }
})
