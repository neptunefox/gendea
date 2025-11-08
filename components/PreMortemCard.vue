<template>
  <div class="pre-mortem-card">
    <div class="header">
      <h3 class="title">Pre-Mortem: 2 Minutes</h3>
      <p class="subtitle">Imagine this fails. Why?</p>
    </div>

    <textarea
      v-model="failureReason"
      class="failure-input"
      placeholder="Write why this could fail..."
      rows="4"
    />

    <button class="submit-button" :disabled="!failureReason.trim() || loading" @click="submit">
      {{ loading ? 'Saving...' : 'Continue' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [failureReason: string]
}>()

const failureReason = ref('')
const loading = ref(false)

async function submit() {
  if (!failureReason.value.trim()) return

  loading.value = true
  try {
    emit('submit', failureReason.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.pre-mortem-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border: 2px solid #f59e0b;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header {
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.failure-input {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;
}

.failure-input:focus {
  outline: none;
  border-color: #f59e0b;
  ring: 2px;
  ring-color: rgba(245, 158, 11, 0.2);
}

.submit-button {
  width: 100%;
  padding: 0.875rem;
  background-color: #f59e0b;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #d97706;
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>
