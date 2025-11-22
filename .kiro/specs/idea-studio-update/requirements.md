# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive update to the "Idea Studio" application. The update transforms the application into a cohesive creative workspace by integrating LangChain for AI interactions, refactoring existing pages (Spark and Cauldron), and introducing a new Canvas page powered by Vue Flow. The Canvas provides a visual planning interface that integrates seamlessly with the Coach (Build) page, creating a unified project execution environment.

## Glossary

- **Idea Studio**: The complete application for creative ideation, synthesis, and project execution
- **Spark Page**: The divergent thinking interface where users generate and explore multiple ideas
- **Cauldron Page**: The convergent synthesis interface where users combine ideas into refined concepts
- **Canvas Page**: The new visual planning interface using Vue Flow for mind mapping and workflow design
- **Coach Page**: The existing project tracking interface with metrics, accountability, and deadlines
- **Active Project**: A project in "building" status that has both Coach and Canvas views
- **LangChain Service**: The standardized AI interaction layer using LangChain.js
- **Structured Output**: JSON responses from AI that conform to predefined schemas using Zod
- **Proactive Agent**: An AI that autonomously asks clarifying questions or suggests next steps
- **Node**: A visual element on the Canvas representing an idea, task, tool, or concept
- **Edge**: A connection between nodes on the Canvas
- **Input Node**: A special node type that requests user input or clarification
- **Tool Node**: A node representing a suggested tool or resource
- **Saved Idea**: An idea stored in the user's collection, available across pages
- **Bottled Potion**: A Cauldron output that has been saved to the collection

## Requirements

### Requirement 1

**User Story:** As a developer, I want all AI interactions to use LangChain with structured outputs, so that responses are reliable and predictable.

#### Acceptance Criteria

1. WHEN the system generates AI responses THEN the LangChain Service SHALL produce strictly structured JSON conforming to predefined Zod schemas
2. WHEN a Spark generation is requested THEN the system SHALL use a LangChain chain with a structured output parser for core ideas, lenses, and nudges
3. WHEN a Cauldron mix is requested THEN the system SHALL use a LangChain chain with a structured output parser for the synthesized concept
4. WHEN a Canvas AI action is triggered THEN the system SHALL use a LangChain chain with a structured output parser for node generation or organization
5. WHEN an AI response fails schema validation THEN the system SHALL retry with error feedback to the model
6. WHEN the LangChain Service is configured THEN the system SHALL support both OpenRouter and Ollama providers

### Requirement 2

**User Story:** As a developer, I want a standardized LangChain service layer, so that AI interactions are consistent across all features.

#### Acceptance Criteria

1. WHEN any feature requires AI generation THEN the system SHALL route the request through the LangChain Service
2. WHEN the LangChain Service is initialized THEN the system SHALL configure the appropriate model provider (OpenRouter or Ollama) and structured output parsers
3. WHEN a generation request is made THEN the LangChain Service SHALL accept a prompt, schema, and optional context history
4. WHEN the LangChain Service processes a request THEN the system SHALL return a validated object matching the provided schema
5. WHEN multiple AI operations are chained THEN the system SHALL use LangChain's RunnableSequence for composition

### Requirement 3

**User Story:** As a user, I want the Spark page to maintain its Studio aesthetic while using the new LangChain backend, so that I have a familiar but improved experience.

#### Acceptance Criteria

1. WHEN I visit the Spark page THEN the system SHALL display the feed-based journal with floating input dock
2. WHEN I generate ideas THEN the system SHALL use the LangChain Service to produce structured outputs for ideas, lenses, and nudges
3. WHEN I select multiple ideas THEN the system SHALL enable "Branch" and "Reply" actions for the selected set
4. WHEN I save an idea THEN the system SHALL add it to the persistent Collection Tray sidebar
5. WHEN I view the Collection Tray THEN the system SHALL display all saved ideas with their status indicators

### Requirement 4

**User Story:** As a user, I want improved visual feedback on the Cauldron page, so that the mixing process feels magical and delightful.

#### Acceptance Criteria

1. WHEN I drag an idea near the pot THEN the floating idea SHALL exhibit magnetic attraction toward the cursor
2. WHEN I drop an idea into the pot THEN the pot SHALL react with a visual splash and color shift animation
3. WHEN the Cauldron mixes ingredients THEN the system SHALL display a brewing animation with particle effects
4. WHEN the mix completes THEN the system SHALL present the output as a "Potion" or "Crystal" with special styling
5. WHEN I save the output THEN the system SHALL animate the "Bottling" action and mark it as a Cauldron output in the collection

### Requirement 5

**User Story:** As a user, I want a Canvas page for visual planning, so that I can organize my thoughts spatially and see connections between ideas.

#### Acceptance Criteria

1. WHEN I navigate to the Canvas page THEN the system SHALL display an infinite, zoomable whiteboard using Vue Flow
2. WHEN I pan or zoom the Canvas THEN the system SHALL provide smooth, responsive interactions
3. WHEN I create a node THEN the system SHALL support multiple node types including Sticky Notes, Shapes, Text Blocks, and Connectors
4. WHEN I select multiple nodes THEN the system SHALL enable grouping them into Sections or Frames
5. WHEN I drag a Saved Idea onto the Canvas THEN the system SHALL create a new node with the idea's content

