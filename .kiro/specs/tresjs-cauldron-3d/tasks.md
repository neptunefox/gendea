# Implementation Plan

- [x] 1. Install TresJS dependencies and configure Nuxt
  - [x] 1.1 Install TresJS packages (three, @tresjs/nuxt, @tresjs/cientos)
    - Run: `bun add three @tresjs/nuxt @tresjs/cientos`
    - Run: `bun add -D @types/three`
    - _Requirements: 1.1, 5.3_
  - [x] 1.2 Configure Nuxt module for TresJS
    - Add `@tresjs/nuxt` to modules in nuxt.config.ts
    - _Requirements: 5.3_

- [ ] 2. Create the base CauldronScene component
  - [ ] 2.1 Create CauldronScene.vue with TresCanvas setup
    - Create `components/CauldronScene.vue`
    - Set up TresCanvas with dark background (#0a0f0f)
    - Add PerspectiveCamera at elevated front angle position [0, 2, 5]
    - Add OrbitControls for development (optional, can remove later)
    - _Requirements: 4.1, 4.3, 5.3_
  - [ ] 2.2 Add lighting setup
    - Add ambient light with low intensity (0.1)
    - Add point light above cauldron with cyan tint (#00ffcc)
    - _Requirements: 4.2_

- [ ] 3. Implement the cauldron pot geometry
  - [ ] 3.1 Create cauldron pot mesh using LatheGeometry
    - Define pot profile points (rim, body curve, base, legs)
    - Create LatheGeometry from profile
    - Apply dark metallic material (#0a1a1a)
    - _Requirements: 1.1, 1.2_
  - [ ] 3.2 Add circuit pattern shader to cauldron
    - Create custom ShaderMaterial for circuit glow effect
    - Use UV coordinates to draw glowing line patterns
    - Set emissive cyan color (#00ffcc) for circuit lines
    - _Requirements: 1.3_

- [ ] 4. Implement the liquid surface
  - [ ] 4.1 Create liquid mesh with glow effect
    - Add CircleGeometry at pot opening
    - Create ShaderMaterial with emissive glow
    - Position at top of cauldron
    - _Requirements: 2.1, 2.3_
  - [ ] 4.2 Add swirling animation to liquid
    - Use useRenderLoop to animate shader uniforms
    - Rotate UV coordinates for swirl effect
    - Respect reduced motion preference
    - _Requirements: 2.2, 5.1_
  - [ ]* 4.3 Write property test for liquid animation
    - **Property 1: Liquid animation changes over time**
    - **Validates: Requirements 2.2**

- [ ] 5. Implement floating cards
  - [ ] 5.1 Create floating card meshes
    - Add 4 PlaneGeometry cards above liquid
    - Apply emissive cyan material
    - Position in circular arrangement
    - _Requirements: 3.1, 3.3_
  - [ ] 5.2 Add floating and rotation animation to cards
    - Implement sinusoidal vertical movement
    - Add gentle rotation animation
    - Use phase offsets for varied motion
    - Respect reduced motion preference
    - _Requirements: 3.2, 5.1_
  - [ ]* 5.3 Write property test for card animation
    - **Property 2: Card animation changes over time**
    - **Validates: Requirements 3.2**

- [ ] 6. Add reduced motion support
  - [ ] 6.1 Integrate useReducedMotion composable
    - Import existing useReducedMotion from composables
    - Conditionally disable animations when preference is set
    - _Requirements: 5.1_
  - [ ]* 6.2 Write property test for reduced motion
    - **Property 3: Reduced motion disables animations**
    - **Validates: Requirements 5.1**

- [ ] 7. Integrate CauldronScene into cauldron page
  - [ ] 7.1 Add CauldronScene to cauldron.vue page
    - Import and render CauldronScene component
    - Position appropriately within page layout
    - Ensure client-only rendering
    - _Requirements: 1.1, 5.3_

- [ ] 8. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
