import { ladderSteps } from '../../db/schema'
import { db } from '../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { branchId, text, order } = body

  if (!branchId || !text || order === undefined) {
    throw createError({
      statusCode: 400,
      message: 'branchId, text, and order are required'
    })
  }

  const [step] = await db
    .insert(ladderSteps)
    .values({
      branchId,
      text,
      order,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return { step }
})
