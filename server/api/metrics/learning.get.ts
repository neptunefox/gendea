import { db } from '~/server/db'
import { nodes, archives, archiveViews, branches } from '~/db/schema'
import { sql, count, eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const lessonsPerBranch = await db
    .select({
      branchId: nodes.branchId,
      lessonCount: count()
    })
    .from(nodes)
    .where(eq(nodes.type, 'Lesson'))
    .groupBy(nodes.branchId)

  const totalLessons = lessonsPerBranch.reduce((sum, branch) => sum + branch.lessonCount, 0)
  const avgLessonsPerBranch =
    lessonsPerBranch.length > 0 ? totalLessons / lessonsPerBranch.length : 0

  const archiveViewsBeforePlanning = await db
    .select({
      userId: archiveViews.userId,
      viewedAt: archiveViews.viewedAt
    })
    .from(archiveViews)
    .innerJoin(archives, eq(archiveViews.archiveId, archives.id))

  const planningStarts = await db
    .select({
      branchId: branches.id,
      updatedAt: branches.updatedAt
    })
    .from(branches)
    .where(
      sql`${branches.state} IN ('Planning', 'Testing', 'Reviewing', 'Stalled', 'Action crisis', 'Archived')`
    )

  let totalArchiveReads = 0
  let planningEvents = 0

  for (const planning of planningStarts) {
    const readsBeforePlanning = archiveViewsBeforePlanning.filter(
      view => new Date(view.viewedAt) < new Date(planning.updatedAt)
    )
    if (readsBeforePlanning.length > 0) {
      totalArchiveReads += readsBeforePlanning.length
      planningEvents++
    }
  }

  const avgArchiveReadsBeforePlanning = planningEvents > 0 ? totalArchiveReads / planningEvents : 0

  return {
    avgLessonsPerBranch: Number(avgLessonsPerBranch) || 0,
    archiveViewsBeforePlanning: Math.round(avgArchiveReadsBeforePlanning)
  }
})
