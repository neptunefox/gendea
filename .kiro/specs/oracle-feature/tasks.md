# Implementation Plan

## Phase 1: Remove Canvas and Coach Features

- [x] 1. Delete Canvas and Coach files
  - [x] 1.1 Delete Canvas pages and components
    - Delete `pages/canvas/[id].vue`
    - Delete `components/canvas/` directory and all contents
    - _Requirements: 1.1, 1.4_
  - [x] 1.2 Delete Coach pages and components
    - Delete `pages/coach/index.vue`
    - Delete `pages/coach/[id].vue`
    - Delete `components/coach/` directory and all contents
    - Delete `components/FlowGuidanceBanner.vue`
    - _Requirements: 1.2, 1.4_
  - [x] 1.3 Delete Canvas and Coach composables
    - Delete `composables/useCanvas.ts`
    - Delete `composables/useCanvasAnimations.ts`
    - Delete `composables/useCanvasHistory.ts`
    - Delete `composables/useBranchContext.ts`
    - Delete `composables/useFlowGuidance.ts`
    - Delete `composables/useDragAndDrop.ts`
    - _Requirements: 1.1, 1.2_
  - [x] 1.4 Delete Canvas and Coach API routes
    - Delete `server/api/canvas/` directory and all contents
    - Delete `server/api/coach.post.ts`
    - Delete `server/api/coach-stream.post.ts`
    - Delete `server/api/tests.post.ts`
    - Delete `server/api/plans.post.ts`
    - Delete `server/api/plans.put.ts`
    - Delete `server/api/progress-log.post.ts`
    - Delete `server/api/north-star/` directory
    - Delete `server/api/ladder-steps/` directory
    - Delete `server/api/ladder-steps.post.ts`
    - Delete `server/api/workflow/` directory
    - _Requirements: 1.1, 1.2_
  - [x] 1.5 Delete Canvas and Coach types and utilities
    - Delete `types/canvas.ts`
    - Delete `types/workflow.ts`
    - Delete `lib/workflow-machine.ts`
    - Delete `lib/workflow-service.ts`
    - _Requirements: 1.1, 1.2_

- [x] 2. Clean up remaining references
  - [x] 2.1 Update AppNav to remove Canvas and Coach links
    - Remove Coach link from navigation
    - Update icons: Spark uses Lightbulb, add Oracle with HelpCircle
    - _Requirements: 1.4, 9.1, 9.2, 9.3_
  - [x] 2.2 Clean up any broken imports across the codebase
    - Search for imports from deleted files
    - Remove or update references
    - _Requirements: 1.1, 1.2_

- [x] 3. Checkpoint - Ensure app builds and runs
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Simplify Spark Page and Idea Cards

- [x] 4. Update saved idea cards
  - [x] 4.1 Remove building-related UI from idea cards
    - Remove "Start building" and "Continue building" buttons
    - Remove Cauldron badge/sparkle icon visual distinction
    - Remove testCommitment and testResult field displays
    - Remove northStar field display
    - Remove lastActiveView logic
    - _Requirements: 1.5, 7.1, 7.3, 7.4_
  - [x] 4.2 Add "Ask Oracle" action to saved idea cards
    - Add button that navigates to `/oracle?idea={ideaId}`
    - Style as subtle action (appears on hover or always visible)
    - _Requirements: 7.2_

## Phase 3: Update Cauldron with Oracle Integration

- [x] 5. Add Oracle integration to Cauldron output
  - [x] 5.1 Update CauldronOutput component
    - Add "Ask Oracle" button alongside existing "Save" button
    - Implement handler that saves idea then navigates to Oracle
    - _Requirements: 8.1, 8.2, 8.3_

## Phase 4: Database Schema for Oracle

- [x] 6. Create Oracle database tables
  - [x] 6.1 Add Oracle schema to db/schema.ts
    - Add oracleSessions table with id, visitorId, ideaId, createdAt, updatedAt
    - Add oracleMessages table with id, sessionId, role, content, createdAt, sparkedAt
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 6.2 Create database migration script
    - Create migration file in scripts/migrations/
    - Include CREATE TABLE statements for oracle_sessions and oracle_messages
    - _Requirements: 10.1, 10.2_

