# Requirements Document

## Introduction

This feature adds visual indicators on the cauldron page to communicate that users can continue adding ideas during the mixing process and after output is generated. Currently, users may not realize they can add more ingredients to refine the synthesized output.

## Glossary

- **Cauldron**: The circular pot component where users drop ideas to be mixed together
- **Mixing**: The AI-powered process that synthesizes multiple ideas into one combined output
- **Ingredient**: An idea that has been added to the cauldron
- **Floating Idea**: A draggable card containing a saved or sparked idea that can be dropped into the cauldron
- **Remix**: The process of re-mixing when additional ideas are added after initial output

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a visual hint during mixing that I can add more ideas, so that I understand the cauldron remains interactive while processing.

#### Acceptance Criteria

1. WHILE the cauldron is mixing, THE CauldronPot component SHALL display a subtle hint text indicating more ideas can be added
2. WHEN the mixing state changes to active, THE hint indicator SHALL appear with a smooth fade-in animation
3. WHEN the mixing state changes to inactive, THE hint indicator SHALL disappear with a smooth fade-out animation

### Requirement 2

**User Story:** As a user, I want to see a visual hint after output is generated that I can add more ideas to refine it, so that I know the creative process can continue.

#### Acceptance Criteria

1. WHEN output is displayed, THE cauldron page SHALL show a hint near the cauldron or input area indicating more ideas can be added to remix
2. WHEN a user hovers over the hint, THE hint SHALL provide additional context via tooltip or expanded text
3. WHEN a new idea is added after output exists, THE hint SHALL briefly highlight to confirm the action will trigger a remix

### Requirement 3

**User Story:** As a user, I want the hints to be unobtrusive and match the app's warm aesthetic, so that they enhance rather than clutter the experience.

#### Acceptance Criteria

1. THE hint indicators SHALL use the app's coral/terracotta color palette (#d4756f) with appropriate opacity
2. THE hint indicators SHALL use subtle animations that do not distract from the main cauldron interaction
3. THE hint indicators SHALL be positioned to not overlap with existing UI elements or obstruct drag-and-drop functionality
