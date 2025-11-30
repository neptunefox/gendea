# Implementation Plan

- [-] 1. Update arc position calculation system
  - [x] 1.1 Refactor `utils/floating-position.ts` to implement arc layout algorithm
    - Add `ArcLayoutConfig` and `ArcPosition` interfaces
    - Implement `generateArcPosition()` function using trigonometry for arc placement
    - Implement `calculateArcTangentRotation()` for card rotation along arc
    - Add random rotation offset (-5 to 5 degrees) per card
    - _Requirements: 1.1, 1.2, 1.3, 2.4_
  - [ ]* 1.2 Write property test for arc layout structure
    - **Property 1: Valid Arc Layout Structure**
    - **Validates: Requirements 1.1, 4.1**
  - [ ]* 1.3 Write property test for even angular distribution
    - **Property 2: Even Angular Distribution**
    - **Validates: Requirements 1.2**
  - [ ]* 1.4 Write property test for proportional spacing
    - **Property 3: Proportional Spacing Preservation**
    - **Validates: Requirements 1.3**
  - [ ]* 1.5 Write property test for rotation bounds
    - **Property 5: Rotation Bounds**
    - **Validates: Requirements 2.4**

- [x] 2. Update FloatingIdea component for arc positioning
  - [x] 2.1 Modify `FloatingIdea.vue` to use new arc position system
    - Add `totalCards` and `cauldronCenter` props
    - Update `positionStyle` computed to include rotation from arc calculation
    - Update `updatePositionForViewport()` to call `generateArcPosition()`
    - _Requirements: 1.1, 1.4, 2.4_
  - [ ]* 2.2 Write property test for responsive arc recalculation
    - **Property 4: Responsive Arc Recalculation**
    - **Validates: Requirements 1.4**

- [ ] 3. Implement parchment card styling
  - [ ] 3.1 Add parchment CSS styles to `FloatingIdea.vue`
    - Add CSS variables for parchment colors
    - Create yellowed background gradient
    - Implement torn-edge effect using CSS clip-path
    - Apply handwritten-style font (use existing Satoshi or add new)
    - Add subtle paper texture overlay
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Implement particle dissolution system
  - [ ] 4.1 Create `composables/useParticles.ts` composable
    - Implement `Particle` interface and state management
    - Create `spawnDissolutionParticles()` function
    - Implement `updateParticles()` with animation frame loop
    - Add particle drift toward cauldron center
    - Implement cleanup and particle cap (max 50)
    - _Requirements: 3.3, 3.4_
  - [ ]* 4.2 Write property test for particle drift direction
    - **Property 6: Particle Drift Direction**
    - **Validates: Requirements 3.3**

- [ ] 5. Integrate dissolution animation into FloatingIdea
  - [ ] 5.1 Update `FloatingIdea.vue` with dissolution effects
    - Add lift effect (scale + shadow) on drag toward cauldron
    - Add purple glow effect before dissolve
    - Integrate particle system on dissolution
    - Emit `dissolveStart` event for particle spawning
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Update cauldron page layout and idea management
  - [ ] 6.1 Modify `pages/cauldron.vue` for new layout
    - Limit displayed ideas to maximum of 5
    - Pass `totalCards` and `cauldronCenter` to FloatingIdea components
    - Add "show more ideas" button/gesture when more than 5 available
    - Add indicator for hidden ideas count
    - Position cauldron as central focal point
    - _Requirements: 4.1, 5.1, 5.2, 5.3_
  - [ ]* 6.2 Write property test for maximum display count
    - **Property 7: Maximum Display Count**
    - **Validates: Requirements 5.1**

- [ ] 7. Add ambient floating animation
  - [ ] 7.1 Implement subtle hover animation for arc cards
    - Add gentle bobbing animation to cards in arc
    - Ensure animation respects `prefers-reduced-motion`
    - _Requirements: 4.3_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

