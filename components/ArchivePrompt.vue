<template>
  <div class="archive-prompt">
    <h3>Before You Move On</h3>
    <p class="prompt-text">
      Take a moment to capture what you learned. What advice would you give your future self?
    </p>

    <textarea
      v-model="adviceToSelf"
      placeholder="Write one sentence of advice to your future self..."
      rows="4"
      class="advice-input"
    />

    <div class="actions">
      <button
        class="create-button"
        :disabled="!adviceToSelf.trim() || creating"
        @click="handleCreate"
      >
        {{ creating ? 'Creating Archive...' : 'Create Archive' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  branchId: string
}>()

const emit = defineEmits<{
  created: []
}>()

const adviceToSelf = ref('')
const creating = ref(false)

async function handleCreate() {
  if (!adviceToSelf.value.trim() || creating.value) return

  creating.value = true
  try {
    await fetch('/api/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId: props.branchId,
        adviceToSelf: adviceToSelf.value.trim()
      })
    })
    emit('created')
  } catch (error) {
    console.error('Failed to create archive:', error)
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.archive-prompt {
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.prompt-text {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.advice-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1.5rem;
}

.advice-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.create-button {
  padding: 0.875rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.create-button:hover:not(:disabled) {
  background: #2563eb;
}

.create-button:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>
