import { db } from '~/server/db'
import { nodes } from '~/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { branchId, ifThenPlan } = body

  const [planNode] = await db
    .select()
    .from(nodes)
    .where(eq(nodes.branchId, branchId))
    .orderBy(nodes.createdAt)
    .limit(1)

  if (!planNode) {
    throw createError({
      statusCode: 404,
      message: 'Node not found for branch'
    })
  }

  const [updated] = await db
    .update(nodes)
    .set({
      ifThenPlan,
      updatedAt: new Date()
    })
    .where(eq(nodes.id, planNode.id))
    .returning()

  return { node: updated }
})
