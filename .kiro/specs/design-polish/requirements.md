# Requirements Document

## Introduction

This feature enhances Gendea's visual identity and micro-interactions to create a more cohesive, delightful mystical aesthetic. The goal is to elevate the user experience through purposeful animations, visual polish, and optional sound design that reinforces the app's magical theme.

## Glossary

- **Gendea**: The creative ideation workbench application
- **Spark**: The idea generation feature (amber-themed)
- **Cauldron**: The idea combination feature (purple-themed)
- **Oracle**: The idea exploration/questioning feature (teal-themed)
- **Idea Card**: A saved idea displayed as a tarot-style card
- **Vignette**: A subtle gradient overlay at screen edges
- **Constellation**: Visual lines connecting related elements
- **Micro-interaction**: Small, purposeful animations triggered by user actions

## Requirements

### Requirement 1: Animated Background Runes

**User Story:** As a user, I want to see subtle mystical symbols drifting in the background, so that the app feels more immersive and magical.

#### Acceptance Criteria

1. WHILE the Spark page is displayed, THE Background System SHALL render slowly drifting rune symbols at 2% opacity
2. WHILE the Cauldron page is displayed, THE Background System SHALL render slowly drifting alchemical symbols at 2% opacity
3. WHILE the Oracle page is displayed, THE Background System SHALL render slowly drifting celestial symbols at 2% opacity
4. WHEN runes drift off-screen, THE Background System SHALL recycle them to the opposite edge
5. WHEN the user has prefers-reduced-motion enabled, THE Background System SHALL display static symbols without animation

### Requirement 2: Constellation Lines Between Saved Ideas

**User Story:** As a user, I want to see visual connections between my saved ideas, so that the collection feels like a unified constellation rather than isolated cards.

#### Acceptance Criteria

1. WHEN 2 or more idea cards are displayed in the grid, THE Constellation System SHALL render subtle connecting lines between adjacent cards
2. WHEN an idea card is hovered, THE Constellation System SHALL highlight lines connected to that card with increased opacity
3. WHEN idea cards animate in or out, THE Constellation System SHALL smoothly update line positions
4. WHEN the ideas grid is collapsed, THE Constellation System SHALL hide all constellation lines

### Requirement 3: Card Dealing Animation

**User Story:** As a user, I want generated ideas to appear like cards being dealt from a deck, so that the reveal feels more dramatic and intentional.

#### Acceptance Criteria

1. WHEN new ideas are generated, THE Animation System SHALL display each idea pill with a staggered delay of 80ms between items
2. WHEN an idea pill appears, THE Animation System SHALL animate it with a slight rotation (±3 degrees) that settles to 0
3. WHEN an idea pill appears, THE Animation System SHALL animate it sliding in from a central point with scale from 0.8 to 1.0
4. WHEN the user has prefers-reduced-motion enabled, THE Animation System SHALL use simple fade-in without rotation or movement

### Requirement 4: Cauldron Output Crystallization Effect

**User Story:** As a user, I want the cauldron's output to appear with a crystallization effect, so that the moment of creation feels magical.

#### Acceptance Criteria

1. WHEN streaming text completes and output is finalized, THE Cauldron System SHALL trigger a crystallization animation
2. WHEN crystallization occurs, THE Cauldron System SHALL display a brief shimmer effect (400ms duration) on the output text
3. WHEN crystallization occurs, THE Cauldron System SHALL emit 8-12 sparkle particles from the output area
4. WHEN the user has prefers-reduced-motion enabled, THE Cauldron System SHALL skip particle effects and use a simple fade-in

### Requirement 5: Feature-Specific Vignette Gradients

**User Story:** As a user, I want each feature to have a subtle colored glow at the screen edges, so that the current context is reinforced visually.

#### Acceptance Criteria

1. WHILE the Spark page is displayed, THE Vignette System SHALL render an amber-tinted radial gradient at screen edges at 6% opacity
2. WHILE the Cauldron page is displayed, THE Vignette System SHALL render a purple-tinted radial gradient at screen edges at 6% opacity
3. WHILE the Oracle page is displayed, THE Vignette System SHALL render a teal-tinted radial gradient at screen edges at 6% opacity
4. WHEN navigating between features, THE Vignette System SHALL crossfade between vignette colors over 300ms

