import { pgTable, text, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core'

export const nodes = pgTable('nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type', {
    enum: ['Idea', 'Assumption', 'Plan', 'Test', 'Result', 'Decision', 'Lesson']
  }).notNull(),
  text: text('text').notNull(),
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
