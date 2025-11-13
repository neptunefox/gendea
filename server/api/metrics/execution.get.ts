import { sql, count, eq, and } from 'drizzle-orm'

import { nodes } from '~/db/schema'
import { db } from '~/server/db'

export default defineEventHandler(async () => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const testsScheduledWithinSevenDays = await db
    .select({ count: count() })
    .from(nodes)
    .where(
      and(
        eq(nodes.type, 'Test'),
        sql`${nodes.ifThenPlan}->>'date' IS NOT NULL`,
        sql`(${nodes.ifThenPlan}->>'date')::date >= ${sevenDaysAgo.toISOString().split('T')[0]}`
      )
    )

  const totalTests = await db.select({ count: count() }).from(nodes).where(eq(nodes.type, 'Test'))

  const testsWithResults = await db
    .select({ count: count() })
    .from(nodes)
    .where(and(eq(nodes.type, 'Result')))

  const passedTests = await db
    .select({ count: count() })
    .from(nodes)
    .where(and(eq(nodes.type, 'Result'), sql`${nodes.text} ILIKE '%pass%'`))

  const failedTests = await db
    .select({ count: count() })
    .from(nodes)
    .where(and(eq(nodes.type, 'Result'), sql`${nodes.text} ILIKE '%fail%'`))

  const firstResults = await db
    .select({
      branchId: nodes.branchId,
      createdAt: nodes.createdAt
    })
    .from(nodes)
    .where(eq(nodes.type, 'Result'))
    .orderBy(nodes.createdAt)

  const branchFirstResults = new Map()
  for (const result of firstResults) {
    if (!branchFirstResults.has(result.branchId)) {
      branchFirstResults.set(result.branchId, result.createdAt)
    }
  }

  const branchCreations = await db
    .select({
      id: nodes.branchId,
      createdAt: sql<Date>`MIN(${nodes.createdAt})`
    })
    .from(nodes)
    .groupBy(nodes.branchId)

  let totalTimeToFirstResult = 0
  let branchesWithResults = 0

  for (const branch of branchCreations) {
    const firstResult = branchFirstResults.get(branch.id)
    if (firstResult) {
      const timeToResult = new Date(firstResult).getTime() - new Date(branch.createdAt).getTime()
      totalTimeToFirstResult += timeToResult
      branchesWithResults++
    }
  }

  const avgTimeToFirstResult =
    branchesWithResults > 0
      ? totalTimeToFirstResult / branchesWithResults / (1000 * 60 * 60 * 24)
      : 0

  return {
    testsScheduled: testsScheduledWithinSevenDays[0]?.count || 0,
    completionRate:
      totalTests[0]?.count > 0
        ? ((testsWithResults[0]?.count || 0) / totalTests[0].count) * 100
        : 0,
    passRate:
      testsWithResults[0]?.count > 0
        ? ((passedTests[0]?.count || 0) / testsWithResults[0].count) * 100
        : 0,
    failRate:
      testsWithResults[0]?.count > 0
        ? ((failedTests[0]?.count || 0) / testsWithResults[0].count) * 100
        : 0,
    timeToFirstResult: avgTimeToFirstResult
  }
})
