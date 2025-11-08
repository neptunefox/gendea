import { workflowService } from '../../../lib/workflow-service'
import { db } from '../../db'
import { branches } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import type { WorkflowEvent } from '../../../types/workflow'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { branchId, event: workflowEvent } = body as { branchId: string; event: WorkflowEvent }

  if (!branchId || !workflowEvent) {
    throw createError({
      statusCode: 400,
      message: 'branchId and event are required'
    })
  }

  const snapshot = workflowService.transition(branchId, workflowEvent)

  await db
    .update(branches)
    .set({
      state: snapshot.value as string,
      updatedAt: new Date()
    })
    .where(eq(branches.id, branchId))

  return {
    state: snapshot.value,
    context: snapshot.context
  }
})
