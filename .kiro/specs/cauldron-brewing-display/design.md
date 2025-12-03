# Design Document: Cauldron Brewing Display

## Overview

This feature adds visual feedback inside the 3D cauldron by displaying brewing cards for added ingredients and streaming LLM-generated text during the mixing process. The implementation integrates with the existing TresJS-based CauldronScene component and the SSE-based mix-stream API.

## Architecture

The feature follows a reactive data flow pattern:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  cauldron.vue   │────▶│  CauldronScene   │────▶│  BrewingCardsLayer  │
│  (page state)   │     │  (3D container)  │     │  (HTML overlay)     │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
        │                                                   │
        │ ingredients[]                                     │
        │ streamingText                                     ▼
        │ isMixing                              ┌─────────────────────┐
        └──────────────────────────────────────▶│  StreamingText      │
                                                │  (word animation)   │
                                                └─────────────────────┘
```

The brewing cards are rendered as an HTML overlay positioned over the 3D cauldron, using CSS transforms to create depth. This approach avoids complex 3D text rendering while maintaining visual integration.

## Components and Interfaces

### BrewingCardsLayer Component

```typescript
interface BrewingCardsLayerProps {
  ingredients: CauldronIngredient[]
  isMixing: boolean
  streamingText: string
}

interface BrewingCardPosition {
  x: number      // percentage from center (-50 to 50)
  y: number      // percentage from top (0 to 100)
  rotation: number
  scale: number
}
```

### StreamingTextDisplay Component

```typescript
interface StreamingTextProps {
  text: string
  isActive: boolean
}
```

### Card Layout Algorithm

Cards are positioned in a circular/elliptical arrangement within the cauldron bounds:

```typescript
function calculateCardPositions(count: number): BrewingCardPosition[] {
  const positions: BrewingCardPosition[] = []
  const angleStep = (2 * Math.PI) / Math.max(count, 1)
  const radiusX = 35  // percentage
  const radiusY = 20  // percentage (elliptical for perspective)
  
  for (let i = 0; i < count; i++) {
    const angle = angleStep * i - Math.PI / 2
    positions.push({
      x: Math.cos(angle) * radiusX,
      y: 50 + Math.sin(angle) * radiusY,
      rotation: (Math.random() - 0.5) * 10,
      scale: 0.9 + Math.random() * 0.2
    })
  }
  return positions
}
```

## Data Models

### Extended Streaming State

```typescript
interface CauldronStreamState {
  isStreaming: boolean
  currentText: string
  words: string[]
  visibleWordCount: number
}
```

### Brewing Card Display Model

```typescript
interface BrewingCardDisplay {
  id: string
  content: string
  displayText: string  // truncated version
  position: BrewingCardPosition
  isNew: boolean       // for entrance animation
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Ingredient-to-card mapping consistency
*For any* list of ingredients, the number of rendered brewing cards SHALL equal the number of ingredients in the list.
**Validates: Requirements 1.1**

### Property 2: Card positions are non-overlapping
*For any* set of N brewing cards where N > 1, no two cards SHALL have overlapping bounding boxes when positioned using the layout algorithm.
**Validates: Requirements 1.2**

### Property 3: Text truncation correctness
*For any* string content, if the string length exceeds 50 characters, the displayed text SHALL be exactly 47 characters followed by "...".
**Validates: Requirements 1.3**

### Property 4: Reset clears all cards
*For any* cauldron state with N > 0 ingredients, after reset the brewing cards list SHALL be empty.
**Validates: Requirements 1.4**

### Property 5: Token accumulation integrity
*For any* sequence of tokens [t1, t2, ..., tn] received from the stream, the displayed streaming text SHALL equal the concatenation t1 + t2 + ... + tn.
**Validates: Requirements 2.2**

### Property 6: Long text wrapping
*For any* streaming text that exceeds the container width, the text SHALL wrap to multiple lines rather than overflow horizontally.
**Validates: Requirements 4.3**

## Error Handling

| Error Condition | Handling Strategy |
|-----------------|-------------------|
| Stream connection fails | Hide streaming text, show toast error |
| Invalid ingredient data | Skip rendering that card, log warning |
| Layout calculation overflow | Cap at maximum 6 visible cards |

## Testing Strategy

### Unit Tests
- Test `truncateText()` function with various string lengths
- Test `calculateCardPositions()` returns correct number of positions
- Test streaming text state management

### Property-Based Tests
Using fast-check library:

1. **Property 1**: Generate random ingredient arrays, verify card count matches
2. **Property 2**: Generate 2-6 cards, verify no bounding box overlaps
3. **Property 3**: Generate random strings 0-200 chars, verify truncation rules
4. **Property 4**: Generate state with ingredients, call reset, verify empty
5. **Property 5**: Generate random token sequences, verify concatenation
6. **Property 6**: Generate long strings, verify no horizontal overflow in rendered output

Each property test will run 100 iterations minimum and be tagged with the format:
`**Feature: cauldron-brewing-display, Property {number}: {property_text}**`
