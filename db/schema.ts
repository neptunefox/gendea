import { pgTable, text, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core'

export const nodes = pgTable('nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type', {
    enum: ['Idea', 'Assumption', 'Plan', 'Test', 'Result', 'Decision', 'Lesson']
  }).notNull(),
  text: text('text').notNull(),
  name: text('name'),
  rationale: text('rationale'),
  constraints: jsonb('constraints').$type<string[]>(),
  metric: text('metric'),
  threshold: jsonb('threshold').$type<{ pass?: number; fail?: number }>(),
  ifThenPlan: jsonb('if_then_plan').$type<{
    date?: string
    time?: string
    place?: string
    action?: string
  }>(),
  energyRating: integer('energy_rating'),
  expectancyRating: integer('expectancy_rating'),
  parentId: uuid('parent_id').references(() => nodes.id),
  childIds: jsonb('child_ids').$type<string[]>().notNull().default([]),
  branchId: uuid('branch_id').notNull(),
  isAnonymous: integer('is_anonymous').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const northStars = pgTable('north_stars', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull().unique(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const ladderSteps = pgTable('ladder_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  text: text('text').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const branches = pgTable('branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  state: text('state', {
    enum: [
      'Seeded',
      'Diverging',
      'Clarifying',
      'Planning',
      'Testing',
      'Reviewing',
      'Stalled',
      'Action crisis',
      'Archived'
    ]
  })
    .notNull()
    .default('Seeded'),
  missedPlans: integer('missed_plans').notNull().default(0),
  outsideViewAnalysis: jsonb('outside_view_analysis').$type<{
    comparableEfforts: Array<{
      description: string
      successRate?: string
      timeToMilestone?: string
    }>
    baseRates: {
      successRate?: string
      timeToFirstMilestone?: string
    }
    referenceClass?: string
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull().unique(),
  description: text('description').notNull(),
  constraints: jsonb('constraints').$type<{
    timeCap?: boolean
    moneyCap?: boolean
    skillsOnHand?: boolean
  }>(),
  metric: text('metric').notNull(),
  passThreshold: text('pass_threshold').notNull(),
  failThreshold: text('fail_threshold').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const accountabilitySettings = pgTable('accountability_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique(),
  enabled: integer('enabled').notNull().default(0),
  recipientEmail: text('recipient_email'),
  frequency: text('frequency', { enum: ['weekly'] })
    .notNull()
    .default('weekly'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const archives = pgTable('archives', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull().unique(),
  tests: jsonb('tests')
    .$type<
      Array<{
        description: string
        metric: string
        result?: string
      }>
    >()
    .notNull(),
  evidence: text('evidence').notNull(),
  adviceToSelf: text('advice_to_self').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const progressLogs = pgTable('progress_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull(),
  whatHappened: text('what_happened').notNull(),
  whatLearned: text('what_learned').notNull(),
  whatNext: text('what_next').notNull(),
  energyRating: integer('energy_rating'),
  expectancyRating: integer('expectancy_rating'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const archiveViews = pgTable('archive_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  archiveId: uuid('archive_id').notNull(),
  userId: text('user_id').notNull(),
  viewedAt: timestamp('viewed_at').notNull().defaultNow()
})

export const savedIdeas = pgTable('saved_ideas', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: text('text').notNull(),
  source: text('source', { enum: ['user', 'ai', 'branch'] }).notNull(),
  parentIdeaId: uuid('parent_idea_id'),
  tags: jsonb('tags').$type<string[]>().default([]),
  isReadyToBuild: integer('is_ready_to_build').notNull().default(0),
  branchId: uuid('branch_id'),
  status: text('status', { enum: ['exploring', 'ready', 'building', 'done'] })
    .notNull()
    .default('exploring'),
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
