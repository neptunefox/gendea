# Implementation Plan

- [x] 1. Set up LangChain service layer and structured output infrastructure
  - Create LangChain service module with model configuration for OpenRouter and Ollama
  - Define Zod schemas for all AI outputs (Spark, Cauldron, Canvas)
  - Implement structured output parser integration
  - Add error handling and retry logic for schema validation failures
  - Ensure compatibility with existing LLM provider configuration (OpenRouter/Ollama)
  - _Requirements: 1.1, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4_

- [x] 2. Rewrite AI prompts for LangChain structured outputs
  - Rewrite Spark generation prompt with explicit JSON schema definitions
  - Rewrite Cauldron mixing prompt with synthesis pattern instructions
  - Create Canvas AI action prompts (Expand, Tidy Up, Suggest)
  - Create Proactive Agent prompts with decision criteria
  - Add context history formatting utilities
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 19.1, 19.2, 19.3, 19.4_

- [x] 3. Migrate Spark page to use LangChain service
  - Replace existing LLM calls with LangChain service
  - Update API endpoint to use structured output parsers
  - Implement multi-select for ideas with Branch/Reply actions
  - Add persistent Collection Tray sidebar component
  - Update saved ideas display with status indicators
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Enhance Cauldron page visual feedback
  - Implement magnetic attraction effect for floating ideas
  - Add splash and color shift animation on drop
  - Create brewing animation with particle effects
  - Design Potion/Crystal output styling
  - Implement Bottling animation for saved outputs
  - Mark Cauldron outputs in collection with special indicator
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Migrate Cauldron page to use LangChain service
  - Replace existing mixing logic with LangChain service
  - Update API endpoint to use structured output parser
  - Ensure output conforms to defined schema
  - _Requirements: 1.3, 2.1_

- [x] 6. Install and configure Vue Flow
  - Add @vue-flow/core dependency
  - Add @vue-flow/background dependency
  - Add @vue-flow/controls dependency
  - Create base Canvas page component with Vue Flow
  - Configure infinite canvas with zoom and pan
  - _Requirements: 5.1, 5.2_

- [x] 7. Create Canvas database schema
  - Add canvas_nodes table (id, project_id, type, position, data, created_at, updated_at)
  - Add canvas_edges table (id, project_id, source_id, target_id, type, label, style, created_at)
  - Add canvas_state table (id, project_id, viewport_x, viewport_y, zoom, updated_at)
  - Add migration script
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 8. Implement Canvas-Project relationship
  - Create Canvas instance when idea status changes to "building"
  - Add Canvas route with project ID parameter
  - Create API endpoints for Canvas CRUD operations
  - Implement Canvas state persistence
  - _Requirements: 6.1, 14.1, 14.2, 14.3_

- [x] 9. Create custom Canvas node types
  - Implement Sticky Note node component
  - Implement Shape node component (rectangle, circle, arrow)
  - Implement Text Block node component
  - Implement Input Node component with question styling
  - Implement Tool Node component with resource link
  - Implement Task Node component with checkbox
  - Implement Idea Node component with lightbulb icon
  - Implement Goal Node component with target icon
  - Register all custom node types with Vue Flow
  - _Requirements: 5.3, 7.1, 7.2, 7.3, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 10. Implement Canvas edge types
  - Create custom edge component with relationship types
  - Implement edge styling for "leads to", "requires", "blocks", "relates to"
  - Add edge label display on hover
  - Add edge editing functionality
  - Register custom edge types with Vue Flow
  - _Requirements: 7.4, 12.1, 12.2, 12.3, 12.4_

- [x] 11. Implement Canvas grouping functionality
  - Add multi-select for nodes
  - Create Section/Frame container component
  - Implement group movement (all nodes move together)
  - Add visual container styling
  - _Requirements: 5.4, 7.5_