### Requirement 6: Enhanced Hover Micro-interactions

**User Story:** As a user, I want interactive elements to respond with subtle magical effects on hover, so that the interface feels alive.

#### Acceptance Criteria

1. WHEN hovering over the cauldron pot, THE Cauldron System SHALL increase star twinkle animation speed by 50%
2. WHEN hovering over an idea card, THE Card System SHALL display a subtle inner glow effect
3. WHEN hovering over navigation items, THE Navigation System SHALL display a faint particle trail effect
4. WHEN the user has prefers-reduced-motion enabled, THE System SHALL use opacity changes only without particle effects

### Requirement 7: Save Idea Seal Animation

**User Story:** As a user, I want saving an idea to feel like sealing a letter with wax, so that the action feels significant and permanent.

#### Acceptance Criteria

1. WHEN an idea is saved successfully, THE Animation System SHALL display a wax seal stamp animation on the toast notification
2. WHEN the seal animation plays, THE Animation System SHALL complete within 600ms
3. WHEN the seal animation plays, THE Animation System SHALL use the feature's accent color (amber for Spark, purple for Cauldron)

### Requirement 8: Oracle Pendulum Thinking Indicator

**User Story:** As a user, I want the Oracle's thinking state to feel like a pendulum or divination tool, so that it matches the mystical theme.

#### Acceptance Criteria

1. WHEN the Oracle is processing a response, THE Oracle System SHALL display a pendulum-style swinging animation instead of bouncing dots
2. WHEN the pendulum swings, THE Animation System SHALL use smooth ease-in-out timing over 2 seconds per swing
3. WHEN the pendulum swings, THE Animation System SHALL emit a subtle glow trail

### Requirement 9: Toast Smoke Dissipation

**User Story:** As a user, I want toast notifications to fade away like dissipating smoke, so that dismissals feel natural and magical.

#### Acceptance Criteria

1. WHEN a toast notification dismisses, THE Toast System SHALL animate with an upward drift and opacity fade
2. WHEN a toast dismisses, THE Toast System SHALL emit 3-5 small smoke particles that drift upward
3. WHEN the user has prefers-reduced-motion enabled, THE Toast System SHALL use simple opacity fade without particles

### Requirement 10: Optional Sound Design

**User Story:** As a user, I want optional ambient sounds for key interactions, so that I can have a more immersive experience if I choose.

#### Acceptance Criteria

1. WHEN the app loads, THE Sound System SHALL check for a user sound preference in localStorage
2. WHEN sounds are enabled and an idea is saved, THE Sound System SHALL play a soft chime sound (< 1 second duration)
3. WHEN sounds are enabled and the cauldron starts mixing, THE Sound System SHALL play a subtle bubbling ambient loop
4. WHEN sounds are enabled and the cauldron output crystallizes, THE Sound System SHALL play a brief crystalline shimmer sound
5. WHEN the user toggles sound off, THE Sound System SHALL immediately stop all playing sounds and persist the preference
6. WHERE the sound toggle is displayed, THE Settings System SHALL show it in the navigation area with a clear on/off state

### Requirement 11: Ghost Ingredients Empty State

**User Story:** As a user, I want the empty cauldron to show floating ghost ingredients, so that I understand what to do without reading instructions.

#### Acceptance Criteria

1. WHEN the cauldron has no ingredients, THE Cauldron System SHALL display 2-3 semi-transparent floating idea shapes
2. WHEN ghost ingredients are displayed, THE Animation System SHALL animate them with slow bobbing motion
3. WHEN an ingredient is added, THE Ghost System SHALL fade out the ghost ingredients over 300ms

### Requirement 12: Typography Refinements

**User Story:** As a user, I want text to feel more polished and readable, so that the interface feels professionally crafted.

#### Acceptance Criteria

1. WHEN navigation labels are displayed, THE Typography System SHALL use letter-spacing of 0.05em
2. WHEN grimoire/demo text is displayed, THE Typography System SHALL apply a subtle text-shadow for embossed effect
3. WHEN Oracle messages are displayed, THE Typography System SHALL apply a faint glow effect matching the teal accent color
