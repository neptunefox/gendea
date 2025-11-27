import { eq } from 'drizzle-orm'
import { createError } from 'h3'

import { savedIdeas, canvasState, canvasNodes } from '../../../db/schema'
import { db } from '../../db'

async function syncIdeaTextToCanvasNodes(ideaId: string, newText: string) {
  const allNodes = await db.select().from(canvasNodes)
  
  const matchingNodes = allNodes.filter((node) => {
    const data = node.data as Record<string, unknown>
    return data.savedIdeaId === ideaId
  })

  for (const node of matchingNodes) {
    const data = node.data as Record<string, unknown>
    if (data.coachOrigin) continue
    
    await db
      .update(canvasNodes)
      .set({
        data: {
          ...data,
          text: newText
        },
        updatedAt: new Date()
      })
      .where(eq(canvasNodes.id, node.id))
  }
}

async function findOrCreateGoalNode(projectId: string, northStar: string) {
  const existingNodes = await db
    .select()
    .from(canvasNodes)
    .where(eq(canvasNodes.projectId, projectId))

  const existingGoalNode = existingNodes.find(
    (n) => n.type === 'goal' && (n.data as Record<string, unknown>).coachOrigin === true
  )

  if (existingGoalNode) {
    await db
      .update(canvasNodes)
      .set({
        data: {
          ...(existingGoalNode.data as Record<string, unknown>),
          text: northStar
        },
        updatedAt: new Date()
      })
      .where(eq(canvasNodes.id, existingGoalNode.id))
    return existingGoalNode
  }

  const [newNode] = await db
    .insert(canvasNodes)
    .values({
      projectId,
      type: 'goal',
      position: { x: 250, y: 50 },
      data: {
        text: northStar,
        coachOrigin: true,
        savedIdeaId: projectId
      },
      version: 1
    })
    .returning()

  return newNode
}

async function findOrCreateTestNode(
  projectId: string,
  testCommitment: {
    description: string
    when: string
    where: string
    successSignal: string
    committedAt: string
  }
) {
  const existingNodes = await db
    .select()
    .from(canvasNodes)
    .where(eq(canvasNodes.projectId, projectId))

  const existingTestNode = existingNodes.find(
    (n) => n.type === 'task' && (n.data as Record<string, unknown>).coachOrigin === true
  )

  const taskText = `Test: ${testCommitment.description}\n📅 ${testCommitment.when} @ ${testCommitment.where}\n✓ Success: ${testCommitment.successSignal}`

  if (existingTestNode) {
    await db
      .update(canvasNodes)
      .set({
        data: {
          ...(existingTestNode.data as Record<string, unknown>),
          text: taskText,
          dueDate: testCommitment.when
        },
        updatedAt: new Date()
      })
      .where(eq(canvasNodes.id, existingTestNode.id))
    return existingTestNode
  }

  const [newNode] = await db
    .insert(canvasNodes)
    .values({
      projectId,
      type: 'task',
      position: { x: 250, y: 200 },
      data: {
        text: taskText,
        completed: false,
        coachOrigin: true,
        savedIdeaId: projectId,
        testCommitmentId: testCommitment.committedAt
      },
      version: 1
    })
    .returning()

  return newNode
}

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID is required'
    })
  }

  const body = await readBody(event)

  const updateData: Record<string, unknown> = {}

  if (body.status) {
    updateData.status = body.status
  }

  if (body.northStar !== undefined) {
    updateData.northStar = body.northStar
  }

  if (body.testCommitment !== undefined) {
    updateData.testCommitment = body.testCommitment
  }

  if (body.testResult !== undefined) {
    updateData.testResult = body.testResult
  }

  if (body.dismissedNudges !== undefined) {
    updateData.dismissedNudges = body.dismissedNudges
  }

  if (body.lastActiveView !== undefined) {
    updateData.lastActiveView = body.lastActiveView
  }

  if (body.text !== undefined) {
    updateData.text = body.text
  }

  try {
    const [current] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, id))

    await db.update(savedIdeas).set(updateData).where(eq(savedIdeas.id, id))

    const [updated] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, id))

    if (body.status === 'building' && current?.status !== 'building') {
      const [existingCanvas] = await db
        .select()
        .from(canvasState)
        .where(eq(canvasState.projectId, id))

      if (!existingCanvas) {
        await db.insert(canvasState).values({
          projectId: id,
          viewportX: 0,
          viewportY: 0,
          zoom: 1,
          version: 1
        })
      }
    }

    const isBuilding = updated?.status === 'building' || current?.status === 'building'

    if (isBuilding && body.northStar && body.northStar.trim()) {
      await findOrCreateGoalNode(id, body.northStar)
    }

    if (isBuilding && body.testCommitment) {
      await findOrCreateTestNode(id, body.testCommitment)
    }

    if (isBuilding && body.testResult) {
      const existingNodes = await db
        .select()
        .from(canvasNodes)
        .where(eq(canvasNodes.projectId, id))

      const testNode = existingNodes.find(
        (n) => n.type === 'task' && (n.data as Record<string, unknown>).coachOrigin === true
      )

      if (testNode) {
        const completed = body.testResult.outcome === 'worked' || body.testResult.outcome === 'completed'
        await db
          .update(canvasNodes)
          .set({
            data: {
              ...(testNode.data as Record<string, unknown>),
              completed
            },
            updatedAt: new Date()
          })
          .where(eq(canvasNodes.id, testNode.id))
      }
    }

    if (body.text !== undefined && body.text !== current?.text) {
      await syncIdeaTextToCanvasNodes(id, body.text)
    }

    return { idea: updated }
  } catch (error) {
    console.error('Failed to update idea:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update idea'
    })
  }
})
