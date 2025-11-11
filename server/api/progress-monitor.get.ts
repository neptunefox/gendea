import { db } from '../db'
import { nodes, progressLogs } from '~/db/schema'
import { eq, isNotNull } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const now = new Date()

  const nodesWithPlans = await db.select().from(nodes).where(isNotNull(nodes.ifThenPlan))

  const pendingLogs = []

  for (const node of nodesWithPlans) {
    const plan = node.ifThenPlan as { date?: string; time?: string; action?: string }

    if (!plan?.date || !plan?.time) continue

    const testDateTime = new Date(`${plan.date}T${plan.time}`)

    if (testDateTime > now) continue

    const existingLogs = await db
      .select()
      .from(progressLogs)
      .where(eq(progressLogs.branchId, node.branchId))
      .orderBy(progressLogs.createdAt)

    const hasLogAfterTest = existingLogs.some(log => {
      return new Date(log.createdAt) > testDateTime
    })

    if (!hasLogAfterTest) {
      pendingLogs.push({
        branchId: node.branchId,
        nodeId: node.id,
        testWindow: testDateTime,
        action: plan.action || 'Complete test'
      })
    }
  }

  return { pendingLogs }
})
