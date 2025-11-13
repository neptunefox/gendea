import { eq } from 'drizzle-orm'

import { accountabilitySettings } from '../../db/schema'
import { db } from '../db'

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
