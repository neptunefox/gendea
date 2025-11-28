# Design Document: Cauldron Idea Selection

## Overview

This feature adds single-click selection behavior to floating ideas on the Cauldron page. Selection pauses the expiration timer, expands the card to show full text, and provides visual feedback. Only one idea can be selected at a time, managed at the parent Cauldron page level.

## Architecture

The selection state is managed at the Cauldron page level (`pages/cauldron.vue`) with a single `selectedIdeaId` ref. This ensures only one idea can be selected at a time. The `FloatingIdea` component receives an `isSelected` prop and emits a `select` event when clicked.

```
┌─────────────────────────────────────────────────────┐
│                  cauldron.vue                        │
│  ┌─────────────────────────────────────────────┐    │
│  │  selectedIdeaId: string | null              │    │
│  │  handleIdeaSelect(id)                       │    │
│  │  handleBackgroundClick()                    │    │
│  └─────────────────────────────────────────────┘    │
│                        │                             │
│           ┌────────────┼────────────┐               │
│           ▼            ▼            ▼               │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│    │FloatingIdea│  │FloatingIdea│  │FloatingIdea│   │
│    │isSelected │  │isSelected │  │isSelected │      │
│    │@select    │  │@select    │  │@select    │      │
│    └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────┘
```

## Components and Interfaces

### FloatingIdea Component Changes

**New Props:**
- `isSelected: boolean` - Whether this idea is currently selected

**New Events:**
- `select: [idea: FloatingIdea]` - Emitted when the idea is clicked (not dragged)

**Behavior Changes:**
- Click (without drag) triggers selection
- When `isSelected` is true:
  - Timer pauses (stops decrementing)
  - Card expands (removes line-clamp)
  - Visual styling changes (border, shadow, z-index)
- When `isSelected` becomes false:
  - Timer resumes from paused value
  - Card collapses back to truncated view

### Cauldron Page Changes

**New State:**
- `selectedIdeaId: Ref<string | null>` - ID of currently selected idea

**New Methods:**
- `handleIdeaSelect(idea: FloatingIdea)` - Sets selectedIdeaId, deselects previous
- `handleBackgroundClick(event: MouseEvent)` - Deselects if clicking outside ideas

## Data Models

No database changes required. Selection is purely client-side UI state.

**Selection State:**
```typescript
interface SelectionState {
  selectedIdeaId: string | null
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing the prework:
- Properties 1.2 and 1.5/2.3 both relate to timer behavior with selection - these can be combined into a single timer pause/resume property
- Property 1.4 and the single-selection invariant are the same concept
- Properties 3.3 and z-index elevation can be combined with selection state testing

Consolidated properties:

**Property 1: Single Selection Invariant**
*For any* set of floating ideas on the Cauldron page, at most one idea can be in the selected state at any time
**Validates: Requirements 1.4**

**Property 2: Timer Pause on Selection**
*For any* floating idea, when the idea transitions to selected state, the timer value should remain constant (not decrement) while selected
**Validates: Requirements 1.2**

**Property 3: Timer Resume on Deselection**
*For any* floating idea that was selected and then deselected, the timer should resume from the exact value it had when paused (not reset)
**Validates: Requirements 1.5, 2.3**

**Property 4: Selection State Z-Index Elevation**
*For any* selected floating idea, its z-index should be greater than the z-index of all non-selected floating ideas
**Validates: Requirements 3.3**

## Error Handling

- If `selectedIdeaId` references an idea that no longer exists (expired/dissolved), reset to `null`
- Click events during drag operations should not trigger selection
- Rapid clicking should not cause race conditions in timer state

## Testing Strategy

### Property-Based Testing

Use `fast-check` for property-based testing in TypeScript/Vue.

**Configuration:**
- Minimum 100 iterations per property test
- Tests tagged with format: `**Feature: cauldron-idea-selection, Property {number}: {property_text}**`

**Properties to Test:**
1. Single selection invariant - generate random sequences of select operations, verify only one selected
2. Timer pause - generate random time values, verify no change while selected
3. Timer resume - generate random pause durations, verify exact resume value
4. Z-index elevation - generate random idea sets, verify selected has highest z-index

### Unit Tests

- Click handler correctly emits select event
- isSelected prop correctly applies CSS classes
- Background click handler correctly deselects
- Drag operations do not trigger selection
