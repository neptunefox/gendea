import { pgTable, text, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core'

export const savedIdeas = pgTable('saved_ideas', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: text('text').notNull(),
  source: text('source', { enum: ['user', 'ai', 'cauldron'] }).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]),
  isCauldronOutput: integer('is_cauldron_output').notNull().default(0),
  cauldronSessionId: uuid('cauldron_session_id'),
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
  id: uuid('id').primaryKey().defaultRandom(),
  prompt: text('prompt').notNull(),
  coreIdeas: jsonb('core_ideas').$type<SparkRunIdea[]>().notNull(),
  lenses: jsonb('lenses').$type<SparkRunLens[]>().notNull(),
  nudges: jsonb('nudges').$type<SparkRunNudge[]>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const cauldronSessions = pgTable('cauldron_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  ingredientIds: jsonb('ingredient_ids').$type<string[]>().notNull().default([]),
  outputIdeaId: uuid('output_idea_id'),
  outputText: text('output_text'),
  patterns: jsonb('patterns').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const cauldronIngredients = pgTable('cauldron_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => cauldronSessions.id),
  sourceType: text('source_type', { enum: ['saved', 'spark', 'user'] }).notNull(),
  sourceId: text('source_id'),
  content: text('content').notNull(),
  order: integer('order').notNull(),
  addedAt: timestamp('added_at').notNull().defaultNow()
})

export const oracleSessions = pgTable('oracle_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitorId: text('visitor_id').notNull(),
  ideaId: uuid('idea_id').references(() => savedIdeas.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const oracleMessages = pgTable('oracle_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => oracleSessions.id),
  role: text('role', { enum: ['user', 'oracle'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  sparkedAt: timestamp('sparked_at')
})

export const tarotReadings = pgTable('tarot_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitorId: text('visitor_id').notNull(),
  date: text('date').notNull(),
  cardOptions: jsonb('card_options').$type<string[]>().notNull(),
  chosenCard: text('chosen_card'),
  interpretation: text('interpretation'),
  sparkPrompt: text('spark_prompt'),
  usedAsInput: integer('used_as_input').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow()
})
