import { db } from '../../db'
import { archives } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const branchId = getRouterParam(event, 'branchId')

  if (!branchId) {
    throw createError({
      statusCode: 400,
      message: 'branchId is required'
    })
  }

  const [archive] = await db.select().from(archives).where(eq(archives.branchId, branchId))

  if (!archive) {
    throw createError({
      statusCode: 404,
      message: 'Archive not found'
    })
  }

  return { archive }
})
