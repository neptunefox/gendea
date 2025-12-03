# Implementation Plan

- [x] 1. Create core utilities and types
  - [x] 1.1 Create brewing card types and interfaces
    - Define `BrewingCardDisplay`, `BrewingCardPosition`, `CauldronStreamState` interfaces
    - Create `truncateText()` utility function with 50 char limit
    - _Requirements: 1.3_
  - [ ]* 1.2 Write property test for text truncation
    - **Property 3: Text truncation correctness**
    - **Validates: Requirements 1.3**
  - [x] 1.3 Create card layout algorithm
    - Implement `calculateCardPositions()` for elliptical arrangement
    - Handle 1-6 cards with non-overlapping positions
    - _Requirements: 1.2_
  - [ ]* 1.4 Write property test for card positions
    - **Property 2: Card positions are non-overlapping**
    - **Validates: Requirements 1.2**

- [ ] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Create BrewingCardsLayer component
  - [ ] 3.1 Implement BrewingCardsLayer component structure
    - Create component with props for ingredients, isMixing, streamingText
    - Position as overlay on cauldron scene
    - _Requirements: 1.1, 1.2_
  - [ ] 3.2 Implement brewing card rendering
    - Render cards with truncated text
    - Apply calculated positions with CSS transforms
    - Add entrance animation for new cards
    - _Requirements: 1.1, 1.3_
  - [ ]* 3.3 Write property test for ingredient-to-card mapping
    - **Property 1: Ingredient-to-card mapping consistency**
    - **Validates: Requirements 1.1**
  - [ ] 3.4 Implement card animations
    - Add bobbing animation while brewing
    - Increase intensity during mixing
    - Respect prefers-reduced-motion
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ] 3.5 Implement reset behavior
    - Fade out all cards on reset
    - Clear card state
    - _Requirements: 1.4_
  - [ ]* 3.6 Write property test for reset clears cards
    - **Property 4: Reset clears all cards**
    - **Validates: Requirements 1.4**

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create StreamingTextDisplay component
  - [ ] 5.1 Implement StreamingTextDisplay component
    - Create component with text and isActive props
    - Position above brewing cards
    - Style with cauldron-themed glow (cyan/green)
    - _Requirements: 2.1, 4.1, 4.2_
  - [ ] 5.2 Implement word-by-word animation
    - Split text into words
    - Animate each word with staggered fade-in
    - Handle text wrapping for long content
    - _Requirements: 2.3, 4.3_
  - [ ]* 5.3 Write property test for token accumulation
    - **Property 5: Token accumulation integrity**
    - **Validates: Requirements 2.2**
  - [ ]* 5.4 Write property test for text wrapping
    - **Property 6: Long text wrapping**
    - **Validates: Requirements 4.3**
  - [ ] 5.5 Implement fade-out on completion
    - Fade out streaming text when mixing completes
    - _Requirements: 2.4_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Integrate with cauldron page
  - [ ] 7.1 Update cauldron.vue to capture streaming tokens
    - Modify streamMix() to accumulate tokens in state
    - Pass streaming text to BrewingCardsLayer
    - _Requirements: 2.2_
  - [ ] 7.2 Wire up BrewingCardsLayer component
    - Add BrewingCardsLayer to cauldron page template
    - Pass ingredients, isMixing, and streamingText props
    - _Requirements: 1.1, 2.1_
  - [ ] 7.3 Handle reset and state cleanup
    - Clear streaming text on reset
    - Ensure proper state transitions
    - _Requirements: 1.4, 2.4_

- [ ] 8. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