### Requirement 6

**User Story:** As a user, I want each Active Project to have its own dedicated Canvas, so that I can visually plan alongside tracking progress in the Coach view.

#### Acceptance Criteria

1. WHEN I mark an idea as "Building" THEN the system SHALL create a dedicated Canvas instance for that project
2. WHEN I view an Active Project in Coach THEN the system SHALL provide a toggle to switch to the Canvas view
3. WHEN I view an Active Project in Canvas THEN the system SHALL provide a toggle to switch to the Coach view
4. WHEN I define a Test or Goal in Coach THEN the system SHALL create a corresponding node on the Canvas
5. WHEN I create a plan on the Canvas THEN the system SHALL reflect the plan structure in the Coach progress view

### Requirement 7

**User Story:** As a user, I want the Canvas to support rich whiteboard features, so that I can express complex ideas visually.

#### Acceptance Criteria

1. WHEN I add a Sticky Note THEN the system SHALL create a draggable, resizable note with customizable color
2. WHEN I add a Shape THEN the system SHALL support rectangles, circles, and arrows with customizable styling
3. WHEN I add a Text Block THEN the system SHALL provide inline editing with formatting options
4. WHEN I connect two nodes THEN the system SHALL create an Edge with customizable line style and label
5. WHEN I group nodes THEN the system SHALL create a visual container that moves all contained nodes together

### Requirement 8

**User Story:** As a user, I want AI assistance on the Canvas, so that I can get help organizing and expanding my ideas.

#### Acceptance Criteria

1. WHEN I drop a vague idea node THEN the Proactive Agent SHALL automatically spawn an Input Node asking clarifying questions
2. WHEN the Proactive Agent identifies a tool need THEN the system SHALL create a Tool Node with the suggested resource
3. WHEN I select a node and click "Expand" THEN the AI SHALL generate 3-5 related subtask or idea nodes connected to the original
4. WHEN I select messy nodes and click "Tidy Up" THEN the AI SHALL arrange them into logical clusters or linear flows
5. WHEN I connect two nodes THEN the AI SHALL suggest an appropriate label for the connection relationship

### Requirement 9

**User Story:** As a user, I want to import saved ideas into the Canvas, so that I can build on work from Spark and Cauldron.

#### Acceptance Criteria

1. WHEN I drag a Saved Idea from the collection THEN the system SHALL create a Canvas node with the idea's text
2. WHEN I drag a Bottled Potion from the collection THEN the system SHALL create a specially styled node indicating Cauldron origin
3. WHEN I import an idea with existing Canvas nodes THEN the system SHALL position the new node to avoid overlaps
4. WHEN I import multiple ideas THEN the system SHALL arrange them in a grid or cluster layout
5. WHEN an imported idea is updated in the collection THEN the Canvas node SHALL reflect the changes

### Requirement 10

**User Story:** As a developer, I want optimized prompts for LangChain structured outputs, so that the AI produces high-quality, schema-compliant responses.

#### Acceptance Criteria

1. WHEN a prompt is written for Spark generation THEN the prompt SHALL explicitly define the expected JSON schema and behavior
2. WHEN a prompt is written for Cauldron mixing THEN the prompt SHALL instruct the AI on synthesis patterns and output format
3. WHEN a prompt is written for Canvas AI actions THEN the prompt SHALL specify when to ask questions versus when to provide answers
4. WHEN a Proactive Agent prompt is used THEN the prompt SHALL define clear triggers for autonomous actions
5. WHEN a prompt includes context history THEN the system SHALL format the history for optimal LangChain processing

### Requirement 11

**User Story:** As a user, I want Canvas nodes to support custom types, so that different kinds of information are visually distinct.

#### Acceptance Criteria

1. WHEN I create an Input Node THEN the system SHALL display it with a question mark icon and input field styling
2. WHEN I create a Tool Node THEN the system SHALL display it with a tool icon and resource link
3. WHEN I create a Task Node THEN the system SHALL display it with a checkbox and completion status
4. WHEN I create an Idea Node THEN the system SHALL display it with a lightbulb icon and idea styling
5. WHEN I create a Goal Node THEN the system SHALL display it with a target icon and goal styling

### Requirement 12

**User Story:** As a user, I want Canvas edges to support different relationship types, so that connections between nodes are meaningful.

#### Acceptance Criteria

1. WHEN I create an edge THEN the system SHALL support relationship types including "leads to", "requires", "blocks", and "relates to"
2. WHEN I select an edge type THEN the system SHALL apply appropriate visual styling (color, line style, arrow type)
3. WHEN I hover over an edge THEN the system SHALL display the relationship label
4. WHEN I edit an edge THEN the system SHALL allow changing the relationship type and label
5. WHEN the AI suggests an edge THEN the system SHALL recommend the most appropriate relationship type

### Requirement 13

**User Story:** As a user, I want smooth transitions between Coach and Canvas views, so that I can seamlessly switch between tracking and planning modes.

