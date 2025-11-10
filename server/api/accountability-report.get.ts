import { db } from '../db'
import { nodes, northStars } from '../../db/schema'
import { eq, gte, and } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const progressLogs = await db.query.nodes.findMany({
    where: and(eq(nodes.type, 'Result'), gte(nodes.createdAt, oneWeekAgo))
  })

  const reportData = await Promise.all(
    progressLogs.map(async log => {
      const northStar = await db.query.northStars.findFirst({
        where: eq(northStars.branchId, log.branchId)
      })

      const [whatLearned, whatNext] = log.rationale?.split('\nNext: ') || ['', '']
      const learned = whatLearned.replace('Learned: ', '')

      return {
        date: log.createdAt,
        northStar: northStar?.text || 'No North Star',
        outcome: log.text,
        learned,
        next: whatNext || '',
        energyRating: log.energyRating,
        expectancyRating: log.expectancyRating
      }
    })
  )

  return {
    weekStart: oneWeekAgo.toISOString(),
    weekEnd: new Date().toISOString(),
    totalLogs: reportData.length,
    logs: reportData
  }
})
