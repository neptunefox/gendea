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

  const floatingIdeas: FloatingIdea[] = []

  floatingIdeas.push(
    ...saved.map(idea => ({
      id: idea.id,
      text: idea.text,
      source: 'saved' as const
    }))
  )

  const runs = await db.select().from(sparkRuns).orderBy(desc(sparkRuns.createdAt))

  for (const run of runs) {
    floatingIdeas.push({
      id: `spark-prompt-${run.id}`,
      text: run.prompt,
      source: 'spark'
    })

    run.coreIdeas.forEach((idea: SparkRunIdea, idx: number) => {
      floatingIdeas.push({
        id: `spark-core-${run.id}-${idx}`,
        text: idea.text,
        source: 'spark'
      })
    })

    run.lenses.forEach((lens: SparkRunLens) => {
      lens.ideas.forEach((idea: SparkRunIdea, idx: number) => {
        floatingIdeas.push({
          id: `spark-lens-${lens.id}-${idx}`,
          text: idea.text,
          source: 'spark'
        })
      })
    })
  }

  return { ideas: floatingIdeas }
})
