# Requirements Document

## Introduction

An idea management application that guides users through a structured process of capturing, developing, testing, and learning from ideas. The system uses a tree canvas interface with AI-assisted planning, built-in experimentation framework, and progress tracking to help users move from initial concepts to tested outcomes.

## Glossary

- **Tree Canvas**: The primary workspace where users organize ideas in a hierarchical node structure
- **Node**: A single unit in the tree canvas representing an idea, plan, test, or result
- **North Star**: A persistent one-line statement of the core purpose or goal
- **Ladder**: A list of concrete next steps that remain visible alongside the North Star
- **Mars-adjacent**: Alternative approaches that maintain novelty while serving the same North Star
- **Smallest Honest Test**: The minimal experiment that can provide meaningful validation
- **Pre-mortem**: A reflection exercise where users imagine why an approach might fail
- **Outside View**: Perspective based on base rates and similar past projects
- **If-then Plan**: A commitment specifying date, time, place, and action
- **Action Crisis**: A decision point triggered when progress stalls, offering recommit or exit options
- **Diverger**: AI agent role that generates varied options using diverse prompts
- **Planner**: AI agent role that converts ideas into micro-plans with constraints
- **Skeptic**: AI agent role that runs pre-mortem prompts and identifies risks
- **Statistician**: AI agent role that provides base rates and reference classes
- **Coach**: AI agent role that creates if-then plans and maintains psychological safety

## Requirements

### Requirement 1: Initial Idea Capture

**User Story:** As a user, I want to quickly capture my initial idea with context, so that I can start developing it without losing important details

#### Acceptance Criteria

1. WHEN the user opens the application, THE Tree Canvas SHALL display a grid interface with a top cell for one-line problem or wish input
2. THE Tree Canvas SHALL provide three small fields for listing assumptions
3. THE Tree Canvas SHALL pre-select a Save button to enable automatic capture
4. WHEN the user saves an idea, THE System SHALL store the dump, name the node, and suggest optional tags

### Requirement 2: Parallel Idea Generation

**User Story:** As a user, I want to generate multiple diverse ideas before AI assistance, so that I maintain originality and explore varied approaches

#### Acceptance Criteria

1. WHEN an idea is saved, THE Tree Canvas SHALL open six small idea slots
2. THE System SHALL require the user to fill at least three slots before displaying AI suggestions
3. WHEN the user completes their entries, THE Diverger SHALL fill three slots in parallel using different prompts including anti-prototype and constraint-first approaches
4. WHEN the first pass completes, THE System SHALL display a timer for a short walk or light activity
5. WHEN the timer ends, THE System SHALL resurface the same node

### Requirement 3: Clarification with Spark Preservation

**User Story:** As a user, I want to clarify my idea into concrete steps while preserving novelty, so that I maintain both feasibility and creativity

#### Acceptance Criteria

1. WHEN clarification begins, THE System SHALL build a Ladder beside a North Star card
2. THE North Star card SHALL display the why in one line
3. THE Ladder SHALL list the first three concrete steps
4. THE System SHALL keep both North Star and Ladder pinned and visible
5. THE System SHALL allow the user to swap any step for a Mars-adjacent alternative that points at the same North Star

### Requirement 4: Constraint-Based Planning

**User Story:** As a user, I want to create plans within specific constraints, so that I can work within realistic boundaries while boosting creativity

#### Acceptance Criteria

1. WHEN planning begins, THE Planner SHALL offer two or three micro-plans per idea
2. THE System SHALL frame each plan by constraints the user can toggle including time cap, money cap, and skills on hand
3. THE System SHALL display a small banner reminding that moderate meaningful constraints help originality

### Requirement 5: Risk Assessment

**User Story:** As a user, I want to identify potential failures and realistic expectations before committing, so that I can make informed decisions

#### Acceptance Criteria

1. WHEN a user initiates a big push, THE System SHALL display a two-minute pre-mortem card
2. THE Pre-mortem Card SHALL prompt the user to write why this could fail
3. THE System SHALL display an outside-view card that pulls base rates from similar projects
4. IF base rate data is scarce, THEN THE System SHALL ask the user to draw a rough reference class

### Requirement 6: Test Selection

**User Story:** As a user, I want to define specific tests with clear success criteria, so that I can validate ideas objectively

#### Acceptance Criteria

1. WHEN test selection begins, THE System SHALL propose two or three smallest honest tests per plan
2. THE System SHALL allow the user to select tests
3. THE System SHALL prompt for a metric and a pass or fail threshold for each test
4. THE System SHALL record test definitions in the node

### Requirement 7: Action Planning

**User Story:** As a user, I want to convert any plan into a concrete commitment, so that I increase follow-through

#### Acceptance Criteria

1. WHEN a dump or plan change completes, THE System SHALL prompt for an if-then micro-plan
2. THE If-then Plan SHALL include date, time, and place fields
3. THE System SHALL store the if-then plan with the node

### Requirement 8: Progress Tracking

**User Story:** As a user, I want to log outcomes and learnings without gamification, so that I can track real progress

#### Acceptance Criteria

1. WHEN a planned test window passes, THE System SHALL display a one-tap Log progress button
2. THE Progress Log SHALL ask what happened, what you learned, and what next
3. THE System SHALL offer optional accountability that sends a weekly report to the user or a partner
4. THE System SHALL avoid streaks or likes and only show recorded outcomes and learning notes

### Requirement 9: Constructive Critique

**User Story:** As a user, I want to receive feedback that maintains psychological safety, so that I stay motivated and focused on improvement

#### Acceptance Criteria

