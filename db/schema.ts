import { pgTable, text, timestamp, integer, jsonb, uuid, real } from 'drizzle-orm/pg-core'

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
  isCauldronOutput: integer('is_cauldron_output').notNull().default(0),
  cauldronSessionId: uuid('cauldron_session_id'),
  northStar: text('north_star'),
  testCommitment: jsonb('test_commitment').$type<{
    description: string
    when: string
    where: string
    successSignal: string
    committedAt: string
  }>(),
  testResult: jsonb('test_result').$type<{
    outcome: 'worked' | 'didnt-work' | 'didnt-try'
    learnings?: string
    completedAt: string
  }>(),
  dismissedNudges: jsonb('dismissed_nudges').$type<string[]>().default([]),
  lastActiveView: text('last_active_view', { enum: ['coach', 'canvas'] }).default('coach'),
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

export const canvasNodes = pgTable('canvas_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  type: text('type').notNull(),
  position: jsonb('position').$type<{ x: number; y: number }>().notNull(),
  data: jsonb('data').$type<Record<string, unknown>>().notNull(),
  parentNodeId: uuid('parent_node_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const canvasEdges = pgTable('canvas_edges', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  sourceId: uuid('source_id').notNull(),
  targetId: uuid('target_id').notNull(),
  type: text('type'),
  label: text('label'),
  style: jsonb('style').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const canvasState = pgTable('canvas_state', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().unique(),
  viewportX: integer('viewport_x').notNull().default(0),
  viewportY: integer('viewport_y').notNull().default(0),
  zoom: real('zoom').notNull().default(1),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
