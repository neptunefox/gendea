import { db } from '../../db'
import { branches, plans } from '../../../db/schema'
import { eq } from 'drizzle-orm'

interface RecommitRequest {
  branchId: string
  metric: string
  threshold: string
}

export default defineEventHandler(async event => {
  const body = await readBody<RecommitRequest>(event)
  const { branchId, metric, threshold } = body

  if (!branchId || !metric || !threshold) {
    throw createError({
      statusCode: 400,
      message: 'branchId, metric, and threshold are required'
    })
  }

  await db
    .update(branches)
    .set({
      missedPlans: 0,
      updatedAt: new Date()
    })
    .where(eq(branches.id, branchId))

  const twoWeeksFromNow = new Date()
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)

  await db
    .update(plans)
    .set({
      metric,
      passThreshold: threshold,
      failThreshold: `Less than ${threshold}`,
      updatedAt: new Date()
    })
    .where(eq(plans.branchId, branchId))

  await $fetch('/api/workflow/transition', {
    method: 'POST',
    body: {
      branchId,
      event: { type: 'THRESHOLDS_SET' }
    }
  })

  return {
    success: true,
    deadline: twoWeeksFromNow.toISOString()
  }
})
