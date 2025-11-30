# Implementation Plan

- [x] 1. Add selection state management to Cauldron page
  - [x] 1.1 Add selectedIdeaId ref and selection handlers to cauldron.vue
    - Add `selectedIdeaId: Ref<string | null>` state
    - Add `handleIdeaSelect(idea)` to set selectedIdeaId
    - Add `handleBackgroundClick(event)` to deselect when clicking outside ideas
    - Pass `isSelected` prop to FloatingIdea components
    - Wire up `@select` event handler
    - _Requirements: 1.4, 2.1_

- [x] 2. Update FloatingIdea component for selection behavior
  - [x] 2.1 Add isSelected prop and select event to FloatingIdea
    - Add `isSelected: boolean` prop with default false
    - Add `select` event emission
    - Differentiate click from drag (only emit select on click without drag)
    - _Requirements: 1.1_

  - [x] 2.2 Implement timer pause/resume based on selection state
    - Watch `isSelected` prop changes
    - Pause timer when isSelected becomes true
    - Resume timer from paused value when isSelected becomes false
    - _Requirements: 1.2, 1.5, 2.3_
  - [ ]\* 2.3 Write property test for timer pause on selection
    - **Property 2: Timer Pause on Selection**
    - **Validates: Requirements 1.2**
  - [ ]\* 2.4 Write property test for timer resume on deselection
    - **Property 3: Timer Resume on Deselection**
    - **Validates: Requirements 1.5, 2.3**

  - [x] 2.5 Add selected state visual styling
    - Add `selected` CSS class with coral border, elevated shadow
    - Remove line-clamp when selected to show full text
    - Set higher z-index when selected
    - _Requirements: 1.3, 3.1, 3.2, 3.3_

  - [ ]\* 2.6 Write property test for z-index elevation
    - **Property 4: Selection State Z-Index Elevation**
    - **Validates: Requirements 3.3**

- [x] 3. Implement single-selection constraint
  - [x] 3.1 Ensure only one idea selected at a time in cauldron.vue
    - Verify selecting new idea deselects previous
    - Clean up selectedIdeaId if referenced idea expires/dissolves
    - _Requirements: 1.4_
  - [ ]\* 3.2 Write property test for single selection invariant
    - **Property 1: Single Selection Invariant**
    - **Validates: Requirements 1.4**

- [ ] 4. Checkpoint - Make sure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
