import { pgTable, text, integer, timestamp, jsonb, uuid as pgUuid } from 'drizzle-orm/pg-core'

const uuid = () => pgUuid('id').primaryKey().defaultRandom()
const uuidRef = (name: string) => pgUuid(name)

const jsonCol = <T>(name: string) => jsonb(name).$type<T>()

export const savedIdeas = pgTable('saved_ideas', {
  id: uuid(),
  text: text('text').notNull(),
  source: text('source', { enum: ['user', 'ai', 'cauldron', 'spark'] }).notNull(),
  tags: jsonCol<string[]>('tags').default([]),
  isCauldronOutput: integer('is_cauldron_output').notNull().default(0),
  cauldronSessionId: uuidRef('cauldron_session_id'),
  createdAt: timestamp('created_at').notNull().defaultNow()
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

export const sparkRuns = pgTable('spark_runs', {
  id: uuid(),
  prompt: text('prompt').notNull(),
  coreIdeas: jsonCol<SparkRunIdea[]>('core_ideas').notNull(),
  lenses: jsonCol<SparkRunLens[]>('lenses').notNull(),
  nudges: jsonCol<SparkRunNudge[]>('nudges').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const cauldronSessions = pgTable('cauldron_sessions', {
  id: uuid(),
  userId: text('user_id').notNull(),
  ingredientIds: jsonCol<string[]>('ingredient_ids').notNull().default([]),
  outputIdeaId: uuidRef('output_idea_id'),
  outputText: text('output_text'),
  patterns: jsonCol<Record<string, unknown>>('patterns'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const cauldronIngredients = pgTable('cauldron_ingredients', {
  id: uuid(),
  sessionId: uuidRef('session_id')
    .notNull()
    .references(() => cauldronSessions.id),
  sourceType: text('source_type', { enum: ['saved', 'spark', 'user'] }).notNull(),
  sourceId: text('source_id'),
  content: text('content').notNull(),
  order: integer('order').notNull(),
  addedAt: timestamp('added_at').notNull().defaultNow()
})

export const oracleSessions = pgTable('oracle_sessions', {
  id: uuid(),
  visitorId: text('visitor_id').notNull(),
  ideaId: uuidRef('idea_id').references(() => savedIdeas.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const oracleMessages = pgTable('oracle_messages', {
  id: uuid(),
  sessionId: uuidRef('session_id')
    .notNull()
    .references(() => oracleSessions.id),
  role: text('role', { enum: ['user', 'oracle'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  sparkedAt: timestamp('sparked_at')
})

export const tarotReadings = pgTable('tarot_readings', {
  id: uuid(),
  visitorId: text('visitor_id').notNull(),
  date: text('date').notNull(),
  cardOptions: jsonCol<string[]>('card_options').notNull(),
  chosenCard: text('chosen_card'),
  interpretation: text('interpretation'),
  sparkPrompt: text('spark_prompt'),
  usedAsInput: integer('used_as_input').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow()
})
