<template>
  <div class="outside-view-card">
    <h3 class="title">Outside View</h3>
    <p class="subtitle">Base rates from similar projects</p>

    <div v-if="!hasReferenceClass" class="reference-class-input">
      <p class="prompt">Describe similar projects or efforts:</p>
      <textarea
        v-model="referenceClass"
        class="input-field"
        placeholder="e.g., 'Mobile apps for habit tracking', 'Weekend side projects', 'First-time product launches'..."
        rows="3"
      />
      <button
        class="submit-button"
        :disabled="!referenceClass.trim()"
        @click="submitReferenceClass"
      >
        Continue
      </button>
    </div>

    <div v-else class="reference-class-display">
      <div class="reference-header">
        <span class="reference-label">Reference Class:</span>
        <span class="reference-text">{{ referenceClass }}</span>
      </div>
      <button class="change-button" @click="changeReferenceClass">Change</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [referenceClass: string]
}>()

const referenceClass = ref('')
const hasReferenceClass = ref(false)

function submitReferenceClass() {
  if (!referenceClass.value.trim()) return

  hasReferenceClass.value = true
  emit('submit', referenceClass.value)
}

function changeReferenceClass() {
  hasReferenceClass.value = false
}
</script>

<style scoped>
.outside-view-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  margin: 0 0 1.5rem 0;
}

.reference-class-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prompt {
  font-size: 0.9375rem;
  color: #374151;
  font-weight: 500;
  margin: 0;
}

.input-field {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  ring: 2px;
  ring-color: rgba(59, 130, 246, 0.2);
}

.submit-button {
  padding: 0.875rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.reference-class-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.reference-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.reference-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.reference-text {
  font-size: 0.9375rem;
  color: #111827;
}

.change-button {
  padding: 0.5rem 1rem;
  background-color: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.change-button:hover {
  background-color: #eff6ff;
}
</style>
