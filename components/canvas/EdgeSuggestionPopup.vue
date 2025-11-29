<template>
  <div
    v-if="isVisible"
    class="edge-suggestion-popup"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
  >
    <div class="suggestion-header">
      <Sparkles :size="14" />
      <span>AI Suggestion</span>
    </div>
    <div class="suggestion-content">
      <div class="suggested-type">
        <span class="type-label">{{ EDGE_RELATIONSHIP_LABELS[suggestedType] }}</span>
        <span v-if="suggestedLabel" class="suggested-label">"{{ suggestedLabel }}"</span>
      </div>
      <div class="type-selector">
        <button
          v-for="type in EDGE_RELATIONSHIP_TYPES"
          :key="type"
          class="type-btn"
          :class="{ active: selectedType === type, suggested: type === suggestedType }"
          @click="selectedType = type"
        >
          {{ EDGE_RELATIONSHIP_LABELS[type] }}
        </button>
      </div>
      <input
        v-model="customLabel"
        type="text"
        class="label-input"
        placeholder="Custom label (optional)"
        @keydown.enter="handleAccept"
        @keydown.escape="handleDismiss"
      />
    </div>
    <div class="suggestion-actions">
      <button class="accept-btn" @click="handleAccept">
        <Check :size="14" />
        Apply
      </button>
      <button class="dismiss-btn" @click="handleDismiss">
        <X :size="14" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, Check, X } from 'lucide-vue-next'
import { ref, watch } from 'vue'

import {
  EDGE_RELATIONSHIP_TYPES,
  EDGE_RELATIONSHIP_LABELS,
  type EdgeRelationshipType
} from '~/types/canvas'

interface Props {
  isVisible: boolean
  position: { x: number; y: number }
  suggestedType: EdgeRelationshipType
  suggestedLabel: string
  edgeId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  accept: [edgeId: string, type: EdgeRelationshipType, label: string | null]
  dismiss: []
}>()

const selectedType = ref<EdgeRelationshipType>(props.suggestedType)
const customLabel = ref(props.suggestedLabel)

watch(
  () => props.suggestedType,
  newType => {
    selectedType.value = newType
  }
)

watch(
  () => props.suggestedLabel,
  newLabel => {
    customLabel.value = newLabel
  }
)

function handleAccept() {
  emit('accept', props.edgeId, selectedType.value, customLabel.value || null)
}

function handleDismiss() {
  emit('dismiss')
}
</script>

<style scoped>
.edge-suggestion-popup {
  position: fixed;
  z-index: 1000;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--space-3);
  min-width: 220px;
  transform: translate(-50%, -100%) translateY(-12px);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.suggested-type {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.type-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.suggested-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-style: italic;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.type-btn {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.type-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.type-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.type-btn.suggested:not(.active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.label-input {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-text);
}

.label-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.label-input::placeholder {
  color: var(--color-text-tertiary);
}

.suggestion-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.accept-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.accept-btn:hover {
  background: var(--color-primary-hover);
}

.dismiss-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.dismiss-btn:hover {
  border-color: var(--color-error);
  color: var(--color-error);
}
</style>
