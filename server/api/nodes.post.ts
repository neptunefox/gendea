import { db } from '~/server/db'
import { nodes, branches } from '~/db/schema'
import { eq } from 'drizzle-orm'
import { validateRequired } from '../utils/validation'
import { handleDatabaseError } from '../utils/db-error-handler'
import { workflowService } from '../../lib/workflow-service'

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { idea, assumptions } = body

    validateRequired(idea, 'idea')
    validateRequired(idea.text, 'idea.text')
    validateRequired(idea.branchId, 'idea.branchId')

    const branchId = idea.branchId

    await db.insert(branches).values({
      id: branchId,
      state: 'Seeded'
    })

    const snapshot = workflowService.transition(branchId, { type: 'SAVE' })

    await db
      .update(branches)
      .set({
        state: snapshot.value as
          | 'Seeded'
          | 'Diverging'
          | 'Clarifying'
          | 'Planning'
          | 'Testing'
          | 'Reviewing'
          | 'Stalled'
          | 'Action crisis'
          | 'Archived',
        updatedAt: new Date()
      })
      .where(eq(branches.id, branchId))

    const nodeName = generateNodeName(idea.text)

    const [savedIdea] = await db
      .insert(nodes)
      .values({
        ...idea,
        name: nodeName,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    const savedAssumptions = []
    for (const assumption of assumptions) {
      const [saved] = await db
        .insert(nodes)
        .values({
          ...assumption,
          parentId: savedIdea.id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
      savedAssumptions.push(saved)
    }

    await db
      .update(nodes)
      .set({
        childIds: savedAssumptions.map(a => a.id),
        updatedAt: new Date()
      })
      .where(eq(nodes.id, savedIdea.id))

    const suggestedTags = generateTags(idea.text)

    return {
      node: savedIdea,
      nodeName,
      suggestedTags
    }
  } catch (error) {
    console.error('Node creation error:', error)
    handleDatabaseError(error)
  }
})

function generateNodeName(text: string): string {
  const words = text.trim().split(/\s+/)
  if (words.length <= 3) return text
  return words.slice(0, 3).join(' ') + '...'
}

function generateTags(text: string): string[] {
  const tags: string[] = []
  const lowerText = text.toLowerCase()

  if (lowerText.includes('build') || lowerText.includes('create')) {
    tags.push('creation')
  }
  if (lowerText.includes('improve') || lowerText.includes('better')) {
    tags.push('improvement')
  }
  if (lowerText.includes('learn') || lowerText.includes('understand')) {
    tags.push('learning')
  }
  if (lowerText.includes('fix') || lowerText.includes('solve')) {
    tags.push('problem-solving')
  }

  return tags.slice(0, 3)
}