- [x] 12. Implement drag-and-drop for Canvas
  - Set up Vue Flow DnD preset
  - Create node palette component
  - Implement drag preview
  - Handle drop on Canvas to create node
  - Handle drop outside Canvas to cancel
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 13. Implement Saved Ideas import to Canvas
  - Add drag handler for Saved Ideas
  - Create Canvas node from Saved Idea on drop
  - Apply special styling for Bottled Potion nodes
  - Implement collision avoidance for new nodes
  - Add grid/cluster layout for multiple imports
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 16.5_

- [x] 14. Create Canvas AI service integration
  - Create Canvas-specific LangChain chains
  - Implement "Expand" action (generate 3-5 connected nodes)
  - Implement "Tidy Up" action (organize nodes into clusters/flows)
  - Implement connection label suggestion
  - Add Proactive Agent for vague idea detection
  - Add Tool Node generation for identified needs
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 1.4_

- [x] 15. Implement Canvas-Coach view toggle
  - Add toggle button in Coach view to switch to Canvas
  - Add toggle button in Canvas view to switch to Coach
  - Preserve project context during toggle
  - Implement bidirectional sync (Coach ↔ Canvas)
  - Add 2-second update propagation
  - Save last active view preference
  - _Requirements: 6.2, 6.3, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 16. Implement Coach-to-Canvas data sync
  - Create Canvas node when Test/Goal is defined in Coach
  - Update Canvas nodes when Coach data changes
  - Add visual indicators for Coach-originated nodes
  - _Requirements: 6.4_

- [x] 17. Implement Canvas-to-Coach data sync
  - Reflect Canvas plan structure in Coach progress view
  - Update Coach when Canvas tasks are completed
  - Sync workflow state changes from Canvas actions
  - _Requirements: 6.5, 18.4_

- [x] 18. Implement Canvas animations
  - Add 60fps drag animation for nodes
  - Add edge drawing animation from source to target
  - Add fade-out animation for node deletion
  - Add container appearance animation for grouping
  - Add stagger effect for AI-generated nodes
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 19. Implement Canvas viewport persistence
  - Save viewport position on pan
  - Save zoom level on zoom
  - Restore viewport state on Canvas load
  - _Requirements: 14.4, 5.2_

- [x] 20. Implement Canvas contextual AI suggestions
  - Detect incomplete node information
  - Suggest follow-up questions for incomplete nodes
  - Detect unrelated node connections
  - Suggest intermediate steps for unrelated connections
  - Detect disconnected node clusters
  - Suggest grouping/organizing actions
  - Add AI action buttons to node selection (Expand, Suggest Tools, Add Context)
  - Implement suggestion dismissal tracking
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 21. Integrate Canvas with workflow state machine
  - Display test-related nodes prominently in "Testing" state
  - Highlight incomplete/blocked nodes in "Stalled" state
  - Show progress indicators on completed nodes in "Reviewing" state
  - Update workflow state when Canvas conditions are met
  - Add 2-second visual indicator updates on state changes
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 22. Implement application flow guidance
  - Add suggestion to move to Cauldron after Spark session
  - Add suggestion to start building after Cauldron mix
  - Add guidance to set up Canvas and Coach when building starts
  - Add suggestion to check Coach progress from Canvas
  - Add suggestion to plan next steps in Canvas from Coach
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 23. Implement Canvas idea update sync
  - Listen for Saved Idea updates
  - Update corresponding Canvas nodes when ideas change
  - Handle idea deletion (remove or mark Canvas nodes)
  - _Requirements: 9.5_

- [x] 24. Implement Canvas multi-user conflict prevention
  - Add optimistic locking for Canvas state updates
  - Detect concurrent edits
  - Show conflict resolution UI when needed
  - _Requirements: 14.5_

- [ ] 25. Add Canvas AI edge suggestions
  - Implement AI suggestion for edge relationship types
  - Display suggested relationship when connecting nodes
  - Allow user to accept or modify suggestion
  - _Requirements: 12.5_

- [ ] 26. Polish Canvas UX
  - Ensure all interactions feel snappy (60fps)
  - Add smooth transitions between all states
  - Implement keyboard shortcuts for common actions
  - Add undo/redo functionality
  - Optimize responsiveness for various screen sizes
