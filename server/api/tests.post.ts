import { db } from '~/server/db'
import { nodes } from '~/db/schema'

interface CreateTestRequest {
  branchId: string
  metric: string
  passThreshold: string
  failThreshold: string
}

export default defineEventHandler(async event => {
  const body = await readBody<CreateTestRequest>(event)
  const { branchId, metric, passThreshold, failThreshold } = body

  if (!branchId || !metric || !passThreshold || !failThreshold) {
    throw createError({
      statusCode: 400,
      message: 'branchId, metric, passThreshold, and failThreshold are required'
    })
  }

  const testText = `Test: ${metric}`

  const [testNode] = await db
    .insert(nodes)
    .values({
      type: 'Test',
      text: testText,
      branchId,
      metric,
      threshold: {
        pass: parseFloat(passThreshold) || undefined,
        fail: parseFloat(failThreshold) || undefined
      },
      childIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return { test: testNode }
})
