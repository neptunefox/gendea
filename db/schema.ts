import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

const uuid = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())

const timestamp = (name: string) => integer(name, { mode: 'timestamp' })

const jsonText = <T>(name: string) => text(name, { mode: 'json' }).$type<T>()

export const savedIdeas = sqliteTable('saved_ideas', {
  id: uuid(),
  text: text('text').notNull(),
  source: text('source', { enum: ['user', 'ai', 'cauldron'] }).notNull(),
  tags: jsonText<string[]>('tags').default([]),
  isCauldronOutput: integer('is_cauldron_output').notNull().default(0),
  cauldronSessionId: text('cauldron_session_id'),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`(unixepoch())`)
})

export type SparkRunIdea = { text: string }
export type SparkRunLens = {
  id: string
  title: string
  description: string
  researchCue: string
  whyItMatters: string
  ideas: SparkRunIdea[]
}
export type SparkRunNudge = {
  id: string
  title: string
  body: string
  actionLabel?: string
  researchCue: string
}

export const sparkRuns = sqliteTable('spark_runs', {
  id: uuid(),
  prompt: text('prompt').notNull(),
  coreIdeas: jsonText<SparkRunIdea[]>('core_ideas').notNull(),
  lenses: jsonText<SparkRunLens[]>('lenses').notNull(),
  nudges: jsonText<SparkRunNudge[]>('nudges').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`(unixepoch())`)
})

export const cauldronSessions = sqliteTable('cauldron_sessions', {
  id: uuid(),
  userId: text('user_id').notNull(),
  ingredientIds: jsonText<string[]>('ingredient_ids').notNull().default([]),
  outputIdeaId: text('output_idea_id'),
  outputText: text('output_text'),
  patterns: jsonText<Record<string, unknown>>('patterns'),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`(unixepoch())`)
})

export const cauldronIngredients = sqliteTable('cauldron_ingredients', {
  id: uuid(),
  sessionId: text('session_id')
    .notNull()
    .references(() => cauldronSessions.id),
  sourceType: text('source_type', { enum: ['saved', 'spark', 'user'] }).notNull(),
  sourceId: text('source_id'),
  content: text('content').notNull(),
  order: integer('order').notNull(),
  addedAt: timestamp('added_at')
    .notNull()
    .default(sql`(unixepoch())`)
})

export const oracleSessions = sqliteTable('oracle_sessions', {
  id: uuid(),
  visitorId: text('visitor_id').notNull(),
  ideaId: text('idea_id').references(() => savedIdeas.id),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`(unixepoch())`)
})

export const oracleMessages = sqliteTable('oracle_messages', {
  id: uuid(),
  sessionId: text('session_id')
    .notNull()
    .references(() => oracleSessions.id),
  role: text('role', { enum: ['user', 'oracle'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`(unixepoch())`),
  sparkedAt: timestamp('sparked_at')
})

export const tarotReadings = sqliteTable('tarot_readings', {
  id: uuid(),
  visitorId: text('visitor_id').notNull(),
  date: text('date').notNull(),
  cardOptions: jsonText<string[]>('card_options').notNull(),
  chosenCard: text('chosen_card'),
  interpretation: text('interpretation'),
  sparkPrompt: text('spark_prompt'),
  usedAsInput: integer('used_as_input').notNull().default(0),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`(unixepoch())`)
})
