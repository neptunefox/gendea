import { db } from '../db'
import { accountabilitySettings } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const userId = 'default-user'

  const settings = await db.query.accountabilitySettings.findFirst({
    where: eq(accountabilitySettings.userId, userId)
  })

  return {
    settings: settings || {
      enabled: false,
      recipientEmail: null,
      frequency: 'weekly'
    }
  }
})
