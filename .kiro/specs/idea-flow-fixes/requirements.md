# Requirements Document

## Introduction

Critical fixes to align the idea flow application implementation with its specification. This addresses eight requirement violations (Req2, Req5, Req7, Req8, Req9, Req11, Req12, Req17), three additional implementation issues (archive data efficiency, action-crisis exit flow, pinned context persistence), and five UX improvements grounded in Laws of UX research (idea-less arrivals, post-break resumption, visible AI personas, wise feedback integration, consistent CTAs).

## Glossary

- **Diverger**: AI agent that generates varied idea options using diverse prompts
- **Statistician**: AI agent that provides base rates and reference classes for outside-view analysis
- **Coach**: AI agent that creates if-then plans and maintains psychological safety through wise feedback
- **North Star**: A persistent one-line statement of the core purpose or goal
- **Ladder**: A list of concrete next steps that remain visible alongside the North Star
- **If-then Plan**: A commitment specifying date, time, place, and action
- **Action Crisis**: A decision point triggered when progress stalls
- **Archive**: A learning record capturing tests, evidence, and advice from completed branches
- **PLAN_MISSED Event**: Workflow event triggered when a scheduled test window passes without action
- **Metrics Schema**: Data structure for tracking acquisition, execution, learning, motivation, and quality metrics

## Requirements

### Requirement 1: Fix Diverger Slot Weighting (Req2 Gap)

**User Story:** As a user, I want to see balanced human-to-AI idea ratios, so that I maintain originality and the AI feels supportive rather than dominant

#### Acceptance Criteria

1. THE IdeationSlots Component SHALL instantiate exactly six total slots: three for user input and three for AI suggestions
2. THE Diverger API SHALL return exactly three AI ideas instead of five
3. THE System SHALL hide AI slots until the user fills at least three human slots
4. WHEN the Diverger generates ideas, THE System SHALL use three distinct prompts: anti-prototype, constraint-first, and one weird option
5. THE System SHALL label each AI slot with its generation strategy

### Requirement 2: Surface Base Rates in Outside-View Card (Req5 Gap)

**User Story:** As a user, I want to see base rates and similar projects in the outside-view card, so that I set realistic expectations before committing

#### Acceptance Criteria

1. WHEN the OutsideViewCard component mounts, THE System SHALL call the Statistician API to retrieve comparable efforts
2. THE OutsideViewCard SHALL display a list of similar projects with success rates and time-to-milestone estimates
3. IF the Statistician returns insufficient data, THEN THE OutsideViewCard SHALL prompt the user to identify three nearest reference cases and rate similarity
4. THE OutsideViewCard SHALL show the base rate summary before the Change button
5. THE System SHALL store the outside-view analysis with the branch record

### Requirement 3: Trigger If-Then Planning After Every Capture and Plan Change (Req7 Gap)

**User Story:** As a user, I want to create if-then plans after any dump or plan change, so that I always have a concrete next action

#### Acceptance Criteria

1. WHEN the user saves an initial idea dump in TreeCanvas, THE System SHALL display the IfThenPlanning component
2. WHEN the user swaps a Ladder step for a Mars-adjacent alternative in ClarificationView, THE System SHALL display the IfThenPlanning component
3. WHEN the user modifies constraints or selects a plan in PlanningView, THE System SHALL display the IfThenPlanning component
4. WHEN the user completes a progress log in ProgressLogView, THE System SHALL display the IfThenPlanning component
5. THE If-then Plan API SHALL update the specific node associated with the current action instead of the first node found
6. THE System SHALL pass the relevant nodeId or branchId to the if-then API to ensure correct node updates

### Requirement 4: Display One-Tap Log Progress Button After Test Windows (Req8 Gap)

**User Story:** As a user, I want a one-tap Log progress button to appear when my test window closes, so that I capture outcomes at the right moment

#### Acceptance Criteria

1. THE System SHALL monitor all branches with if-then plans that have date and time fields
2. WHEN a planned test date and time pass, THE System SHALL display a Log progress button on the main interface
3. THE Log Progress Button SHALL be visible without requiring navigation through the sequential wizard flow
4. WHEN the user taps the button, THE System SHALL open the ProgressLogView component for that specific branch
5. THE System SHALL check test windows on app load and at regular intervals to surface the button at the right time

### Requirement 5: Wire Critique API to UI Components (Req9 Gap)

**User Story:** As a user, I want to receive constructive feedback that maintains psychological safety, so that I stay motivated during difficult moments

