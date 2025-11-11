import { db } from '../../db'
import { savedIdeas } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID is required'
    })
  }

  await db.delete(savedIdeas).where(eq(savedIdeas.id, id))

  return { success: true }
})
