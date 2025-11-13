import { desc } from 'drizzle-orm'

import { nodes, progressLogs } from '../../db/schema'
import { db } from '../db'

interface ProgressLogRequest {
  branchId: string
  whatHappened: string
  whatLearned: string
  whatNext: string
  energyRating?: number
  expectancyRating?: number
}

export default defineEventHandler(async event => {
  const body = await readBody<ProgressLogRequest>(event)
  const { branchId, whatHappened, whatLearned, whatNext, energyRating, expectancyRating } = body

  if (!branchId || !whatHappened) {
    throw createError({
      statusCode: 400,
      message: 'branchId and whatHappened are required'
    })
  }

  const [logNode] = await db
    .insert(nodes)
    .values({
      type: 'Result',
      text: whatHappened,
      rationale: `Learned: ${whatLearned}\nNext: ${whatNext}`,
      branchId,
      energyRating,
      expectancyRating,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  await db.insert(progressLogs).values({
    branchId,
    whatHappened,
    whatLearned,
    whatNext,
    energyRating,
    expectancyRating,
    createdAt: new Date()
  })

  const { workflowService } = await import('../../lib/workflow-service')
  const { branches } = await import('../../db/schema')
  const { eq } = await import('drizzle-orm')

  type WorkflowState =
    | 'Seeded'
    | 'Diverging'
    | 'Clarifying'
    | 'Planning'
    | 'Testing'
    | 'Reviewing'
    | 'Stalled'
    | 'Action crisis'
    | 'Archived'

  const snapshot = workflowService.transition(branchId, { type: 'LOG_ENTRY' })

  await db
    .update(branches)
    .set({
      state: snapshot.value as WorkflowState,
      updatedAt: new Date()
    })
    .where(eq(branches.id, branchId))

  if (expectancyRating !== undefined && expectancyRating < 3) {
    const recentLogs = await db
      .select()
      .from(progressLogs)
      .where(eq(progressLogs.branchId, branchId))
      .orderBy(desc(progressLogs.createdAt))
      .limit(3)

    const lowExpectancyCount = recentLogs.filter(
      log => log.expectancyRating !== null && log.expectancyRating < 3
    ).length

    if (lowExpectancyCount >= 2) {
      const lowExpSnapshot = workflowService.transition(branchId, { type: 'LOW_EXPECTANCY' })
      await db
        .update(branches)
        .set({
          state: lowExpSnapshot.value as WorkflowState,
          updatedAt: new Date()
        })
        .where(eq(branches.id, branchId))
    }
  }

  return { log: logNode }
})
