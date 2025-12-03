# Design Document

## Overview

This design implements a 3D cauldron visualization using TresJS for the Cauldron page. The implementation creates an immersive mystical scene with a pot featuring glowing circuit patterns, animated liquid, and floating cards. The design prioritizes visual fidelity to the reference image while maintaining performance and accessibility.

## Architecture

The 3D cauldron is implemented as a Vue component using TresJS (the Vue wrapper for Three.js). The component is rendered client-side only to avoid SSR issues.

```
┌─────────────────────────────────────────────────────┐
│                   CauldronScene.vue                  │
│  ┌───────────────────────────────────────────────┐  │
│  │              TresCanvas (client-only)          │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  Camera + Lighting Setup                │  │  │
│  │  ├─────────────────────────────────────────┤  │  │
│  │  │  CauldronPot (mesh + circuit shader)    │  │  │
│  │  ├─────────────────────────────────────────┤  │  │
│  │  │  LiquidSurface (animated glow mesh)     │  │  │
│  │  ├─────────────────────────────────────────┤  │  │
│  │  │  FloatingCards (animated card meshes)   │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Components and Interfaces

### CauldronScene.vue
Main component that sets up the TresJS canvas and scene.

```typescript
interface CauldronSceneProps {
  // No external props - self-contained scene
}
```

### Scene Elements

**Cauldron Pot**
- Geometry: LatheGeometry to create the pot profile (rim, body, base, legs)
- Material: Custom shader material with circuit pattern and emissive glow
- Color: Dark teal base (#0a1a1a) with cyan circuit lines (#00ffcc)

**Liquid Surface**
- Geometry: CircleGeometry positioned at pot opening
- Material: ShaderMaterial with animated swirl pattern
- Animation: Rotating UV coordinates for swirl effect
- Glow: Emissive cyan (#00ffcc) with bloom effect

**Floating Cards**
- Geometry: PlaneGeometry (4 instances)
- Material: MeshBasicMaterial with emissive glow
- Animation: Sinusoidal floating + gentle rotation
- Position: Arranged in circular pattern above liquid

**Lighting**
- Ambient light: Low intensity for base visibility
- Point light: Cyan-tinted, positioned above liquid for glow effect
- Emissive materials: Self-illuminating elements

## Data Models

```typescript
interface CardState {
  position: [number, number, number]
  rotation: [number, number, number]
  phase: number // Animation phase offset
}

interface AnimationState {
  time: number
  liquidRotation: number
  cards: CardState[]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following testable properties were identified:

### Property 1: Liquid animation changes over time
*For any* active scene with animations enabled, the liquid rotation value at time T1 should differ from the value at time T2 where T2 > T1.
**Validates: Requirements 2.2**

### Property 2: Card animation changes over time
*For any* active scene with animations enabled, the card positions and rotations at time T1 should differ from values at time T2 where T2 > T1.
**Validates: Requirements 3.2**

### Property 3: Reduced motion disables animations
*For any* scene where reduced motion preference is enabled, all animation values should remain constant over time.
**Validates: Requirements 5.1**

## Error Handling

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| WebGL not supported | Display fallback static image or message |
| TresJS fails to initialize | Graceful degradation with error boundary |
| Performance issues | Reduce geometry complexity, disable effects |
| SSR rendering attempt | Client-only wrapper prevents server rendering |

## Testing Strategy

### Unit Tests
- Verify component mounts without errors
- Verify scene contains expected number of meshes
- Verify camera position is correctly configured
- Verify lighting setup is present

### Property-Based Tests
Using Vitest with fast-check for property-based testing:

- **Property 1**: Generate random time intervals, verify liquid rotation changes
- **Property 2**: Generate random time intervals, verify card positions change
- **Property 3**: Mock reduced motion preference, verify animations are static

Each property-based test will:
- Run minimum 100 iterations
- Tag with format: `**Feature: tresjs-cauldron-3d, Property {number}: {property_text}**`
- Reference the correctness property from this design document
