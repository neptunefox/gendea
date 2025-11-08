import { db } from '~/server/db'
import { nodes, branches } from '~/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { idea, assumptions } = body

  const branchId = idea.branchId

  await db.insert(branches).values({
    id: branchId,
    state: 'Seeded'
  })

  await db
    .update(branches)
    .set({
      state: 'Diverging',
      updatedAt: new Date()
    })
    .where(eq(branches.id, branchId))

  const [savedIdea] = await db
    .insert(nodes)
    .values({
      ...idea,
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
    suggestedTags
  }
})

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
