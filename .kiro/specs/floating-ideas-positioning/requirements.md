# Requirements Document

## Introduction

This feature improves the floating ideas on the cauldron page by ensuring they don't obscure important page elements (text blocks, input fields, cauldron) and making them freely movable/repositionable by the user anywhere on the page.

## Glossary

- **Floating Idea**: A draggable card displaying saved or spark-generated ideas that appears around the cauldron
- **Cauldron**: The central mixing pot where users drop ideas to combine them
- **Safe Zone**: Areas of the page where floating ideas should not be initially positioned (cauldron area, input fields, navigation)
- **Drag-to-Reposition**: The ability to click and drag a floating idea to move it to a new location on the page

## Requirements

### Requirement 1

**User Story:** As a user, I want floating ideas to be positioned away from important page elements, so that I can read and interact with the page without obstruction.

#### Acceptance Criteria

1. WHEN a floating idea is initially positioned THEN the system SHALL place it outside the cauldron safe zone (350px radius from center)
2. WHEN a floating idea is initially positioned THEN the system SHALL place it outside the input field area at the bottom of the page
3. WHEN a floating idea is initially positioned THEN the system SHALL place it outside the navigation area at the top of the page
4. WHEN multiple floating ideas are positioned THEN the system SHALL maintain minimum 40px spacing between cards to prevent overlap

### Requirement 2

**User Story:** As a user, I want to freely move floating ideas around the page, so that I can organize them in a way that works for me.

#### Acceptance Criteria

1. WHEN a user clicks and drags a floating idea THEN the system SHALL move the card to follow the cursor position
2. WHEN a user releases a dragged floating idea THEN the system SHALL keep the card at the new position
3. WHEN a user drags a floating idea THEN the system SHALL pause the drift animation during the drag
4. WHEN a user releases a dragged floating idea THEN the system SHALL persist the new position until the card is removed or page is refreshed
5. WHEN a user drags a floating idea to the cauldron THEN the system SHALL add the idea as an ingredient (existing behavior preserved)

### Requirement 3

**User Story:** As a user, I want visual feedback when interacting with floating ideas, so that I understand what actions are available.

#### Acceptance Criteria

1. WHEN a user hovers over a floating idea THEN the system SHALL display a grab cursor to indicate draggability
2. WHEN a user is actively dragging a floating idea THEN the system SHALL display a grabbing cursor
3. WHEN a user is actively dragging a floating idea THEN the system SHALL elevate the card's z-index above other cards
4. WHEN a user is actively dragging a floating idea THEN the system SHALL apply a subtle scale and shadow effect to indicate lift
