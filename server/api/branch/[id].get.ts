import { db } from '../../db'
import { branches } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Branch ID is required'
    })
  }

  const branch = await db.query.branches.findFirst({
    where: eq(branches.id, id)
  })

  if (!branch) {
    throw createError({
      statusCode: 404,
      message: 'Branch not found'
    })
  }

  return { branch }
})
