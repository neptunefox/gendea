import { eq } from 'drizzle-orm'

import { db, schema } from '../../db'
import { validateRequired, validateUUID } from '../../utils/validation'

const { oracleMessages } = schema

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { messageId } = body

  validateRequired(messageId, 'messageId')
  validateUUID(messageId, 'messageId')

  const [message] = await db.select().from(oracleMessages).where(eq(oracleMessages.id, messageId))

  if (!message) {
    throw createError({
      statusCode: 404,
      message: 'Message not found'
    })
  }

  if (message.role !== 'oracle') {
    throw createError({
      statusCode: 400,
      message: 'Only Oracle messages can be sparked'
    })
  }

  await db
    .update(oracleMessages)
    .set({ sparkedAt: new Date() })
    .where(eq(oracleMessages.id, messageId))

  return { success: true }
})
