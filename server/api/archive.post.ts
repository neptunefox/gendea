import { db } from '../db'
import { archives, nodes, plans, branches } from '../../db/schema'
import { eq } from 'drizzle-orm'

interface ArchiveRequest {
  branchId: string
  adviceToSelf: string
}

export default defineEventHandler(async event => {
  const body = await readBody<ArchiveRequest>(event)
  const { branchId, adviceToSelf } = body

  if (!branchId || !adviceToSelf) {
    throw createError({
      statusCode: 400,
      message: 'branchId and adviceToSelf are required'
    })
  }

  const [plan] = await db.select().from(plans).where(eq(plans.branchId, branchId))

  const resultNodes = await db.select().from(nodes).where(eq(nodes.branchId, branchId))

  const tests = []
  const evidenceParts = []

  if (plan) {
    tests.push({
      description: plan.description,
      metric: plan.metric,
      result: undefined
    })
  }

  for (const node of resultNodes) {
    if (node.type === 'Result') {
      evidenceParts.push(node.text)
      if (node.metric) {
        const existingTest = tests.find(t => t.metric === node.metric)
        if (existingTest) {
          existingTest.result = node.text
        }
      }
    }
    if (node.type === 'Test' && node.metric) {
      tests.push({
        description: node.text,
        metric: node.metric,
        result: undefined
      })
    }
  }

  const evidence = evidenceParts.join('\n\n')

  const [archive] = await db
    .insert(archives)
    .values({
      branchId,
      tests,
      evidence,
      adviceToSelf,
      createdAt: new Date()
    })
    .returning()

  await db.update(branches).set({ state: 'Archived' }).where(eq(branches.id, branchId))

  return { archive }
})
