# Design Document: Oracle Feature

## Overview

This design covers the implementation of the Oracle feature and the removal of Canvas and Coach features from Gendea. The Oracle is a Socratic dialogue interface that helps users explore their thinking through reframing questions rather than providing answers.

The Oracle creates a contemplative, dark-themed conversational experience that stands apart from the rest of the app. Users can access it directly, from saved ideas, or from Cauldron output. Each Oracle question can be "sparked" to explore it through divergent ideation.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
├─────────────────────────────────────────────────────────────────┤
│  pages/oracle.vue          - Main Oracle conversation page       │
│  components/OracleChat.vue - Chat interface component            │
│  components/OracleMessage.vue - Individual message component     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  /api/oracle/session.post.ts    - Create new session             │
│  /api/oracle/session/[id].get.ts - Get session with messages     │
│  /api/oracle/message.post.ts    - Send message, get response     │
│  /api/oracle/message-stream.post.ts - Streaming response         │
│  /api/oracle/spark.post.ts      - Mark message as sparked        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  server/utils/oracle-service.ts - Oracle prompt & response logic │
│  server/utils/langchain-service.ts - Existing LLM integration    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  oracle_sessions - Conversation sessions                         │
│  oracle_messages - Individual messages                           │
└─────────────────────────────────────────────────────────────────┘
```

### Removal Scope

Files and directories to delete:

- `pages/canvas/[id].vue`
- `pages/coach/index.vue`
- `pages/coach/[id].vue`
- `components/canvas/*` (entire directory)
- `components/coach/*` (entire directory)
- `components/FlowGuidanceBanner.vue`
- `composables/useCanvas.ts`
- `composables/useCanvasAnimations.ts`
- `composables/useCanvasHistory.ts`
- `composables/useBranchContext.ts`
- `composables/useFlowGuidance.ts`
- `composables/useDragAndDrop.ts`
- `server/api/canvas/*` (entire directory)
- `server/api/coach.post.ts`
- `server/api/coach-stream.post.ts`
- `server/api/tests.post.ts`
- `server/api/plans.post.ts`
- `server/api/plans.put.ts`
- `server/api/progress-log.post.ts`
- `server/api/north-star/*` (entire directory)
- `server/api/ladder-steps/*` (entire directory)
- `server/api/ladder-steps.post.ts`
- `server/api/workflow/*` (entire directory)
- `types/canvas.ts`
- `types/workflow.ts`
- `lib/workflow-machine.ts`
- `lib/workflow-service.ts`

## Components and Interfaces

### Oracle Page (`pages/oracle.vue`)

The main Oracle page handles:

- Session creation on mount (or loading existing session from query param)
- Message display with proper alignment (user left, oracle right)
- Input handling at bottom of viewport
- Dark theme styling

Query parameters:

- `idea` - Optional saved idea ID to start conversation with context

### OracleChat Component

Props:

```typescript
interface OracleChatProps {
  sessionId: string
  initialIdeaText?: string
}
```

Emits:

```typescript
interface OracleChatEmits {
  (e: 'spark', question: string): void
}
```

### OracleMessage Component

Props:

```typescript
interface OracleMessageProps {
  role: 'user' | 'oracle'
  content: string
  sparkedAt?: string | null
  onSpark?: () => void
}
```

### API Interfaces

```typescript
// POST /api/oracle/session
interface CreateSessionRequest {
  ideaId?: string
}

interface CreateSessionResponse {
  sessionId: string
  initialMessage?: string
}

// POST /api/oracle/message
interface SendMessageRequest {
  sessionId: string
  message: string
}

interface SendMessageResponse {
  question: string
  messageId: string
}

// GET /api/oracle/session/:id
interface GetSessionResponse {
  session: {
    id: string
    ideaId?: string
    createdAt: string
  }
  messages: Array<{
    id: string
    role: 'user' | 'oracle'
    content: string
    createdAt: string
    sparkedAt?: string
  }>
  ideaText?: string
}

// POST /api/oracle/spark
interface SparkMessageRequest {
  messageId: string
}
```

## Data Models

### Database Schema

```typescript
// db/schema.ts additions

export const oracleSessions = pgTable('oracle_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitorId: text('visitor_id').notNull(),
  ideaId: uuid('idea_id').references(() => savedIdeas.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const oracleMessages = pgTable('oracle_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => oracleSessions.id),
  role: text('role', { enum: ['user', 'oracle'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  sparkedAt: timestamp('sparked_at')
})
```

### TypeScript Types

```typescript
// types/oracle.ts

export interface OracleSession {
  id: string
  visitorId: string
  ideaId?: string
  createdAt: Date
  updatedAt: Date
}

export interface OracleMessage {
  id: string
  sessionId: string
  role: 'user' | 'oracle'
  content: string
  createdAt: Date
  sparkedAt?: Date
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Session creation persists required fields

_For any_ Oracle session creation request (with or without an idea ID), the persisted session SHALL contain a valid UUID, visitor ID, timestamps, and if an idea ID was provided, that idea reference.

**Validates: Requirements 2.2, 2.4, 2.5**

### Property 2: Oracle responses contain only questions

_For any_ user message sent to the Oracle, the response SHALL contain exactly one or two sentences, and each sentence SHALL end with a question mark.

**Validates: Requirements 3.1, 3.2**

### Property 3: Message persistence includes all required fields

_For any_ message (user or oracle) added to a conversation, the persisted message SHALL contain a valid UUID, session reference, role, content, and creation timestamp.

**Validates: Requirements 3.4**

### Property 4: Oracle questions are non-empty and self-contained

_For any_ Oracle response, each question SHALL be at least 10 characters long and SHALL not reference external context that would make it unusable as a standalone Spark prompt.

**Validates: Requirements 4.4**

### Property 5: Spark action records timestamp

_For any_ Oracle message that is sparked, the sparked_at timestamp SHALL be set to a non-null value after the spark action completes.

**Validates: Requirements 5.3**

### Property 6: Message role is constrained to valid values

_For any_ Oracle message in the database, the role field SHALL be either "user" or "oracle" and no other value.

**Validates: Requirements 10.3**

## Error Handling

### API Error Responses

All Oracle API endpoints return consistent error responses:

```typescript
interface ErrorResponse {
  statusCode: number
  statusMessage: string
}
```

Error scenarios:

- 400: Invalid request body (missing sessionId, empty message)
- 404: Session not found
- 500: LLM service failure (with fallback behavior)

### LLM Fallback Behavior

If the LangChain service fails to generate a response, the Oracle service returns a fallback question:

```typescript
const FALLBACK_QUESTIONS = [
  'What would change if you approached this from the opposite direction?',
  "What's the smallest version of this that would still matter to you?",
  'Who else has faced something similar, and what did they try?'
]
```

### Session Recovery

If a session ID in the URL is invalid or expired:

1. Display a brief message: "Starting a fresh conversation"
2. Create a new session automatically
3. Continue without disruption

## Testing Strategy

### Property-Based Testing

The project will use **fast-check** for property-based testing in TypeScript/JavaScript.

Each property-based test MUST:

- Run a minimum of 100 iterations
- Be tagged with a comment referencing the correctness property: `**Feature: oracle-feature, Property {number}: {property_text}**`
- Test the property across randomly generated valid inputs

### Unit Tests

Unit tests cover:

- Oracle service prompt construction
- API request/response validation
- Database operations (session and message CRUD)
- Navigation and routing behavior

### Test File Organization

```
tests/
  oracle/
    oracle-service.test.ts      - Service logic tests
    oracle-api.test.ts          - API endpoint tests
    oracle-properties.test.ts   - Property-based tests
```

## Oracle Service Implementation

### System Prompt

```typescript
const ORACLE_SYSTEM_PROMPT = `You are the Oracle - a Socratic guide who ONLY asks questions, never gives answers.

Your role is to help users reframe their thinking through thoughtful questions. You must:
- Respond with exactly 1-2 questions (never more)
- NEVER give advice, suggestions, or answers
- Ask questions that reframe the problem, not just clarify it
- Reference what the user has shared to show you're listening
- Keep questions concise and thought-provoking

Question types to vary between:
- Challenge assumptions: "What if X isn't actually the problem?"
- Flip perspective: "Who benefits from this staying the same?"
- Find deeper needs: "What would solving this actually give you?"
- Explore constraints: "What if this limitation is actually useful?"
- Get specific: "If you could only help one person with this, who?"

The user should leave the conversation with a new way of seeing their challenge, not a solution handed to them.`
```

### Response Schema

```typescript
import { z } from 'zod'

const OracleResponseSchema = z.object({
  questions: z.array(z.string().min(10)).min(1).max(2)
})
```

## Visual Design Specifications

### Color Palette (Dark Theme)

```css
--oracle-bg: #1c1917; /* Dark warm background */
--oracle-bg-elevated: #292524; /* Slightly lighter for cards */
--oracle-text: #fafaf9; /* Light cream text */
--oracle-text-secondary: #a8a29e; /* Muted text */
--oracle-accent: #d4756f; /* Coral accent for actions */
--oracle-user-bg: #292524; /* User message background */
--oracle-oracle-bg: #3f3a36; /* Oracle message background */
```

### Layout

- Messages container: `max-width: 640px`, centered
- Message spacing: `var(--space-6)` between messages
- Input container: Fixed to bottom, `padding: var(--space-4)`
- Message bubbles: `border-radius: var(--radius-lg)`, `padding: var(--space-4)`

### Animations

```css
@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-enter {
  animation: messageAppear var(--duration-normal) var(--ease-out);
}
```

## Navigation Updates

### Updated AppNav Structure

```vue
<template>
  <nav class="app-nav">
    <NuxtLink to="/" title="Spark">
      <Lightbulb :size="20" />
    </NuxtLink>
    <NuxtLink to="/oracle" title="Oracle">
      <HelpCircle :size="20" />
    </NuxtLink>
    <NuxtLink to="/cauldron" title="Cauldron">
      <FlaskConical :size="20" />
    </NuxtLink>
    <NuxtLink to="/history" title="History">
      <Clock :size="20" />
    </NuxtLink>
  </nav>
</template>
```

Icons from lucide-vue-next:

- Spark: `Lightbulb`
- Oracle: `HelpCircle`
- Cauldron: `FlaskConical`
- History: `Clock`