#### Acceptance Criteria

1. WHEN I toggle from Coach to Canvas THEN the system SHALL preserve the current project context
2. WHEN I toggle from Canvas to Coach THEN the system SHALL preserve the current project context
3. WHEN I make changes in Coach THEN the Canvas SHALL reflect updates within 2 seconds
4. WHEN I make changes in Canvas THEN the Coach SHALL reflect updates within 2 seconds
5. WHEN I navigate away and return THEN the system SHALL restore the last active view (Coach or Canvas)

### Requirement 14

**User Story:** As a user, I want Canvas state to persist, so that my visual plans are saved automatically.

#### Acceptance Criteria

1. WHEN I add or modify nodes THEN the system SHALL save the Canvas state to the database
2. WHEN I add or modify edges THEN the system SHALL save the Canvas state to the database
3. WHEN I close and reopen a Canvas THEN the system SHALL restore all nodes, edges, and viewport position
4. WHEN I zoom or pan the Canvas THEN the system SHALL save the viewport state
5. WHEN multiple users access the same project THEN the system SHALL prevent conflicting edits through optimistic locking

### Requirement 15

**User Story:** As a user, I want the Canvas to feel snappy and fun, so that visual planning is an enjoyable experience.

#### Acceptance Criteria

1. WHEN I drag a node THEN the system SHALL provide smooth 60fps animation
2. WHEN I create a connection THEN the system SHALL animate the edge drawing from source to target
3. WHEN I delete a node THEN the system SHALL animate a fade-out and remove connected edges
4. WHEN I group nodes THEN the system SHALL animate the container appearing around the selection
5. WHEN the AI generates nodes THEN the system SHALL animate them appearing with a stagger effect

### Requirement 16

**User Story:** As a developer, I want to use Vue Flow's drag-and-drop features, so that users can easily add nodes to the Canvas.

#### Acceptance Criteria

1. WHEN I implement node creation THEN the system SHALL use Vue Flow's DnD preset for drag-and-drop
2. WHEN a user drags from a palette THEN the system SHALL show a preview of the node being dragged
3. WHEN a user drops on the Canvas THEN the system SHALL create the node at the drop position
4. WHEN a user drops outside the Canvas THEN the system SHALL cancel the operation
5. WHEN a user drags a Saved Idea THEN the system SHALL use the same DnD mechanism for consistency

### Requirement 17

**User Story:** As a user, I want contextual AI suggestions on the Canvas, so that I get help when I need it without being interrupted.

#### Acceptance Criteria

1. WHEN I create a node with incomplete information THEN the Proactive Agent SHALL suggest follow-up questions
2. WHEN I connect two unrelated nodes THEN the Proactive Agent SHALL suggest intermediate steps
3. WHEN I have many disconnected nodes THEN the Proactive Agent SHALL suggest grouping or organizing actions
4. WHEN I select a node THEN the system SHALL display AI action buttons (Expand, Suggest Tools, Add Context)
5. WHEN I dismiss an AI suggestion THEN the system SHALL not repeat the same suggestion for that context

### Requirement 18

**User Story:** As a user, I want the Canvas to integrate with the existing workflow state machine, so that project status is consistent across views.

#### Acceptance Criteria

1. WHEN a project enters "Testing" state THEN the Canvas SHALL display test-related nodes prominently
2. WHEN a project enters "Stalled" state THEN the Canvas SHALL highlight incomplete or blocked nodes
3. WHEN a project enters "Reviewing" state THEN the Canvas SHALL show progress indicators on completed nodes
4. WHEN I complete a Canvas task THEN the system SHALL update the workflow state if conditions are met
5. WHEN the workflow state changes THEN the Canvas SHALL update visual indicators within 2 seconds

### Requirement 19

**User Story:** As a developer, I want to rewrite existing system prompts for LangChain, so that they leverage structured output parsers effectively.

#### Acceptance Criteria

1. WHEN the Spark prompt is rewritten THEN the prompt SHALL define the exact JSON schema for ideas, lenses, and nudges
2. WHEN the Cauldron prompt is rewritten THEN the prompt SHALL define the exact JSON schema for synthesized output
3. WHEN the Canvas prompt is rewritten THEN the prompt SHALL define schemas for node generation, organization, and suggestions
4. WHEN a Proactive Agent prompt is written THEN the prompt SHALL specify decision criteria for autonomous actions
5. WHEN prompts are tested THEN the system SHALL achieve 95% schema compliance without retries

### Requirement 20

**User Story:** As a user, I want the application flow to guide me from divergence to convergence to execution, so that I have a clear creative process.

#### Acceptance Criteria

1. WHEN I complete a Spark session THEN the system SHALL suggest moving to Cauldron for synthesis
2. WHEN I complete a Cauldron mix THEN the system SHALL suggest starting to build with the output
3. WHEN I start building THEN the system SHALL guide me to set up the Canvas and Coach views
4. WHEN I work in Canvas THEN the system SHALL suggest when to check progress in Coach
5. WHEN I work in Coach THEN the system SHALL suggest when to plan next steps in Canvas
