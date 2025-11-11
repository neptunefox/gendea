import { db } from '../../db'
import { branches, northStars } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const branchId = query.branchId as string

  if (!branchId) {
    throw createError({
      statusCode: 400,
      message: 'branchId is required'
    })
  }

  const [branch] = await db.select().from(branches).where(eq(branches.id, branchId))

  if (!branch) {
    throw createError({
      statusCode: 404,
      message: 'Branch not found'
    })
  }

  const shouldShowCrisis = branch.state === 'Action crisis' || branch.state === 'Stalled'

  let northStarText = undefined
  if (shouldShowCrisis) {
    const [northStar] = await db.select().from(northStars).where(eq(northStars.branchId, branchId))

    northStarText = northStar?.text
  }

  return {
    shouldShowCrisis,
    missedPlans: branch.missedPlans,
    northStar: northStarText
  }
})
