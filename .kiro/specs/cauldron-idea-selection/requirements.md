# Requirements Document

## Introduction

This feature adds single-click selection behavior to floating ideas on the Cauldron page. When a user clicks on a floating idea, it becomes selected, pauses its expiration timer, and expands to show the full text content. Only one idea can be selected at a time - selecting a new idea deselects the previous one.

## Glossary

- **Floating Idea**: A draggable card displaying an idea that floats around the Cauldron page with an expiration timer
- **Selection State**: The visual and functional state when an idea is clicked and actively focused
- **Expiration Timer**: A countdown timer that removes the floating idea when it reaches zero
- **Idea Card**: The visual container displaying the idea text and timer indicator

## Requirements

### Requirement 1

**User Story:** As a user, I want to click on a floating idea to select it, so that I can focus on and read the full content without it expiring.

#### Acceptance Criteria

1. WHEN a user clicks on a floating idea THEN the FloatingIdea component SHALL enter a selected state with distinct visual styling
2. WHEN a floating idea enters the selected state THEN the FloatingIdea component SHALL pause its expiration timer
3. WHEN a floating idea is selected THEN the FloatingIdea component SHALL expand to display the complete idea text without truncation
4. WHEN a user clicks on a different floating idea while one is already selected THEN the Cauldron page SHALL deselect the previous idea and select the new one
5. WHEN a previously selected idea is deselected THEN the FloatingIdea component SHALL resume its expiration timer from where it paused

### Requirement 2

**User Story:** As a user, I want to deselect a floating idea by clicking elsewhere, so that I can return to browsing mode.

#### Acceptance Criteria

1. WHEN a user clicks outside all floating ideas while one is selected THEN the Cauldron page SHALL deselect the currently selected idea
2. WHEN a selected idea is deselected THEN the FloatingIdea component SHALL collapse back to its truncated text display
3. WHEN a selected idea is deselected THEN the FloatingIdea component SHALL resume its expiration timer from the paused time

### Requirement 3

**User Story:** As a user, I want clear visual feedback when an idea is selected, so that I can easily identify which idea I am focusing on.

#### Acceptance Criteria

1. WHEN a floating idea is in the selected state THEN the FloatingIdea component SHALL display a highlighted border color matching the app's coral theme
2. WHEN a floating idea is in the selected state THEN the FloatingIdea component SHALL display an elevated shadow to indicate focus
3. WHEN a floating idea is in the selected state THEN the FloatingIdea component SHALL display at a higher z-index than other floating ideas
