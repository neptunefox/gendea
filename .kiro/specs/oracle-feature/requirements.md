# Requirements Document

## Introduction

This specification defines the Oracle feature for Gendea and the removal of Canvas and Coach features. Gendea is an idea generation app being simplified to focus on its core value: generating ideas.

**Features to keep:**
- **Spark**: Divergent ideation - generates multiple ideas from a prompt
- **Cauldron**: Convergent synthesis - mixes ideas into one focused concept
- **History**: Resume past exploration threads

**New feature:**
- **Oracle**: Socratic dialogue - a conversational interface that asks reframing questions, never gives answers

**Features to remove:**
- **Canvas**: Visual node-based planning
- **Coach**: Guided execution framework

The Oracle provides a contemplative, dark-themed conversational experience where users explore their thinking through questions rather than receiving answers.

## Glossary

- **Oracle**: A Socratic dialogue interface that responds only with reframing questions, never answers or suggestions
- **Oracle Session**: A conversation thread between a user and the Oracle
- **Oracle Message**: A single message in an Oracle session, either from the user or the Oracle
- **Reframing Question**: A question designed to help users see their challenge from a new perspective
- **Spark Action**: The ability to take an Oracle question and use it as a prompt in the Spark feature
- **Sparked Message**: An Oracle message that the user has sent to Spark for exploration
- **Saved Idea**: An idea that a user has saved from Spark or Cauldron output
- **Visitor**: An anonymous user identified by a unique visitor ID

## Requirements

### Requirement 1: Canvas and Coach Removal

**User Story:** As a product owner, I want to remove Canvas and Coach features, so that the app focuses on its core idea generation value.

#### Acceptance Criteria

1. THE System SHALL NOT provide canvas functionality for visual node-based planning
2. THE System SHALL NOT provide coach functionality for guided execution
3. WHEN a user navigates to a removed route THEN THE System SHALL redirect to the home page
4. THE System SHALL NOT display Canvas or Coach links in the navigation
5. THE System SHALL NOT include "Start building" or "Continue building" actions on saved idea cards

### Requirement 2: Oracle Session Management

**User Story:** As a user, I want to start Oracle conversations, so that I can explore my thinking through Socratic dialogue.

#### Acceptance Criteria

1. WHEN a user navigates to the Oracle page THEN THE System SHALL create a new Oracle session
2. WHEN a user clicks "Ask Oracle" on a saved idea THEN THE System SHALL create a new Oracle session with that idea as context
3. WHEN a user clicks "Ask Oracle" on Cauldron output THEN THE System SHALL save the idea and create a new Oracle session with that idea as context
4. THE System SHALL persist Oracle sessions to the database with visitor ID, optional idea reference, and timestamps
5. WHEN an Oracle session has an associated idea THEN THE System SHALL display the idea text as conversation context

### Requirement 3: Oracle Conversation Flow

**User Story:** As a user, I want to have a dialogue with the Oracle, so that I can gain new perspectives on my challenges.

#### Acceptance Criteria

1. WHEN a user sends a message THEN THE System SHALL respond with one to two reframing questions
2. THE Oracle SHALL respond only with questions and SHALL NOT provide answers, suggestions, or advice
3. WHEN generating a response THEN THE Oracle SHALL reference previous messages in the conversation to maintain context
4. THE System SHALL persist all messages in the conversation with role, content, and timestamp
5. WHEN displaying the conversation THEN THE System SHALL show user messages aligned left and Oracle questions aligned right

### Requirement 4: Oracle Question Quality

**User Story:** As a user, I want Oracle questions to help me think differently, so that I can discover new angles on my challenges.

#### Acceptance Criteria

1. THE Oracle SHALL ask questions that reframe the problem rather than just clarify it
2. THE Oracle SHALL vary question types including assumption challenges, perspective flips, deeper need exploration, constraint exploration, and specificity prompts
3. THE Oracle SHALL maintain a warm but not sycophantic tone without excessive praise
4. WHEN generating questions THEN THE Oracle SHALL ensure each question works as a standalone Spark prompt

### Requirement 5: Spark Integration from Oracle

**User Story:** As a user, I want to spark Oracle questions, so that I can explore interesting questions through divergent ideation.

#### Acceptance Criteria

1. WHEN an Oracle question is displayed THEN THE System SHALL show a "Spark" action button
2. WHEN a user clicks "Spark" on an Oracle question THEN THE System SHALL navigate to Spark with that question as the prompt
3. WHEN a user sparks a question THEN THE System SHALL record the sparked timestamp on that message
4. THE System SHALL display the Spark action in proximity to each Oracle question

### Requirement 6: Oracle Visual Design

**User Story:** As a user, I want the Oracle to feel contemplative and distinct, so that I enter a different mode of thinking.

#### Acceptance Criteria

1. THE Oracle page SHALL use a dark, inverted color scheme with dark warm background and light text
2. THE System SHALL display generous whitespace between messages to let questions breathe
3. THE System SHALL use subtle animations when messages appear with fade and vertical translation
4. THE System SHALL position the input field at the bottom of the viewport in a fixed position
5. WHEN a user hovers over interactive elements THEN THE System SHALL apply a maximum two pixel lift effect

### Requirement 7: Spark Page Simplification

**User Story:** As a user, I want a simplified Spark experience, so that I can focus on ideas without building-related distractions.

#### Acceptance Criteria

1. THE System SHALL NOT display Cauldron badge or sparkle icons on pinned idea cards
2. THE System SHALL display an "Ask Oracle" action on saved idea cards
3. THE System SHALL NOT display test commitment or test result fields on idea cards
4. THE System SHALL NOT display north star fields in the idea card UI

### Requirement 8: Cauldron Oracle Integration

**User Story:** As a user, I want to ask the Oracle about synthesized ideas, so that I can explore what to do with my synthesis.

#### Acceptance Criteria

1. WHEN the Cauldron displays synthesized output THEN THE System SHALL show an "Ask Oracle" button
2. WHEN a user clicks "Ask Oracle" on Cauldron output THEN THE System SHALL save the synthesized idea
3. WHEN a user clicks "Ask Oracle" on Cauldron output THEN THE System SHALL navigate to Oracle with the saved idea as context

### Requirement 9: Navigation Updates

**User Story:** As a user, I want clear navigation to all available features, so that I can easily access Spark, Oracle, Cauldron, and History.

#### Acceptance Criteria

1. THE navigation SHALL display in order: Spark, Oracle, Cauldron, History
2. THE navigation SHALL use a lightbulb icon for Spark
3. THE navigation SHALL use a help circle icon for Oracle
4. THE navigation SHALL use a flame or sparkles icon for Cauldron
5. THE navigation SHALL use a clock icon for History
6. THE navigation SHALL NOT include Canvas or Coach links

### Requirement 10: Database Schema for Oracle

**User Story:** As a developer, I want proper database schema for Oracle, so that conversations persist reliably.

#### Acceptance Criteria

1. THE oracle_sessions table SHALL store id, visitor_id, idea_id, created_at, and updated_at fields
2. THE oracle_messages table SHALL store id, session_id, role, content, created_at, and sparked_at fields
3. THE oracle_messages role field SHALL accept only "user" or "oracle" values
4. THE oracle_sessions idea_id field SHALL reference the saved_ideas table and allow null values
