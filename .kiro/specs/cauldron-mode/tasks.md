# Implementation Plan

- [x] 1. Set up database schema for cauldron sessions
  - Create migration file for cauldron_sessions table with id, userId, createdAt, ingredientIds, outputIdeaId, patterns fields
  - Create migration file for cauldron_ingredients table with id, sessionId, sourceType, sourceId, content, addedAt, order fields
  - Add isCauldronOutput and cauldronSessionId fields to savedIdeas table
  - Update db/schema.ts with new table definitions and types
  - _Requirements: 2.4, 5.1, 10.1_

- [x] 2. Create API endpoint for fetching floating ideas
  - Implement GET /api/cauldron/floating-ideas endpoint
  - Query 60% of ideas from savedIdeas table ordered by most recent
  - Query 40% of ideas from sparkRuns table including AI-generated ideas, lens ideas, and user prompts
  - When user has no saved ideas, source 100% from spark runs
  - Return array of 8-10 ideas with id, text, source fields
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Create API endpoint for session management
  - Implement POST /api/cauldron/session endpoint to create new session
  - Implement GET /api/cauldron/session endpoint to retrieve current active session
  - Implement POST /api/cauldron/add-ingredient endpoint to add idea to session
  - Implement POST /api/cauldron/reset endpoint to clear current session
  - Track ingredient order and timestamps in database
  - _Requirements: 2.4, 3.5, 8.2, 10.2, 10.3_

- [x] 4. Create API endpoint for AI mixing
  - Implement POST /api/cauldron/mix endpoint
  - Fetch all ingredients for the current session with their order
  - Fetch user's saved ideas history for pattern analysis
  - Fetch previous cauldron outputs for learning
  - Build convergent prompt that synthesizes ingredients into one idea
  - Use existing LLM service to generate synthesis
  - Save output to savedIdeas with isCauldronOutput flag
  - Return synthesized idea text
  - _Requirements: 4.3, 4.5, 5.1, 5.2, 5.3, 5.4_

- [x] 5. Build Cauldron page component
  - Create pages/cauldron.vue with main layout structure
  - Add page route configuration
  - Set up reactive state for floating ideas, cauldron ingredients, mixing status, output
  - Implement session loading on mount to restore previous state
  - Implement auto-save of session state on ingredient changes
  - _Requirements: 9.4, 10.3, 10.4_

- [x] 6. Implement floating ideas display
  - Create FloatingIdea.vue component with drift and rotation animations
  - Position 8-10 ideas randomly around the screen edges
  - Implement drag start handler that captures idea data
  - Apply CSS transforms for continuous gentle movement
  - Use nth-child selectors for unique drift patterns per idea
  - Implement auto-rotation timer that fades out one idea every 15-20 seconds
  - Fetch new idea from API and fade it in to replace the rotated idea
  - Track recently displayed ideas to avoid showing duplicates and maximize variety
  - When floating idea is added to cauldron, rotate in new idea to maintain 8-10 count
  - _Requirements: 1.1, 1.5, 1.6, 1.7, 1.8, 2.2_

- [x] 7. Build cauldron visual component
  - Create CauldronPot.vue component with witch's cauldron aesthetic
  - Style with warm coral/terracotta colors matching app palette
  - Implement drop zone that accepts dragged ideas
  - Add bubbling idle animation when empty
  - Display ingredient counter when fewer than 3 ingredients
  - _Requirements: 2.1, 4.2, 8.4_

- [x] 8. Implement drag and drop interaction
  - Add drag event listeners to FloatingIdea components
  - Implement drop handler on CauldronPot that validates drop target
  - Call add-ingredient API when idea is dropped
  - Animate idea dissolving into cauldron on successful drop
  - Remove floating idea and rotate in new one from API
  - _Requirements: 2.2, 2.3, 1.5_

- [x] 9. Create input field for manual idea entry
  - Add fixed-position input field with natural placement
  - Style input to match app aesthetic without distracting from cauldron
  - Implement submit handler that calls add-ingredient API
  - Clear input field after successful submission
  - Add ingredient to cauldron with dissolving animation
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 10. Implement mixing animations and state
  - Detect when ingredient count reaches 3 and trigger mixing
  - Call /api/cauldron/mix endpoint when mixing starts
  - Display swirling particles, color shifts, and glow effects during mixing
  - Show loading state while waiting for AI response
  - Detect when new ingredients are added during mixing and trigger remix
  - _Requirements: 4.3, 4.4, 4.5_

- [x] 11. Build output display and completion animation
  - Create CauldronOutput.vue component for displaying synthesized idea
  - Implement emergence animation with steam/glow effects under 2 seconds
  - Style output card with special visual treatment
  - Position output prominently near cauldron
  - Show output when mixing completes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Implement save and reset actions
  - Add save button to CauldronOutput component
  - Call API to save output to savedIdeas with special flags
  - Show success feedback when saved
  - Add reset button to cauldron interface
  - Call reset API and clear local state when reset is triggered
  - Prevent individual ingredient removal
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.5_

- [x] 13. Add Cauldron Mode to navigation
  - Add cauldron icon and link to main navigation component
  - Use appropriate icon that represents mixing/cauldron concept
  - Ensure navigation link is visible and accessible
  - Test navigation flow between modes
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 14. Polish animations and visual effects
  - Fine-tune floating idea drift speeds and rotation angles
  - Adjust mixing animation timing and particle effects
  - Ensure output emergence animation feels magical but not slow
  - Test hover states on all interactive elements with max 2px lift
  - Apply warm color palette consistently across all cauldron components
  - _Requirements: 1.4, 4.4, 6.1, 6.5_
