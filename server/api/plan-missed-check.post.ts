import { db } from '../db'
import { nodes, progressLogs } from '~/db/schema'
import { eq, isNotNull } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const now = new Date()
  const missedBranches: string[] = []

  const nodesWithPlans = await db.select().from(nodes).where(isNotNull(nodes.ifThenPlan))

  for (const node of nodesWithPlans) {
    const plan = node.ifThenPlan as { date?: string; time?: string; action?: string }

    if (!plan?.date || !plan?.time) continue

    const testDateTime = new Date(`${plan.date}T${plan.time}`)

    if (testDateTime > now) continue

    const existingLogs = await db
      .select()
      .from(progressLogs)
      .where(eq(progressLogs.branchId, node.branchId))

    const hasLogAfterTest = existingLogs.some(log => {
      return new Date(log.createdAt) > testDateTime
    })

    if (!hasLogAfterTest && !missedBranches.includes(node.branchId)) {
      missedBranches.push(node.branchId)

      await $fetch('/api/plan-missed', {
        method: 'POST',
        body: { branchId: node.branchId }
      })
    }
  }

  return {
    checked: missedBranches.length,
    missedBranches
  }
})
