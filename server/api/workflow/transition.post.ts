import { eq } from 'drizzle-orm'
import { createError } from 'h3'

import { branches } from '../../../db/schema'
import { workflowService } from '../../../lib/workflow-service'
import type { WorkflowEvent, WorkflowState } from '../../../types/workflow'
import { db } from '../../db'



export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { branchId, event: workflowEvent } = body as { branchId: string; event: WorkflowEvent }

  if (!branchId || !workflowEvent) {
    throw createError({
      statusCode: 400,
      message: 'branchId and event are required'
    })
  }

  const existingBranch = await db.query.branches.findFirst({
    where: eq(branches.id, branchId)
  })

  if (existingBranch) {
    workflowService.getOrCreateActor(branchId, {
      missedPlans: existingBranch.missedPlans
    })
  }

  const snapshot = workflowService.transition(branchId, workflowEvent)

  await db
    .update(branches)
    .set({
      state: snapshot.value as WorkflowState,
      missedPlans: snapshot.context.missedPlans,
      updatedAt: new Date()
    })
    .where(eq(branches.id, branchId))

  return {
    state: snapshot.value,
    context: snapshot.context
  }
})
