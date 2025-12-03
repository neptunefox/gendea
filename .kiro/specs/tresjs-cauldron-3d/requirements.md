# Requirements Document

## Introduction

This feature implements a 3D cauldron visualization using TresJS (Vue-based Three.js wrapper) for the Cauldron page. The cauldron will feature a mystical pot with glowing circuit-like patterns, swirling luminescent liquid, and floating glowing cards above it, matching the provided reference image aesthetic.

## Glossary

- **TresJS**: A Vue.js library for declarative Three.js scene creation
- **Cauldron**: The 3D pot model with circuit patterns and glowing effects
- **Liquid Surface**: The animated, glowing liquid inside the cauldron
- **Floating Cards**: Glowing rectangular elements hovering above the cauldron
- **Circuit Pattern**: Glowing line patterns on the cauldron body resembling electronic circuits
- **Glow Effect**: Emissive lighting effect creating luminescence

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a 3D cauldron pot on the cauldron page, so that the mystical theme is visually reinforced.

#### Acceptance Criteria

1. WHEN the cauldron page loads THEN the System SHALL render a 3D cauldron pot shape with a wide rim, bulbous body, and narrow base with legs
2. WHEN the cauldron is rendered THEN the System SHALL display the pot with a dark teal/black metallic appearance
3. WHEN the cauldron is rendered THEN the System SHALL display glowing circuit-like line patterns on the pot body in cyan/teal color

### Requirement 2

**User Story:** As a user, I want to see glowing liquid inside the cauldron, so that it appears magical and active.

#### Acceptance Criteria

1. WHEN the cauldron is rendered THEN the System SHALL display a glowing liquid surface at the top of the pot
2. WHILE the scene is active THEN the System SHALL animate the liquid with a subtle swirling motion
3. WHEN the liquid is rendered THEN the System SHALL emit a cyan glow that illuminates the surrounding area

### Requirement 3

**User Story:** As a user, I want to see floating glowing cards above the cauldron, so that it represents ideas being mixed.

#### Acceptance Criteria

1. WHEN the cauldron is rendered THEN the System SHALL display 3-4 floating rectangular card shapes above the liquid
2. WHILE the scene is active THEN the System SHALL animate the cards with gentle floating and rotation motion
3. WHEN the cards are rendered THEN the System SHALL display them with a cyan glow matching the liquid

### Requirement 4

**User Story:** As a user, I want the 3D scene to have proper lighting and atmosphere, so that it feels immersive and mystical.

#### Acceptance Criteria

1. WHEN the scene is rendered THEN the System SHALL use a dark background matching the cauldron page theme
2. WHEN the scene is rendered THEN the System SHALL include ambient and point lighting to highlight the cauldron
3. WHEN the scene is rendered THEN the System SHALL position the camera to show the cauldron from a slightly elevated front angle

### Requirement 5

**User Story:** As a user, I want the 3D cauldron to be performant and accessible, so that it doesn't degrade my experience.

#### Acceptance Criteria

1. WHEN the user has reduced motion preferences enabled THEN the System SHALL reduce or disable animations
2. WHEN the scene renders THEN the System SHALL maintain smooth frame rates on standard hardware
3. WHEN the component mounts THEN the System SHALL initialize TresJS only on the client side to avoid SSR issues
