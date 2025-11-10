import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { branches } from '../../../../db/schema'
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'

interface OutsideViewAnalysis {
  comparableEfforts: Array<{
    description: string
    successRate?: string
    timeToMilestone?: string
  }>
  baseRates: {
    successRate?: string
    timeToFirstMilestone?: string
  }
  referenceClass?: string
}

export default defineEventHandler(async event => {
  const branchId = getRouterParam(event, 'id')
  const body = await readBody<{ analysis: OutsideViewAnalysis }>(event)

  if (!branchId) {
    throw createError({
      statusCode: 400,
      message: 'Branch ID is required'
    })
  }

  await db
    .update(branches)
    .set({
      outsideViewAnalysis: body.analysis,
      updatedAt: new Date()
    })
    .where(eq(branches.id, branchId))

  return {
    success: true
  }
})
