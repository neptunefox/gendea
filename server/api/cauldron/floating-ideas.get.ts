import { desc } from 'drizzle-orm'

import { savedIdeas, sparkRuns, type SparkRunIdea, type SparkRunLens } from '../../../db/schema'
import { db } from '../../db'

interface FloatingIdea {
  id: string
  text: string
  source: 'saved' | 'spark'
}

export default defineEventHandler(async () => {
  const saved = await db.select().from(savedIdeas).orderBy(desc(savedIdeas.createdAt))

  const targetCount = 10
  let savedCount: number
  let sparkCount: number

  if (saved.length === 0) {
    savedCount = 0
    sparkCount = targetCount
  } else {
    savedCount = Math.ceil(targetCount * 0.6)
    sparkCount = targetCount - savedCount
  }

  const floatingIdeas: FloatingIdea[] = []

  if (savedCount > 0) {
    const selectedSaved = saved.slice(0, savedCount)
    floatingIdeas.push(
      ...selectedSaved.map(idea => ({
        id: idea.id,
        text: idea.text,
        source: 'saved' as const
      }))
    )
  }

  if (sparkCount > 0) {
    const runs = await db.select().from(sparkRuns).orderBy(desc(sparkRuns.createdAt)).limit(10)

    const sparkIdeas: FloatingIdea[] = []

    for (const run of runs) {
      sparkIdeas.push({
        id: `spark-prompt-${run.id}`,
        text: run.prompt,
        source: 'spark'
      })

      run.coreIdeas.forEach((idea: SparkRunIdea, idx: number) => {
        sparkIdeas.push({
          id: `spark-core-${run.id}-${idx}`,
          text: idea.text,
          source: 'spark'
        })
      })

      run.lenses.forEach((lens: SparkRunLens) => {
        lens.ideas.forEach((idea: SparkRunIdea, idx: number) => {
          sparkIdeas.push({
            id: `spark-lens-${lens.id}-${idx}`,
            text: idea.text,
            source: 'spark'
          })
        })
      })
    }

    const selectedSpark = sparkIdeas.slice(0, sparkCount)
    floatingIdeas.push(...selectedSpark)
  }

  return { ideas: floatingIdeas }
})
