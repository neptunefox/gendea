import { db } from '../db'
import { plans } from '../../db/schema'
import { eq } from 'drizzle-orm'

interface SavePlanRequest {
  branchId: string
  description: string
  constraints: {
    timeCap?: boolean
    moneyCap?: boolean
    skillsOnHand?: boolean
  }
  test: {
    metric: string
    passThreshold: string
    failThreshold: string
  }
}

export default defineEventHandler(async event => {
  const body = await readBody<SavePlanRequest>(event)
  const { branchId, description, constraints, test } = body

  if (!branchId || !description || !test) {
    throw createError({
      statusCode: 400,
      message: 'branchId, description, and test are required'
    })
  }

  const existingPlan = await db.query.plans.findFirst({
    where: eq(plans.branchId, branchId)
  })

  let savedPlan

  if (existingPlan) {
    const [updated] = await db
      .update(plans)
      .set({
        description,
        constraints,
        metric: test.metric,
        passThreshold: test.passThreshold,
        failThreshold: test.failThreshold,
        updatedAt: new Date()
      })
      .where(eq(plans.branchId, branchId))
      .returning()
    savedPlan = updated
  } else {
    const [created] = await db
      .insert(plans)
      .values({
        branchId,
        description,
        constraints,
        metric: test.metric,
        passThreshold: test.passThreshold,
        failThreshold: test.failThreshold,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()
    savedPlan = created
  }

  return { plan: savedPlan }
})
