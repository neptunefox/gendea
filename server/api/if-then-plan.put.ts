import { db } from '~/server/db'
import { nodes } from '~/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { branchId, nodeId, ifThenPlan } = body

  let targetNode

  if (nodeId) {
    const [node] = await db
      .select()
      .from(nodes)
      .where(and(eq(nodes.id, nodeId), eq(nodes.branchId, branchId)))
      .limit(1)
    targetNode = node
  } else {
    const [node] = await db
      .select()
      .from(nodes)
      .where(eq(nodes.branchId, branchId))
      .orderBy(nodes.createdAt)
      .limit(1)
    targetNode = node
  }

  if (!targetNode) {
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
    .where(eq(nodes.id, targetNode.id))
    .returning()

  return { node: updated }
})
