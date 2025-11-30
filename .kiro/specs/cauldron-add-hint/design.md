# Design Document: Cauldron Add Hint

## Overview

This feature adds visual indicators to the cauldron page that communicate to users they can continue adding ideas during mixing and after output is generated. The hints use subtle, non-intrusive UI elements that match the app's warm aesthetic.

## Architecture

The feature extends existing components with minimal changes:

- **CauldronPot.vue**: Add hint text during mixing state
- **cauldron.vue (page)**: Add remix hint when output exists, replace manual input with remix-aware version

## Components and Interfaces

### CauldronPot Component Changes

Add a mixing hint that appears when `isMixing` is true:

```vue
<div v-if="isMixing" class="mixing-hint">
  <Plus :size="14" />
  <span>Keep adding ideas to refine</span>
</div>
```

### Cauldron Page Changes

Add a remix hint section that appears when output exists:

```vue
<div v-if="output" class="remix-hint-section">
  <div class="remix-input-wrapper">
    <input
      v-model="manualInput"
      type="text"
      placeholder="Add another idea to remix..."
      class="manual-input"
      @keydown.enter="handleManualSubmit"
    />
    <button class="submit-manual-btn" :disabled="!manualInput.trim()" @click="handleManualSubmit">
      <Plus :size="20" />
    </button>
  </div>
  <p class="remix-hint-text">
    <Sparkles :size="14" />
    Drop ideas or type above to remix your result
  </p>
</div>
```

## Data Models

No new data models required. The feature uses existing state:

- `isMixing: boolean` - Controls mixing hint visibility
- `output: string | null` - Controls remix hint visibility

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Mixing hint visibility matches mixing state

_For any_ CauldronPot component instance, when `isMixing` prop is true, the mixing hint element should be present in the rendered output; when `isMixing` is false, the mixing hint element should not be present.

**Validates: Requirements 1.1**

### Property 2: Remix hint visibility matches output state

_For any_ cauldron page state, when `output` is a non-null string, the remix hint section should be visible; when `output` is null, the remix hint section should not be visible.

**Validates: Requirements 2.1**

## Error Handling

- If component fails to render hint, gracefully degrade to existing behavior without hints
- Hints should not block or interfere with core cauldron functionality

## Testing Strategy

### Unit Tests

- Test CauldronPot renders mixing hint when `isMixing=true`
- Test CauldronPot does not render mixing hint when `isMixing=false`
- Test cauldron page renders remix hint when output exists
- Test cauldron page does not render remix hint when output is null

### Property-Based Tests

Using Vitest with fast-check for property-based testing:

- **Property 1**: Generate random boolean values for `isMixing`, verify hint visibility matches state
- **Property 2**: Generate random string/null values for `output`, verify remix hint visibility matches state

Each property-based test must be tagged with: `**Feature: cauldron-add-hint, Property {number}: {property_text}**`