#### Acceptance Criteria

1. THE PlanningView Component SHALL display a Review with Coach button after the user selects a test
2. WHEN the user taps Review with Coach, THE System SHALL call the critique API endpoint with the current plan and test details
3. THE System SHALL display the critique response following the scaffolding: state the bar, affirm ability to reach it, give specific process changes
4. THE ProgressLogView Component SHALL automatically call the critique API when energy or expectancy ratings fall below threshold values
5. THE System SHALL render critique feedback in a dedicated UI card that avoids person labels and focuses on assumptions and evidence

### Requirement 6: Emit PLAN_MISSED Events to Trigger Action Crisis (Req11 Gap)

**User Story:** As a user, I want clear decision points when I repeatedly miss plans, so that I can recommit or pivot effectively

#### Acceptance Criteria

1. THE System SHALL monitor all branches with if-then plans and check if test windows pass without progress logs
2. WHEN a planned test window passes without a progress log, THE System SHALL call the plan-missed API endpoint for that branch
3. THE plan-missed API SHALL emit a PLAN_MISSED event to the workflow machine
4. WHEN two PLAN_MISSED events occur for the same branch, THE Workflow Machine SHALL transition the branch to Stalled state
5. THE pages/index.vue Component SHALL check branch state and display ActionCrisisCard when state is Stalled or Action crisis
6. WHEN progress logs show low expectancy ratings across multiple entries, THE System SHALL also transition to Action Crisis state
7. THE ActionCrisisCard SHALL offer a two-week recommit or exit test with clear metrics

### Requirement 7: Mount ArchivePrompt and Call Archive API (Req12 Gap)

**User Story:** As a user, I want to preserve learnings when I complete or exit a branch, so that I can apply insights to future ideas

#### Acceptance Criteria

1. THE pages/index.vue Component SHALL mount the ArchivePrompt component when the user selects exit from ActionCrisisExit
2. THE pages/index.vue Component SHALL mount the ArchivePrompt component when the user marks a branch as complete in ProgressLogView
3. THE ArchivePrompt Component SHALL capture tests conducted, evidence gathered, and one sentence of advice to future self
4. WHEN the user saves an archive, THE ArchivePrompt SHALL call the archive API endpoint with the branch data
5. THE archive API SHALL store the archive record and transition the branch to Archived state
6. WHEN the Statistician runs outside-view analysis, THE System SHALL query archived learnings from similar past branches and include them in the response

### Requirement 8: Align Metrics API Response Schema with Dashboard (Req17 Gap)

**User Story:** As a system administrator, I want the metrics API to match the dashboard expectations, so that all tracking data displays correctly

#### Acceptance Criteria

1. THE server/api/metrics/acquisition.get.ts SHALL return reachedPlanning instead of percentReachingPlanning
2. THE server/api/metrics/acquisition.get.ts SHALL return setDatePlace instead of percentWithDatePlace
3. THE server/api/metrics/execution.get.ts SHALL return testsScheduled instead of testsScheduledWithinSevenDays
4. THE server/api/metrics/execution.get.ts SHALL return plannedTestsRun instead of keeping the same name
5. THE server/api/metrics/execution.get.ts SHALL return passRate and failRate as separate fields
6. THE server/api/metrics/execution.get.ts SHALL return timeToFirstResult instead of keeping the same name
7. THE server/api/metrics/quality.get.ts SHALL return completionRate instead of qualitySharePercent
8. THE MetricsDashboard Component SHALL correctly display all metrics without undefined values

### Requirement 9: Use Preloaded Archive Data Without Redundant Fetches

**User Story:** As a system, I need to use preloaded archive data efficiently, so that I avoid redundant API requests

#### Acceptance Criteria

1. THE components/ArchivePage.vue Component SHALL accept a full archive object prop instead of only branchId
2. THE ArchivePage Component SHALL use the provided archive prop data for rendering
3. THE ArchivePage Component SHALL only call the archive API if the archive prop is null or undefined
4. THE pages/archives.vue Component SHALL pass the fully hydrated archive objects to each ArchivePage instance
5. THE System SHALL eliminate duplicate API requests for archive data that was already fetched by the parent page

### Requirement 10: Archive Stalled Branch and Seed New Route on Exit

**User Story:** As a user, I want to quickly start a new approach when I exit a stalled branch, so that I maintain momentum toward my North Star

#### Acceptance Criteria

