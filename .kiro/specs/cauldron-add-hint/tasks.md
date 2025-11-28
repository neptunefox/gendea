# Implementation Plan

- [ ] 1. Add mixing hint to CauldronPot component
  - [x] 1.1 Add hint element that displays when isMixing is true
    - Add conditional div with Plus icon and "Keep adding ideas to refine" text
    - Position hint below the pot-body content
    - _Requirements: 1.1_
  - [x] 1.2 Add hint styling with fade animation
    - Use coral color palette with reduced opacity
    - Add CSS transition for smooth fade-in/fade-out
    - Position to not obstruct drag-and-drop
    - _Requirements: 1.2, 1.3, 3.1, 3.2, 3.3_
  - [ ]* 1.3 Write property test for mixing hint visibility
    - **Property 1: Mixing hint visibility matches mixing state**
    - **Validates: Requirements 1.1**

- [ ] 2. Add remix hint section to cauldron page
  - [x] 2.1 Add remix input and hint when output exists
    - Show input field with "Add another idea to remix..." placeholder
    - Add hint text "Drop ideas or type above to remix your result" with Sparkles icon
    - _Requirements: 2.1_
  - [ ] 2.2 Add remix hint styling
    - Style input wrapper similar to existing manual-input-wrapper
    - Add subtle hint text styling with coral color
    - Add hover state for additional context
    - _Requirements: 2.2, 3.1, 3.2, 3.3_
  - [ ] 2.3 Add highlight animation when idea is added
    - Brief pulse animation on hint when new ingredient added after output exists
    - _Requirements: 2.3_
  - [ ]* 2.4 Write property test for remix hint visibility
    - **Property 2: Remix hint visibility matches output state**
    - **Validates: Requirements 2.1**

- [ ] 3. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.
