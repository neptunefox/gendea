import { db } from '../db'
import { accountabilitySettings } from '../../db/schema'
import { eq } from 'drizzle-orm'

interface AccountabilitySettingsRequest {
  enabled: boolean
  recipientEmail?: string
  frequency: 'weekly'
}

export default defineEventHandler(async event => {
  const body = await readBody<AccountabilitySettingsRequest>(event)
  const { enabled, recipientEmail, frequency } = body
  const userId = 'default-user'

  const existing = await db.query.accountabilitySettings.findFirst({
    where: eq(accountabilitySettings.userId, userId)
  })

  if (existing) {
    const [updated] = await db
      .update(accountabilitySettings)
      .set({
        enabled: enabled ? 1 : 0,
        recipientEmail: recipientEmail || null,
        frequency,
        updatedAt: new Date()
      })
      .where(eq(accountabilitySettings.userId, userId))
      .returning()

    return { settings: updated }
  } else {
    const [created] = await db
      .insert(accountabilitySettings)
      .values({
        userId,
        enabled: enabled ? 1 : 0,
        recipientEmail: recipientEmail || null,
        frequency,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    return { settings: created }
  }
})
