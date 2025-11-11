# Implementation Plan

- [x] 1. Fix Diverger slot distribution and AI weighting
  - Modify IdeationSlots.vue to instantiate exactly six slots: three user, three AI
  - Update server/api/diverge.post.ts to return exactly three AI ideas instead of five
  - Add labels to each AI slot showing generation strategy (anti-prototype, constraint-first, weird option)
  - Ensure AI slots remain hidden until user fills three human slots
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Surface base rates in OutsideViewCard and wire Statistician
  - Modify OutsideViewCard.vue to call Statistician API on mount
  - Display list of similar projects with success rates and time-to-milestone estimates
  - Show prompt for user to identify three reference cases if data is insufficient
  - Display base rate summary before the Change button
  - Store outside-view analysis with branch record
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Trigger if-then planning after every capture and plan change
  - Add IfThenPlanning component display after TreeCanvas save
  - Add IfThenPlanning component display after Mars-adjacent swap in ClarificationView
  - Add IfThenPlanning component display after plan selection in PlanningView
  - Add IfThenPlanning component display after progress log completion in ProgressLogView
  - Update server/api/if-then-plan.put.ts to accept nodeId/branchId parameter and update the correct node
  - Pass relevant nodeId or branchId from each trigger point to the API
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Implement time-based progress logging with one-tap button
  - Create monitoring service to track branches with if-then plans
  - Check test windows on app load and at regular intervals
  - Display Log progress button on main interface when test window passes
  - Wire button to open ProgressLogView for the specific branch without sequential navigation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Wire critique API to PlanningView and ProgressLogView
  - Add Review with Coach button to PlanningView after test selection
  - Call server/api/critique.post.ts when button is tapped with plan and test details
  - Display critique response in dedicated UI card
  - Auto-call critique API from ProgressLogView when energy or expectancy ratings fall below threshold
  - Render feedback following scaffolding: state bar, affirm ability, give process changes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Emit PLAN_MISSED events and trigger Action Crisis
  - Create monitoring service to check if test windows pass without progress logs
  - Call server/api/plan-missed.post.ts when test window passes without log
  - Ensure plan-missed API emits PLAN_MISSED event to workflow machine
  - Update pages/index.vue to check branch state and display ActionCrisisCard when state is Stalled or Action crisis
  - Add logic to transition to Action Crisis on low expectancy ratings across multiple logs
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 7. Mount ArchivePrompt and implement complete archive workflow
  - [ ] 7.1 Wire ArchivePrompt to completion and exit flows
    - Mount ArchivePrompt in pages/index.vue when user selects exit from ActionCrisisExit
    - Mount ArchivePrompt in pages/index.vue when user marks branch complete in ProgressLogView
    - Wire ArchivePrompt to call server/api/archive with branch data on save
    - Update archive API to transition branch to Archived state
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ] 7.2 Integrate archives with Statistician and fix data efficiency
    - Modify Statistician to query archived learnings from similar branches and include in outside-view response
    - Fix ArchivePage.vue to accept full archive object prop and eliminate redundant API fetches
    - _Requirements: 7.6, 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ] 7.3 Implement action-crisis exit with re-engagement
    - Update ActionCrisisExit to archive stalled branch and create new branch with same North Star
    - Seed new branch with selected alternative as first Ladder step and navigate to Clarification
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 8. Align metrics schema and add persistent North Star display
  - [ ] 8.1 Fix metrics API response schema
    - Update server/api/metrics/acquisition.get.ts to return reachedPlanning and setDatePlace
    - Update server/api/metrics/execution.get.ts to return testsScheduled, plannedTestsRun, passRate, failRate, timeToFirstResult
    - Update server/api/metrics/quality.get.ts to return completionRate
    - Verify MetricsDashboard displays all metrics without undefined values
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  - [ ] 8.2 Add persistent North Star and Ladder display
    - Add North Star and Ladder display to PlanningView, TestSelection, and ProgressLogView components
    - Fetch North Star and Ladder from branch record when mounting these components
    - Display in pinned header or sidebar that remains visible throughout workflow
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 9. Add AI collaboration improvements with visible personas and warm-ups
  - [ ] 9.1 Add idea-less arrival support
    - Add Need a spark? button to TreeCanvas with three warm-up options
    - Wire warm-ups to call Diverger with starter prompts and label AI-generated starters
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [ ] 9.2 Add visible AI agent personas
    - Add visible AI agent status text for Diverger, Planner, Skeptic, Statistician, Coach
    - Add Ask [Agent] for help buttons in relevant stages
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  - [ ] 9.3 Auto-generate if-then suggestions after progress logs
    - Generate two if-then suggestions from Coach after progress log submission with pre-populated defaults
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ] 10. Add workflow continuity improvements with Resume card and consistent CTAs
  - Add Resume card after incubation timer showing North Star, Ladder, last AI batch, pause timestamp, and Goal-Gradient progress bar
  - Enlarge CTAs to 44×44px minimum and maintain consistent placement in bottom-right
  - Add subtle motion animations under 400ms for workflow transitions
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 16.1, 16.2, 16.3, 16.4_