1. WHEN the user selects an alternative from ActionCrisisExit, THE components/ActionCrisisExit.vue SHALL emit the choice with the current branch data
2. THE pages/index.vue Component SHALL call the archive API to archive the stalled branch
3. THE pages/index.vue Component SHALL create a new branch with the same North Star from the archived branch
4. THE System SHALL seed the new branch with the selected alternative as the first Ladder step
5. THE System SHALL transition the new branch to Clarifying state
6. THE pages/index.vue Component SHALL navigate to the Clarification view with the new branch so the user can continue immediately

### Requirement 11: Keep North Star and Ladder Visible After Clarification

**User Story:** As a user, I want to see my North Star and Ladder throughout the entire workflow, so that I maintain focus on my core goal

#### Acceptance Criteria

1. THE components/PlanningView.vue Component SHALL display the North Star and Ladder from the branch record in a pinned header or sidebar
2. THE components/TestSelection.vue Component SHALL display the North Star and Ladder from the branch record in a pinned header or sidebar
3. THE components/ProgressLogView.vue Component SHALL display the North Star and Ladder from the branch record in a pinned header or sidebar
4. THE System SHALL fetch the North Star and Ladder from the branch record when mounting these components
5. THE North Star and Ladder SHALL remain visible until the branch is archived or the user explicitly changes them in ClarificationView

### Requirement 12: Idea-less Arrival Support

**User Story:** As a user arriving without a clear idea, I want quick warm-up prompts, so that I can start exploring immediately

#### Acceptance Criteria

1. WHEN the capture canvas is empty, THE System SHALL display a Need a spark? button
2. WHEN the user taps Need a spark?, THE System SHALL show three warm-up options: Name a constraint first, List where you last felt stuck, Ask Diverger for a seed
3. WHEN the user selects a warm-up option, THE Diverger SHALL generate a starter idea based on that prompt
4. THE System SHALL label the AI-generated starter with its prompt strategy so the user understands the approach

### Requirement 13: Post-Break Resumption Context

**User Story:** As a user returning from an incubation break, I want to see where I left off, so that I can resume with continuity

#### Acceptance Criteria

1. WHEN the incubation timer ends, THE System SHALL display a Resume card before showing the ideation slots
2. THE Resume Card SHALL show the North Star, Ladder, last AI idea batch, and a timestamp of when the user paused
3. THE Resume Card SHALL include a Goal-Gradient progress bar showing position in the capture→plan→test loop
4. WHEN the user dismisses the Resume card, THE System SHALL restore the ideation slots with all previously entered ideas and AI suggestions

### Requirement 14: Visible AI Agent Personas

**User Story:** As a user, I want to see which AI agent is helping me and what it's doing, so that the assistance feels collaborative rather than extractive

#### Acceptance Criteria

1. WHEN the Diverger generates ideas, THE System SHALL display status text: Diverger is warming up a weird option…
2. WHEN the Planner creates micro-plans, THE System SHALL display status text: Planner is finding paths within your constraints…
3. WHEN the Skeptic runs pre-mortem, THE System SHALL display status text: Skeptic is imagining failure modes…
4. WHEN the Statistician gathers base rates, THE System SHALL display status text: Statistician is finding similar projects…
5. WHEN the Coach provides feedback, THE System SHALL display status text: Coach is preparing supportive guidance…
6. THE System SHALL show an Ask [Agent] for help button in relevant stages to enable user-initiated collaboration

### Requirement 15: Auto-Generated If-Then After Progress Log

**User Story:** As a user completing a progress log, I want automatic if-then suggestions, so that I always leave with a concrete next action

#### Acceptance Criteria

1. WHEN the user submits a progress log, THE Coach SHALL generate two if-then plan suggestions based on the what next field
2. THE System SHALL display the suggestions with date, time, and place fields pre-populated with intelligent defaults
3. THE User SHALL be able to select one suggestion, edit it, or create a custom if-then plan
4. THE System SHALL limit choices to two suggestions to reduce decision paralysis

### Requirement 16: Enlarged CTAs with Consistent Placement

**User Story:** As a user, I want key action buttons to be easy to find and tap, so that I can move through the workflow effortlessly

#### Acceptance Criteria

1. THE System SHALL use a minimum touch target size of 44×44 pixels for all primary CTAs
2. THE Continue, Recommit, and Start buttons SHALL maintain consistent placement in the bottom-right corner across all views
3. WHEN transitioning between divergent and convergent workflow states, THE System SHALL use subtle motion animations under 400ms
4. THE Break Recommendation and Action Crisis cards SHALL feature enlarged CTAs that are visually prominent
