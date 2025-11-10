import { db } from '../db'
import { branches, nodes } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import { createError } from 'h3'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const branchId = query.branchId as string

  if (!branchId) {
    throw createError({
      statusCode: 400,
      message: 'branchId is required'
    })
  }

  const [branch] = await db.select().from(branches).where(eq(branches.id, branchId)).limit(1)

  if (!branch) {
    throw createError({
      statusCode: 404,
      message: 'Branch not found'
    })
  }

  const recentLogs = await db
    .select()
    .from(nodes)
    .where(eq(nodes.branchId, branchId))
    .orderBy(desc(nodes.createdAt))
    .limit(3)

  const hasLowEnergy = recentLogs.some(
    log => log.energyRating !== null && log.energyRating !== undefined && log.energyRating < 3
  )

  const isStalled = branch.state === 'Stalled'

  const shouldRecommendBreak = hasLowEnergy || isStalled

  return {
    shouldRecommendBreak,
    reason: hasLowEnergy ? 'low-energy' : isStalled ? 'stalled' : null
  }
})
