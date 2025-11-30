# Requirements Document

## Introduction

This feature redesigns the Cauldron page to embrace a mystical, grimoire-inspired aesthetic. The current grid-based layout transforms into an organic, ritualistic experience where ideas feel like collected artifacts on a table surface. Cards hover in a curved arc above the cauldron, creating a sense of magical convergence. The design prioritizes physicality over polish—torn edges, parchment textures, and handwritten-style elements replace the current clean UI. Animation becomes the magic moment, with ingredients lifting, glowing, and dissolving into the brew with particle effects.

## Glossary

- **Cauldron**: The central mixing vessel where ideas combine to create new outputs
- **Floating Idea**: A draggable card representing a saved idea or spark that can be added to the cauldron
- **Ingredient**: An idea that has been added to the cauldron for mixing
- **Arc Layout**: A curved arrangement of cards positioned above the cauldron in a semi-circular pattern
- **Parchment Card**: A floating idea styled to look like aged paper with torn edges and handwritten aesthetics
- **Dissolution Animation**: The visual effect when an idea is added to the cauldron—lifting, glowing, and dissolving with particles
- **Grimoire Aesthetic**: A visual style inspired by old spell books—aged paper, wax seals, handwritten fonts, mystical elements

## Requirements

### Requirement 1: Arc Layout for Floating Ideas

**User Story:** As a user, I want floating ideas to hover in a curved arc above the cauldron, so that the layout feels like a magical ritual rather than a grid.

#### Acceptance Criteria

1. WHEN floating ideas are displayed THEN the Cauldron page SHALL position them in a semi-circular arc above the cauldron center
2. WHEN calculating arc positions THEN the Cauldron page SHALL distribute cards evenly along the curve with slight rotation angles matching the arc tangent
3. WHEN fewer than the maximum cards are displayed THEN the Cauldron page SHALL maintain proportional spacing along the arc
4. WHEN the viewport resizes THEN the Cauldron page SHALL recalculate arc positions to maintain the curved layout relative to the cauldron

### Requirement 2: Parchment Card Styling

**User Story:** As a user, I want idea cards to look like aged parchment with torn edges, so that the interface feels like a grimoire rather than a modern app.

#### Acceptance Criteria

1. WHEN rendering a floating idea card THEN the Cauldron page SHALL apply a yellowed parchment background texture
2. WHEN rendering card edges THEN the Cauldron page SHALL display irregular torn-paper borders using CSS clip-path or SVG masks
3. WHEN displaying card text THEN the Cauldron page SHALL use a handwritten-style font that remains readable
4. WHEN cards are positioned in the arc THEN each card SHALL have a slight random rotation between -5 and 5 degrees to feel hand-placed

### Requirement 3: Magical Dissolution Animation

**User Story:** As a user, I want to see ideas lift, glow, and dissolve into the cauldron with particle effects, so that adding ingredients feels like casting a spell.

#### Acceptance Criteria

1. WHEN a user drags an idea toward the cauldron THEN the idea card SHALL lift visually with increased scale and shadow
2. WHEN an idea is dropped into the cauldron THEN the card SHALL emit a purple glow effect before dissolving
3. WHEN the dissolution begins THEN the Cauldron page SHALL spawn particle effects that drift toward the cauldron center
4. WHEN the dissolution completes THEN the card SHALL fade out while particles merge into the cauldron liquid

### Requirement 4: Clustered Table Surface Feel

**User Story:** As a user, I want the overall layout to feel like ideas gathered on a table surface, so that the experience feels collected and organic rather than designed.

#### Acceptance Criteria

1. WHEN the cauldron area is rendered THEN the Cauldron page SHALL position the cauldron as the focal point with ideas clustered around and above it
2. WHEN multiple ideas are visible THEN the Cauldron page SHALL allow slight overlapping of card edges to create a collected feel
3. WHEN the page loads THEN the Cauldron page SHALL apply subtle ambient animation to cards suggesting they are floating or hovering

### Requirement 5: Reduced Visual Clutter

**User Story:** As a user, I want to see fewer ideas at once with a way to reveal more, so that the ritual feels focused rather than overwhelming.

#### Acceptance Criteria

1. WHEN the cauldron page loads THEN the Cauldron page SHALL display a maximum of 5 floating ideas in the arc
2. WHEN a user wants more ideas THEN the Cauldron page SHALL provide a gesture or button to fan out additional ideas from below
3. WHEN ideas are hidden THEN the Cauldron page SHALL indicate that more ideas are available without cluttering the view

