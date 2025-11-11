<template>
  <div class="action-crisis-card">
    <div class="crisis-header">
      <h2 class="crisis-title">Action Crisis</h2>
      <p class="crisis-subtitle">
        Progress has stalled and expectancy is low. Time to make a clear decision.
      </p>
    </div>

    <div class="crisis-content">
      <div class="situation-summary">
        <h3>Current Situation</h3>
        <p>{{ situationText }}</p>
      </div>

      <div class="options">
        <div class="option-card recommit-card">
          <h4>Two-Week Recommit</h4>
          <p>Give this approach a focused two-week test with clear metrics.</p>

          <div class="metrics-form">
            <div class="form-group">
              <label>What will you measure?</label>
              <input
                v-model="recommitMetric"
                type="text"
                placeholder="e.g., Number of user interviews completed"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Success threshold (in 2 weeks)</label>
              <input
                v-model="recommitThreshold"
                type="text"
                placeholder="e.g., At least 5 interviews"
                class="form-input"
              />
            </div>
          </div>

          <button
            class="option-button recommit-button"
            :disabled="!canRecommit || processing"
            @click="handleRecommit"
          >
            {{ processing ? 'Processing...' : 'Recommit for 2 Weeks' }}
          </button>
        </div>

        <div class="option-card exit-card">
          <h4>Exit & Re-engage</h4>
          <p>Archive this approach and explore a different route to the same North Star.</p>

          <div v-if="northStar" class="north-star-reminder">
            <strong>Your North Star:</strong>
            <p>{{ northStar }}</p>
          </div>

          <button class="option-button exit-button" :disabled="processing" @click="handleExit">
            {{ processing ? 'Processing...' : 'Exit & Find New Route' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  branchId: string
  northStar?: string
  missedPlans: number
  lowExpectancy: boolean
}>()

const emit = defineEmits<{
  recommit: [{ metric: string; threshold: string }]
  exit: []
}>()

const recommitMetric = ref('')
const recommitThreshold = ref('')
const processing = ref(false)

const situationText = computed(() => {
  const parts = []
  if (props.missedPlans >= 2) {
    parts.push(`${props.missedPlans} plans have been missed`)
  }
  if (props.lowExpectancy) {
    parts.push('expectancy is low')
  }
  return parts.join(' and ') + '. This is a natural decision point.'
})

const canRecommit = computed(() => {
  return recommitMetric.value.trim() !== '' && recommitThreshold.value.trim() !== ''
})

async function handleRecommit() {
  if (!canRecommit.value || processing.value) return

  processing.value = true
  try {
    await $fetch('/api/action-crisis/recommit', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        metric: recommitMetric.value,
        threshold: recommitThreshold.value
      }
    })
    emit('recommit', {
      metric: recommitMetric.value,
      threshold: recommitThreshold.value
    })
  } catch (error) {
    console.error('Failed to recommit:', error)
  } finally {
    processing.value = false
  }
}

async function handleExit() {
  if (processing.value) return

  processing.value = true
  try {
    await $fetch('/api/workflow/transition', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        event: { type: 'EXIT' }
      }
    })
    emit('exit')
  } catch (error) {
    console.error('Failed to exit:', error)
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
.action-crisis-card {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-top: 4px solid #ef4444;
}

.crisis-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.crisis-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 0.5rem;
}

.crisis-subtitle {
  font-size: 1rem;
  color: #6b7280;
}

.crisis-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.situation-summary {
  padding: 1.5rem;
  background: #fef2f2;
  border-radius: 0.5rem;
  border-left: 4px solid #ef4444;
}

.situation-summary h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 0.5rem;
}

.situation-summary p {
  font-size: 0.9375rem;
  color: #7f1d1d;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .options {
    grid-template-columns: 1fr;
  }
}

.option-card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommit-card {
  border-color: #3b82f6;
  background: #eff6ff;
}

.exit-card {
  border-color: #6b7280;
  background: #f9fafb;
}

.option-card h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.option-card > p {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
}

.metrics-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.north-star-reminder {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
}

.north-star-reminder strong {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.north-star-reminder p {
  font-size: 0.9375rem;
  color: #111827;
  margin: 0;
}

.option-button {
  min-width: 44px;
  min-height: 44px;
  padding: 0.875rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    all 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
  margin-top: auto;
}

.recommit-button {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.recommit-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}

.exit-button {
  background: #6b7280;
  color: white;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
}

.exit-button:hover:not(:disabled) {
  background: #4b5563;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(107, 114, 128, 0.5);
}

.option-button:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
