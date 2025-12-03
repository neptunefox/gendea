# Requirements Document

## Introduction

This feature enhances the 3D cauldron experience by displaying brewing ingredient cards inside the cauldron and showing real-time LLM inference progress as streaming text above the ingredients. When ideas are thrown into the cauldron, they appear as floating cards within the cauldron's liquid. During mixing, the LLM-generated text streams word-by-word above the brewing cards, creating a visual sense of synthesis and progress.

## Glossary

- **Brewing_Card**: A visual representation of an ingredient/idea displayed inside the 3D cauldron after being added
- **Cauldron_Display**: The system responsible for rendering brewing cards and streaming text within the 3D cauldron scene
- **Streaming_Text**: Real-time display of LLM-generated tokens appearing word-by-word above the brewing cards
- **Ingredient**: An idea or text fragment added to the cauldron for synthesis

## Requirements

### Requirement 1

**User Story:** As a user, I want to see my added ideas displayed as cards inside the cauldron, so that I can visualize what ingredients are being mixed.

#### Acceptance Criteria

1. WHEN an ingredient is added to the cauldron THEN the Cauldron_Display SHALL render a Brewing_Card inside the cauldron within 500ms
2. WHEN multiple ingredients exist THEN the Cauldron_Display SHALL position Brewing_Cards in a non-overlapping arrangement within the cauldron bounds
3. WHEN a Brewing_Card is displayed THEN the Cauldron_Display SHALL show truncated text content (max 50 characters) with ellipsis for longer content
4. WHEN the cauldron is reset THEN the Cauldron_Display SHALL remove all Brewing_Cards with a fade-out animation

### Requirement 2

**User Story:** As a user, I want to see the LLM output streaming in real-time above the brewing cards, so that I can feel the synthesis progress happening.

#### Acceptance Criteria

1. WHEN mixing begins THEN the Cauldron_Display SHALL display Streaming_Text above the Brewing_Cards
2. WHEN a token is received from the LLM stream THEN the Cauldron_Display SHALL append the token to the visible Streaming_Text immediately
3. WHEN Streaming_Text is displayed THEN the Cauldron_Display SHALL animate each word with a fade-in effect
4. WHEN mixing completes THEN the Cauldron_Display SHALL fade out the Streaming_Text within 800ms

### Requirement 3

**User Story:** As a user, I want the brewing cards to have subtle animations, so that the cauldron feels alive and magical.

#### Acceptance Criteria

1. WHILE ingredients are brewing THEN the Cauldron_Display SHALL animate Brewing_Cards with a gentle bobbing motion
2. WHILE mixing is in progress THEN the Cauldron_Display SHALL increase the animation intensity of Brewing_Cards
3. WHEN reduced motion is preferred THEN the Cauldron_Display SHALL disable all Brewing_Card animations

### Requirement 4

**User Story:** As a user, I want the streaming text to be readable against the cauldron's glowing liquid, so that I can follow the synthesis.

#### Acceptance Criteria

1. WHEN Streaming_Text is displayed THEN the Cauldron_Display SHALL render text with a glow effect matching the cauldron theme (cyan/green)
2. WHEN Streaming_Text is displayed THEN the Cauldron_Display SHALL use a font size of at least 14px for readability
3. WHEN Streaming_Text exceeds the display area THEN the Cauldron_Display SHALL scroll or wrap text to remain visible
