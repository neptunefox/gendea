<template>
  <div class="if-then-suggestions">
    <h3 class="title">Choose Your Next Action</h3>
    <p class="subtitle">Select a suggestion or create your own plan</p>

    <div v-if="loading" class="loading">
      <div class="spinner" />
      <p>Coach is preparing suggestions…</p>
    </div>

    <div v-else-if="suggestions.length > 0" class="suggestions-container">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="suggestion-card"
        :class="{ selected: selectedIndex === index }"
        @click="selectSuggestion(index)"
      >
        <div class="suggestion-header">
          <span class="suggestion-number">Option {{ index + 1 }}</span>
          <span v-if="selectedIndex === index" class="selected-badge">✓ Selected</span>
        </div>
        <p class="suggestion-action">{{ suggestion.action }}</p>
        <div class="suggestion-details">
          <span class="detail-item">📅 {{ formatDate(suggestion.suggestedDate) }}</span>
          <span class="detail-item">🕐 {{ formatTime(suggestion.suggestedTime) }}</span>
          <span class="detail-item">📍 {{ suggestion.suggestedPlace }}</span>
        </div>
        <p class="suggestion-reasoning">{{ suggestion.reasoning }}</p>
      </div>

      <div class="action-buttons">
        <button class="use-button" :disabled="selectedIndex === null" @click="useSuggestion">
          Use Selected Plan
        </button>
        <button class="custom-button" @click="createCustom">Create Custom Plan</button>
      </div>
    </div>

    <div v-else class="error">
      <p>Unable to generate suggestions. Please create a custom plan.</p>
      <button class="custom-button" @click="createCustom">Create Custom Plan</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface IfThenSuggestion {
  action: string
  suggestedDate: string
  suggestedTime: string
  suggestedPlace: string
  reasoning: string
}

const props = defineProps<{
  suggestions: IfThenSuggestion[]
  loading: boolean
}>()

const emit = defineEmits<{
  select: [suggestion: IfThenSuggestion]
  custom: []
}>()

const selectedIndex = ref<number | null>(null)

function selectSuggestion(index: number) {
  selectedIndex.value = index
}

function useSuggestion() {
  if (selectedIndex.value !== null) {
    emit('select', props.suggestions[selectedIndex.value])
  }
}

function createCustom() {
  emit('custom')
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function formatTime(timeStr: string): string {
  try {
    const [hours, minutes] = timeStr.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return timeStr
  }
}
</script>

<style scoped>
.if-then-suggestions {
  max-width: 700px;
  margin: 2rem auto 0;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.9375rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  background: #fef3c7;
  border-radius: 0.5rem;
}

.loading p {
  color: #92400e;
  font-size: 0.9375rem;
  font-weight: 500;
  margin: 0;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #fde68a;
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.suggestions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-card {
  padding: 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.suggestion-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.suggestion-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.selected-badge {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
}

.suggestion-action {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.suggestion-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.detail-item {
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.suggestion-reasoning {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.use-button {
  flex: 1;
  padding: 0.875rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  min-height: 44px;
}

.use-button:hover:not(:disabled) {
  background: #059669;
}

.use-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.custom-button {
  flex: 1;
  padding: 0.875rem;
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.custom-button:hover {
  background: #eff6ff;
}

.error {
  padding: 2rem;
  text-align: center;
}

.error p {
  color: #6b7280;
  margin-bottom: 1rem;
}
</style>
