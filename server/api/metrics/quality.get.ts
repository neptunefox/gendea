import { db } from '~/server/db'
import { nodes, branches } from '~/db/schema'
import { count, eq, and, inArray } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const branchesWithTests = await db
    .select({
      branchId: nodes.branchId
    })
    .from(nodes)
    .where(eq(nodes.type, 'Test'))
    .groupBy(nodes.branchId)

  const branchIdsWithTests = branchesWithTests.map(b => b.branchId)

  const branchesWithDecisions =
    branchIdsWithTests.length > 0
      ? await db
          .select({
            branchId: nodes.branchId
          })
          .from(nodes)
          .where(and(eq(nodes.type, 'Decision'), inArray(nodes.branchId, branchIdsWithTests)))
          .groupBy(nodes.branchId)
      : []

  const totalBranches = await db.select({ count: count() }).from(branches)

  const qualityShare =
    totalBranches[0]?.count > 0 ? (branchesWithDecisions.length / totalBranches[0].count) * 100 : 0

  return {
    branchesWithTestsAndDecisions: branchesWithDecisions.length,
    totalBranches: totalBranches[0]?.count || 0,
    completionRate: qualityShare
  }
})
