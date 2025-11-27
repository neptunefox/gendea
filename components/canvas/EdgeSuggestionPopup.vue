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
import { ref, watch } from 'vue'
import { Sparkles, Check, X } from 'lucide-vue-next'
import { EDGE_RELATIONSHIP_TYPES, EDGE_RELATIONSHIP_LABELS, type EdgeRelationshipType } from '~/types/canvas'

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

watch(() => props.suggestedType, (newType) => {
  selectedType.value = newType
})

watch(() => props.suggestedLabel, (newLabel) => {
  customLabel.value = newLabel
})

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
  background: white;
  border: 1px solid #f0e5e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 0.75rem;
  min-width: 220px;
  transform: translate(-50%, -100%) translateY(-12px);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: #d4756f;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.suggested-type {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.type-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #40312b;
}

.suggested-label {
  font-size: 0.75rem;
  color: #8b7a75;
  font-style: italic;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.type-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #f0e5e0;
  border-radius: 6px;
  background: white;
  font-size: 0.7rem;
  color: #8b7a75;
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-btn:hover {
  border-color: #d4756f;
  color: #d4756f;
}

.type-btn.active {
  background: #d4756f;
  border-color: #d4756f;
  color: white;
}

.type-btn.suggested:not(.active) {
  border-color: #d4756f;
  color: #d4756f;
}

.label-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid #f0e5e0;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #40312b;
}

.label-input:focus {
  outline: none;
  border-color: #d4756f;
}

.label-input::placeholder {
  color: #b8a8a3;
}

.suggestion-actions {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.accept-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.375rem;
  border: none;
  border-radius: 6px;
  background: #d4756f;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.accept-btn:hover {
  background: #c26660;
}

.dismiss-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border: 1px solid #f0e5e0;
  border-radius: 6px;
  background: white;
  color: #8b7a75;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dismiss-btn:hover {
  border-color: #c26660;
  color: #c26660;
}
</style>