- [ ] 7. Checkpoint - Run migration and verify schema
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Implement Oracle Backend

- [ ] 8. Create Oracle service
  - [ ] 8.1 Create server/utils/oracle-service.ts
    - Implement Oracle system prompt
    - Create generateOracleResponse function using LangChain service
    - Add Zod schema for response validation
    - Implement fallback questions for LLM failures
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3, 4.4_
  - [ ]* 8.2 Write property test for Oracle response format
    - **Property 2: Oracle responses contain only questions**
    - **Validates: Requirements 3.1, 3.2**

- [ ] 9. Create Oracle API endpoints
  - [ ] 9.1 Create POST /api/oracle/session.post.ts
    - Accept optional ideaId in request body
    - Create session with visitorId from request
    - Return sessionId and initial context if idea provided
    - _Requirements: 2.1, 2.2, 2.4_
  - [ ]* 9.2 Write property test for session creation
    - **Property 1: Session creation persists required fields**
    - **Validates: Requirements 2.2, 2.4, 2.5**
  - [ ] 9.3 Create GET /api/oracle/session/[id].get.ts
    - Return session details with all messages
    - Include idea text if session has associated idea
    - _Requirements: 2.5_
  - [ ] 9.4 Create POST /api/oracle/message.post.ts
    - Accept sessionId and message in request body
    - Persist user message
    - Generate Oracle response using oracle-service
    - Persist Oracle response
    - Return the Oracle question
    - _Requirements: 3.1, 3.4_
  - [ ]* 9.5 Write property test for message persistence
    - **Property 3: Message persistence includes all required fields**
    - **Validates: Requirements 3.4**
  - [ ] 9.6 Create POST /api/oracle/message-stream.post.ts
    - Same as message.post but with SSE streaming response
    - _Requirements: 3.1_
  - [ ] 9.7 Create POST /api/oracle/spark.post.ts
    - Accept messageId in request body
    - Update message with sparkedAt timestamp
    - Return success response
    - _Requirements: 5.3_
  - [ ]* 9.8 Write property test for spark timestamp
    - **Property 5: Spark action records timestamp**
    - **Validates: Requirements 5.3**

- [ ] 10. Checkpoint - Test Oracle API endpoints
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Implement Oracle Frontend

- [ ] 11. Create Oracle types
  - [ ] 11.1 Create types/oracle.ts
    - Define OracleSession interface
    - Define OracleMessage interface
    - _Requirements: 10.1, 10.2_

- [ ] 12. Create Oracle page and components
  - [ ] 12.1 Create pages/oracle.vue
    - Handle session creation on mount
    - Load existing session if `idea` query param present
    - Apply dark theme styling
    - Fixed input at bottom of viewport
    - _Requirements: 2.1, 2.2, 6.1, 6.4_
  - [ ] 12.2 Create components/OracleChat.vue
    - Display messages with proper alignment (user left, oracle right)
    - Handle message sending
    - Show loading state during Oracle response
    - Emit spark events
    - _Requirements: 3.5, 6.2_
  - [ ] 12.3 Create components/OracleMessage.vue
    - Render message content with appropriate styling based on role
    - Show "Spark →" button on Oracle messages
    - Apply message appear animation
    - _Requirements: 5.1, 5.4, 6.3, 6.5_

- [ ] 13. Implement Spark integration from Oracle
  - [ ] 13.1 Handle spark action in OracleMessage
    - Call /api/oracle/spark to record timestamp
    - Navigate to Spark page with question as prompt
    - _Requirements: 5.2, 5.3_

- [ ] 14. Update navigation
  - [ ] 14.1 Update AppNav with Oracle link
    - Add Oracle link between Spark and Cauldron
    - Use HelpCircle icon
    - Ensure correct order: Spark, Oracle, Cauldron, History
    - _Requirements: 9.1, 9.3, 9.6_

- [ ] 15. Final Checkpoint - Full integration test
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Property-Based Tests (Optional)

- [ ]* 16. Additional property tests
  - [ ]* 16.1 Write property test for question quality
    - **Property 4: Oracle questions are non-empty and self-contained**
    - **Validates: Requirements 4.4**
  - [ ]* 16.2 Write property test for role constraint
    - **Property 6: Message role is constrained to valid values**
    - **Validates: Requirements 10.3**
