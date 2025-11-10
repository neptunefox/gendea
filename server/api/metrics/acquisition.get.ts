import { db } from '~/server/db'
import { nodes, branches } from '~/db/schema'
import { sql, count, eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const totalSeeds = await db.select({ count: count() }).from(nodes).where(eq(nodes.type, 'Idea'))

  const branchesInPlanning = await db
    .select({ count: count() })
    .from(branches)
    .where(
      sql`${branches.state} IN ('Planning', 'Testing', 'Reviewing', 'Stalled', 'Action crisis', 'Archived')`
    )

  const branchesWithDatePlace = await db
    .select({ count: count() })
    .from(nodes)
    .where(
      sql`${nodes.ifThenPlan}->>'date' IS NOT NULL AND ${nodes.ifThenPlan}->>'place' IS NOT NULL`
    )

  const totalBranches = await db.select({ count: count() }).from(branches)

  return {
    totalSeeds: totalSeeds[0]?.count || 0,
    percentReachingPlanning:
      totalBranches[0]?.count > 0
        ? ((branchesInPlanning[0]?.count || 0) / totalBranches[0].count) * 100
        : 0,
    percentWithDatePlace:
      totalBranches[0]?.count > 0
        ? ((branchesWithDatePlace[0]?.count || 0) / totalBranches[0].count) * 100
        : 0
  }
})
