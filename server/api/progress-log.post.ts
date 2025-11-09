import { db } from '../db'
import { nodes } from '../../db/schema'

interface ProgressLogRequest {
  branchId: string
  whatHappened: string
  whatLearned: string
  whatNext: string
  energyRating?: number
  expectancyRating?: number
}

export default defineEventHandler(async event => {
  const body = await readBody<ProgressLogRequest>(event)
  const { branchId, whatHappened, whatLearned, whatNext, energyRating, expectancyRating } = body

  if (!branchId || !whatHappened) {
    throw createError({
      statusCode: 400,
      message: 'branchId and whatHappened are required'
    })
  }

  const [logNode] = await db
    .insert(nodes)
    .values({
      type: 'Result',
      text: whatHappened,
      rationale: `Learned: ${whatLearned}\nNext: ${whatNext}`,
      branchId,
      energyRating,
      expectancyRating,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  await $fetch('/api/workflow/transition', {
    method: 'POST',
    body: {
      branchId,
      event: { type: 'LOG_ENTRY' }
    }
  })

  if (expectancyRating !== undefined && expectancyRating < 3) {
    await $fetch('/api/workflow/transition', {
      method: 'POST',
      body: {
        branchId,
        event: { type: 'LOW_EXPECTANCY' }
      }
    })
  }

  return { log: logNode }
})
