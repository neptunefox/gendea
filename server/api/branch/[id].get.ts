import { db } from '../../db'
import { branches, northStars, ladderSteps, plans } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const branchId = getRouterParam(event, 'id')

  if (!branchId) {
    throw createError({
      statusCode: 400,
      message: 'branchId is required'
    })
  }

  const branch = await db.query.branches.findFirst({
    where: eq(branches.id, branchId)
  })

  if (!branch) {
    throw createError({
      statusCode: 404,
      message: 'Branch not found'
    })
  }

  const northStar = await db.query.northStars.findFirst({
    where: eq(northStars.branchId, branchId)
  })

  const ladder = await db.query.ladderSteps.findMany({
    where: eq(ladderSteps.branchId, branchId),
    orderBy: (steps, { asc }) => [asc(steps.order)]
  })

  const plan = await db.query.plans.findFirst({
    where: eq(plans.branchId, branchId)
  })

  return {
    branch,
    northStar: northStar || null,
    ladderSteps: ladder,
    plan: plan || null
  }
})