1. WHEN critique is provided, THE Coach SHALL follow a scaffolding that states the bar, affirms ability to reach it, and gives specific process changes
2. THE Coach SHALL avoid person labels and keep focus on assumptions and evidence

### Requirement 10: Purposeful Incubation

**User Story:** As a user, I want structured breaks when I stall, so that I can return with fresh perspective

#### Acceptance Criteria

1. WHEN a user stalls or returns low-energy, THE System SHALL recommend a 10 to 15 minute undemanding break or short walk
2. WHEN the user returns, THE System SHALL reopen the same node for a second pass

### Requirement 11: Action Crisis Management

**User Story:** As a user, I want clear decision points when progress stalls, so that I can recommit or pivot effectively

#### Acceptance Criteria

1. IF repeated logs show little movement or low expectancy, THEN THE System SHALL open an Action crisis card
2. THE Action Crisis Card SHALL offer a two week recommit or exit test with clear metrics
3. IF exit happens, THEN THE System SHALL provide a fast re-engage path to a different route that serves the same North Star

### Requirement 12: Learning Archive

**User Story:** As a user, I want to preserve learnings from completed branches, so that I can apply insights to future ideas

#### Acceptance Criteria

1. WHEN a branch is finished or exited, THE System SHALL write a page with the tests, the evidence, and one sentence of advice to future self
2. THE Archive SHALL feed the outside-view step for future planning

### Requirement 13: Agent State Management

**User Story:** As a system, I need to manage agent roles and state transitions, so that users receive appropriate assistance at each stage

#### Acceptance Criteria

1. THE System SHALL support five agent roles: Diverger, Planner, Skeptic, Statistician, and Coach
2. THE System SHALL maintain node states: Seeded, Diverging, Clarifying, Planning, Testing, Reviewing, Stalled, Action crisis, and Archived
3. WHEN a node is saved, THE System SHALL transition from Seeded to Diverging
4. WHEN minimum idea slots are filled or timer ends, THE System SHALL transition from Diverging to Clarifying
5. WHEN North Star and first steps are pinned, THE System SHALL transition from Clarifying to Planning
6. WHEN pass or fail thresholds exist and a plan exists, THE System SHALL transition from Planning to Testing
7. WHEN a log entry arrives, THE System SHALL transition from Testing to Reviewing
8. WHEN two plans are missed, THE System SHALL transition any state to Stalled
9. WHEN the user confirms low expectancy, THE System SHALL transition from Stalled to Action crisis
10. WHEN exit or completion occurs, THE System SHALL transition any state to Archived

### Requirement 14: Agent Prompt Patterns

**User Story:** As a system, I need consistent prompt patterns for each agent role, so that assistance is predictable and effective

#### Acceptance Criteria

1. WHEN the Diverger generates options, THE Diverger SHALL give five options that avoid common answers, include one weird option, keep one constrained to one hour, and keep one under 100 dollars
2. WHEN the Planner creates plans, THE Planner SHALL produce two micro-plans per option under chosen constraints, each with one smallest honest test including metric, pass threshold, and fail threshold
3. WHEN the Skeptic runs analysis, THE Skeptic SHALL imagine six months later failure, list three most likely causes with one test each, and ask which assumption would change first
4. WHEN the Statistician provides context, THE Statistician SHALL list comparable efforts, estimate base rates for success or time to first milestone, and if no data exists ask the user to pick three nearest cases and rate similarity
5. WHEN the Coach creates plans, THE Coach SHALL turn user actions into if-then plans with date, time, and place, and rewrite any critique into high standards with assurance and concrete steps

### Requirement 15: Data Model

**User Story:** As a system, I need a structured data model for the tree, so that I can store and retrieve all node information

#### Acceptance Criteria

1. THE System SHALL support node types: Idea, Assumption, Plan, Test, Result, Decision, and Lesson
2. THE System SHALL store key fields for each node: text, rationale, constraints, metric, threshold, if-then plan, date, time, place, energy rating, expectancy rating, and links to parents and children
3. THE System SHALL maintain one pinned North Star per branch
4. THE System SHALL maintain a short Ladder of next steps that always stays visible

### Requirement 16: UX Patterns for Behavior Support

**User Story:** As a user, I want interface patterns that guide me toward effective practices, so that I naturally follow productive workflows

#### Acceptance Criteria

1. WHEN an idea is captured, THE System SHALL show Save confirmed and a nudge to plan
2. WHILE the user is in divergence, THE System SHALL hide AI until the user enters at least three ideas
3. THE System SHALL use short timers for movement or light tasks and bring back the same node
4. THE System SHALL avoid leaderboards and streaks and show clear progress lines and learning notes
5. WHERE teams are using the system, THE System SHALL offer anonymous idea collection to reduce evaluation fear
6. WHEN a constraint is applied, THE System SHALL show a small note when the constraint raises creativity odds

### Requirement 17: Metrics and Health Monitoring

**User Story:** As a system administrator, I want to track key metrics, so that I can assess system effectiveness

#### Acceptance Criteria

1. THE System SHALL track acquisition metrics: number of seeds per user, percent that reach planning, percent that set a date and place
2. THE System SHALL track execution metrics: tests scheduled within seven days, planned tests that actually run, pass or fail rates, time to first result
3. THE System SHALL track learning metrics: average number of lessons per branch, number of archive pages read before new planning
4. THE System SHALL track motivation metrics: energy and expectancy slider values after sessions, trend lines per branch, number of novelty injections chosen
5. THE System SHALL track quality metrics: share of ideas that progressed from seed to at least one honest test then to a decision
