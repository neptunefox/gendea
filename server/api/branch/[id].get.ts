import { db } from '../../db'
import { branches, northStars, ladderSteps, plans } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Branch ID is required'
    })
  }

  const branch = await db.query.branches.findFirst({
    where: eq(branches.id, id)
  })

  if (!branch) {
    throw createError({
      statusCode: 404,
      message: 'Branch not found'
    })
  }

  const northStar = await db.query.northStars.findFirst({
    where: eq(northStars.branchId, id)
  })

  const steps = await db.query.ladderSteps.findMany({
    where: eq(ladderSteps.branchId, id)
  })

  const plan = await db.query.plans.findFirst({
    where: eq(plans.branchId, id)
  })

  return {
    branch,
    northStar: northStar || null,
    ladderSteps: steps || [],
    plan: plan || null
  }
})
