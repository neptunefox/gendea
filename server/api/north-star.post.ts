import { createError } from 'h3'

import { northStars } from '../../db/schema'
import { db } from '../db'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { branchId, text } = body

  if (!branchId || !text) {
    throw createError({
      statusCode: 400,
      message: 'branchId and text are required'
    })
  }

  const [northStar] = await db
    .insert(northStars)
    .values({
      branchId,
      text,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: northStars.branchId,
      set: {
        text,
        updatedAt: new Date()
      }
    })
    .returning()

  return { northStar }
})
