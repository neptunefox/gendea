<template>
  <div class="break-recommendation">
    <div class="break-card">
      <h2 class="break-title">Time for a Break</h2>
      <p class="break-description">
        {{ reasonMessage }}
      </p>
      <p class="break-suggestion">
        Take a 10-15 minute undemanding break or go for a short walk. We'll bring you back to this
        idea when you return.
      </p>

      <div class="break-actions">
        <button class="start-break-button" @click="startBreak">Start Break</button>
        <button class="skip-button" @click="skipBreak">Continue Working</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  branchId: string
  reason: 'low-energy' | 'stalled'
}>()

const emit = defineEmits<{
  startBreak: []
  skip: []
}>()

const reasonMessage = computed(() => {
  if (props.reason === 'low-energy') {
    return 'Your energy is running low. A short break can help you return with fresh perspective.'
  }
  return 'Progress has stalled. A brief break can help reset your thinking and approach.'
})

function startBreak() {
  emit('startBreak')
}

function skipBreak() {
  emit('skip')
}
</script>

<style scoped>
.break-recommendation {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.break-card {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.break-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.break-description {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 1.0625rem;
}

.break-suggestion {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.break-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.start-break-button {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.start-break-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.skip-button {
  padding: 0.75rem 2rem;
  background-color: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.skip-button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}
</style>
