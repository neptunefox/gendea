# Design Document

## Overview

This design document outlines the technical approach for enhancing Gendea's visual polish and micro-interactions. The implementation focuses on creating reusable animation components, a centralized sound system, and CSS-based visual effects that respect user accessibility preferences.

## Architecture

The feature is organized into several independent systems that can be composed together:

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layer                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Background   │  │ Animation    │  │ Sound        │      │
│  │ Runes        │  │ System       │  │ System       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Constellation│  │ Vignette     │  │ Toast        │      │
│  │ Lines        │  │ Overlay      │  │ Enhancements │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                    Composables Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ useSound     │  │ useParticles │  │ useReduced   │      │
│  │              │  │ (existing)   │  │ Motion       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Accessibility First**: All animations check `prefers-reduced-motion` and degrade gracefully
2. **Performance**: Use CSS animations over JavaScript where possible, leverage `will-change` sparingly
3. **Composability**: Each visual system is independent and can be enabled/disabled
4. **Sound is Optional**: Sound system is off by default, user must opt-in

## Components and Interfaces

### 1. BackgroundRunes Component

A full-screen overlay component that renders drifting mystical symbols.

```typescript
interface BackgroundRunesProps {
  variant: 'spark' | 'cauldron' | 'oracle'
  symbolCount?: number // default: 12
  opacity?: number // default: 0.02
}
```

**Symbol Sets:**

- Spark: `✦ ◇ ⟡ ✧ ⊛ ❋`
- Cauldron: `☿ ⚗ ∞ ◎ ⊕ ☽`
- Oracle: `★ ☆ ✶ ⊹ ◐ ☾`

**Animation Strategy:**

- Each symbol gets a random starting position and drift direction
- CSS `@keyframes` handles the drift animation (20-40s duration)
- When a symbol exits viewport, it's repositioned to the opposite edge via JS

### 2. ConstellationLines Component

SVG-based lines connecting idea cards in the grid.

```typescript
interface ConstellationLinesProps {
  cardRefs: Ref<HTMLElement[]>
  visible: boolean
  highlightedCardIndex?: number | null
}
```

**Line Calculation:**

- Uses `getBoundingClientRect()` to get card positions
- Connects each card to its nearest 1-2 neighbors
- Lines are drawn as SVG `<line>` elements with gradient strokes
- Updates on window resize via `ResizeObserver`

### 3. VignetteOverlay Component

A fixed-position overlay that adds colored gradients at screen edges.

```typescript
interface VignetteOverlayProps {
  color: 'amber' | 'purple' | 'teal'
}
```

**Implementation:**

- CSS `radial-gradient` positioned at corners
- Color transitions via CSS custom properties
- 300ms transition on color change

### 4. OraclePendulum Component

Replaces the bouncing dots thinking indicator with a pendulum animation.

```typescript
interface OraclePendulumProps {
  active: boolean
}
```

**Animation:**

- Single pendulum element with `transform-origin` at top
- CSS `@keyframes` for swing motion (2s ease-in-out)
- Glow trail via `box-shadow` animation

### 5. SealAnimation Component

A stamp/seal effect for toast notifications on save.

```typescript
interface SealAnimationProps {
  color: string // CSS color value
  onComplete?: () => void
}
```

**Animation Sequence:**

1. Scale from 1.5 to 1.0 (stamp down)
2. Brief opacity pulse
3. Settle with slight bounce

### 6. GhostIngredients Component

Semi-transparent floating shapes in empty cauldron state.

```typescript
interface GhostIngredientsProps {
  visible: boolean
}
```

**Implementation:**

- 2-3 blurred, semi-transparent card shapes
- CSS `@keyframes` for gentle bobbing motion
- Fade out transition when `visible` becomes false

## Data Models

### Sound Preferences

```typescript
interface SoundPreferences {
  enabled: boolean
  volume: number // 0-1, default 0.3
}

const SOUND_STORAGE_KEY = 'gendea-sound-preferences'
```

### Sound Assets

```typescript
interface SoundAsset {
  id: string
  src: string
  loop: boolean
  volume: number
}

const SOUNDS: Record<string, SoundAsset> = {
  chime: { id: 'chime', src: '/sounds/chime.mp3', loop: false, volume: 0.4 },
  bubble: { id: 'bubble', src: '/sounds/bubble.mp3', loop: true, volume: 0.2 },
  crystal: { id: 'crystal', src: '/sounds/crystal.mp3', loop: false, volume: 0.3 }
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Based on the prework analysis, most requirements are visual/animation-based and not amenable to property-based testing. The testable properties focus on state management and conditional rendering:

### Property 1: Rune Recycling Maintains Count

_For any_ set of rune elements, when a rune drifts off-screen and is recycled, the total count of visible runes SHALL remain constant.
**Validates: Requirements 1.4**

### Property 2: Constellation Lines Scale with Cards

_For any_ number of idea cards N >= 2, the constellation system SHALL render between N-1 and 2N connecting lines.
**Validates: Requirements 2.1**

### Property 3: Staggered Animation Delay Ordering

_For any_ list of idea pills with indices 0 to N, the animation delay for pill at index i SHALL equal i \* 80ms.
**Validates: Requirements 3.1**

### Property 4: Crystallization Particle Count

_For any_ crystallization event, the number of emitted sparkle particles SHALL be between 8 and 12 inclusive.
**Validates: Requirements 4.3**

### Property 5: Seal Color Matches Feature

_For any_ save action on a feature page, the seal animation color SHALL match that feature's accent color (amber for Spark, purple for Cauldron, teal for Oracle).
**Validates: Requirements 7.3**

### Property 6: Toast Smoke Particle Count

_For any_ toast dismissal with particles enabled, the number of smoke particles SHALL be between 3 and 5 inclusive.
**Validates: Requirements 9.2**

### Property 7: Ghost Ingredient Count

_For any_ empty cauldron state, the number of ghost ingredient elements SHALL be between 2 and 3 inclusive.
**Validates: Requirements 11.1**

## Error Handling

### Sound Loading Failures

- If a sound file fails to load, log a warning and continue without sound
- The sound toggle should still function, just with no audio output
- Use `HTMLAudioElement.onerror` to catch loading failures

### Animation Performance

- If frame rate drops below 30fps, reduce particle counts by 50%
- Use `requestAnimationFrame` for JS-driven animations
- Implement cleanup in `onUnmounted` to prevent memory leaks

### Reduced Motion

- Check `window.matchMedia('(prefers-reduced-motion: reduce)')` on mount
- Listen for changes via `matchMedia.addEventListener('change', ...)`
- Provide `useReducedMotion` composable for consistent access

## Testing Strategy

Since this feature is primarily visual/animation-based, testing focuses on:

### Manual Visual Testing

- Test each animation in isolation
- Verify reduced-motion behavior
- Check performance on lower-end devices
- Validate color accuracy across features

### Accessibility Testing

- Verify all animations respect `prefers-reduced-motion`
- Ensure sound toggle is keyboard accessible
- Check that visual effects don't interfere with content readability

### Browser Compatibility

- Test CSS animations in Chrome, Firefox, Safari
- Verify Web Audio API support for sound system
- Check SVG rendering for constellation lines
