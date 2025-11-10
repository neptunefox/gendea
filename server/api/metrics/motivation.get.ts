import { db } from '~/server/db'
import { progressLogs, nodes } from '~/db/schema'
import { sql, avg, count, eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const branchId = query.branchId as string | undefined

  const energyStats = branchId
    ? await db
        .select({
          avgEnergy: avg(progressLogs.energyRating),
          count: count()
        })
        .from(progressLogs)
        .where(eq(progressLogs.branchId, branchId))
    : await db
        .select({
          avgEnergy: avg(progressLogs.energyRating),
          count: count()
        })
        .from(progressLogs)

  const expectancyStats = branchId
    ? await db
        .select({
          avgExpectancy: avg(progressLogs.expectancyRating),
          count: count()
        })
        .from(progressLogs)
        .where(eq(progressLogs.branchId, branchId))
    : await db
        .select({
          avgExpectancy: avg(progressLogs.expectancyRating),
          count: count()
        })
        .from(progressLogs)

  const trendData = branchId
    ? await db
        .select({
          energyRating: progressLogs.energyRating,
          expectancyRating: progressLogs.expectancyRating,
          createdAt: progressLogs.createdAt
        })
        .from(progressLogs)
        .where(eq(progressLogs.branchId, branchId))
        .orderBy(progressLogs.createdAt)
    : []

  const noveltyInjections = await db
    .select({ count: count() })
    .from(nodes)
    .where(sql`${nodes.text} ILIKE '%alternative%' OR ${nodes.text} ILIKE '%mars-adjacent%'`)

  return {
    avgEnergy: energyStats[0]?.avgEnergy || 0,
    avgExpectancy: expectancyStats[0]?.avgExpectancy || 0,
    sessionCount: energyStats[0]?.count || 0,
    trendData: trendData.map(d => ({
      energy: d.energyRating,
      expectancy: d.expectancyRating,
      date: d.createdAt
    })),
    noveltyInjectionsChosen: noveltyInjections[0]?.count || 0
  }
})
