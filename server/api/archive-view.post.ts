import { db } from '../db'
import { archiveViews } from '../../db/schema'

interface ArchiveViewRequest {
  archiveId: string
  userId: string
}

export default defineEventHandler(async event => {
  const body = await readBody<ArchiveViewRequest>(event)
  const { archiveId, userId } = body

  if (!archiveId || !userId) {
    throw createError({
      statusCode: 400,
      message: 'archiveId and userId are required'
    })
  }

  await db.insert(archiveViews).values({
    archiveId,
    userId,
    viewedAt: new Date()
  })

  return { success: true }
})
