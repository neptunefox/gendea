<template>
  <div class="progress-log-view">
    <div v-if="context" class="context-section">
      <div v-if="context.northStar" class="context-card">
        <h3 class="context-title">North Star</h3>
        <p class="context-text">{{ context.northStar.text }}</p>
      </div>
      <div v-if="context.ladderSteps && context.ladderSteps.length > 0" class="context-card">
        <h3 class="context-title">Ladder Steps</h3>
        <ol class="ladder-list">
          <li v-for="step in context.ladderSteps" :key="step.id" class="ladder-item">
            {{ step.text }}
          </li>
        </ol>
      </div>
    </div>

    <h3 class="title">Log Your Progress</h3>
    <p class="subtitle">Reflect on what happened and what you learned</p>

    <div class="form">
      <div class="form-group">
        <label class="form-label">What happened?</label>
        <textarea
          v-model="log.whatHappened"
          class="form-textarea"
          placeholder="Describe the outcome of your test or action..."
          rows="4"
        />
      </div>

      <div class="form-group">
        <label class="form-label">What did you learn?</label>
        <textarea
          v-model="log.whatLearned"
          class="form-textarea"
          placeholder="What insights or lessons did you gain?"
          rows="4"
        />
      </div>

      <div class="form-group">
        <label class="form-label">What next?</label>
        <textarea
          v-model="log.whatNext"
          class="form-textarea"
          placeholder="What will you do based on what you learned?"
          rows="4"
        />
      </div>

      <div class="ratings">
        <div class="rating-group">
          <label class="rating-label">Energy Level</label>
          <div class="slider-container">
            <input v-model.number="log.energyRating" type="range" min="1" max="5" class="slider" />
            <span class="slider-value">{{ log.energyRating }}</span>
          </div>
          <div class="slider-labels">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div class="rating-group">
          <label class="rating-label">Expectancy (How likely to succeed?)</label>
          <div class="slider-container">
            <input
              v-model.number="log.expectancyRating"
              type="range"
              min="1"
              max="5"
              class="slider"
            />
            <span class="slider-value">{{ log.expectancyRating }}</span>
          </div>
          <div class="slider-labels">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button class="save-button" :disabled="!isValid || saving" @click="saveLog">
          {{ saving ? 'Saving...' : 'Save Progress' }}
        </button>
        <button class="complete-button" :disabled="!isValid || saving" @click="markComplete">
          Mark Complete
        </button>
      </div>
    </div>

    <div v-if="loadingCritique" class="ai-status">
      <div class="spinner" />
      <p>Coach is preparing supportive guidance…</p>
    </div>

    <CritiqueCard
      v-if="critique"
      :critique="critique"
      :dismissable="true"
      @dismiss="dismissCritique"
    />

    <AccountabilitySettings v-if="showAccountability" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBranchContext } from '~/composables/useBranchContext'

const props = defineProps<{
  branchId: string
}>()

const emit = defineEmits<{
  complete: []
  showIfThen: []
  markComplete: []
}>()

const { context, fetchContext } = useBranchContext(props.branchId)

const log = ref({
  whatHappened: '',
  whatLearned: '',
  whatNext: '',
  energyRating: 3,
  expectancyRating: 3
})

const saving = ref(false)
const showAccountability = ref(false)
const loadingCritique = ref(false)
const critique = ref<{
  bar: string
  affirmation: string
  processChanges: string[]
  focusAreas?: string[]
} | null>(null)

const LOW_THRESHOLD = 2

const isValid = computed(() => {
  return log.value.whatHappened.trim() !== ''
})

onMounted(async () => {
  await fetchContext()
})

async function saveLog() {
  if (!isValid.value || saving.value) return

  saving.value = true
  try {
    await $fetch('/api/progress-log', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        whatHappened: log.value.whatHappened,
        whatLearned: log.value.whatLearned,
        whatNext: log.value.whatNext,
        energyRating: log.value.energyRating,
        expectancyRating: log.value.expectancyRating
      }
    })

    if (log.value.energyRating <= LOW_THRESHOLD || log.value.expectancyRating <= LOW_THRESHOLD) {
      await getCritique()
    }

    showAccountability.value = true
    emit('showIfThen')
    emit('complete')
  } catch (error) {
    console.error('Failed to save progress log:', error)
  } finally {
    saving.value = false
  }
}

async function getCritique() {
  loadingCritique.value = true
  try {
    const response = await $fetch<{
      bar: string
      affirmation: string
      processChanges: string[]
      focusAreas?: string[]
    }>('/api/critique', {
      method: 'POST',
      body: {
        userInput: `Progress Log:\nWhat happened: ${log.value.whatHappened}\nWhat learned: ${log.value.whatLearned}\nWhat next: ${log.value.whatNext}\nEnergy: ${log.value.energyRating}/5\nExpectancy: ${log.value.expectancyRating}/5`,
        context:
          'User is experiencing low energy or expectancy. Provide supportive guidance to help them maintain momentum.'
      }
    })
    critique.value = response
  } catch (error) {
    console.error('Failed to get critique:', error)
  } finally {
    loadingCritique.value = false
  }
}

function dismissCritique() {
  critique.value = null
}

async function markComplete() {
  if (!isValid.value || saving.value) return

  saving.value = true
  try {
    await $fetch('/api/progress-log', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        whatHappened: log.value.whatHappened,
        whatLearned: log.value.whatLearned,
        whatNext: log.value.whatNext,
        energyRating: log.value.energyRating,
        expectancyRating: log.value.expectancyRating
      }
    })

    emit('markComplete')
  } catch (error) {
    console.error('Failed to save progress log:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.progress-log-view {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.context-section {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .context-section {
    grid-template-columns: 1fr;
  }
}

.context-card {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.context-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.context-text {
  font-size: 0.9375rem;
  color: #111827;
  margin: 0;
  line-height: 1.6;
}

.ladder-list {
  margin: 0;
  padding-left: 1.25rem;
  list-style: decimal;
}

.ladder-item {
  font-size: 0.9375rem;
  color: #111827;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.ladder-item:last-child {
  margin-bottom: 0;
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

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.ratings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.rating-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  transition: background 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  background: #2563eb;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.slider::-moz-range-thumb:hover {
  background: #2563eb;
}

.slider-value {
  min-width: 1.5rem;
  text-align: center;
  font-weight: 600;
  color: #3b82f6;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

.save-button {
  padding: 0.875rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #059669;
}

.save-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.complete-button {
  padding: 0.875rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.complete-button:hover:not(:disabled) {
  background: #2563eb;
}

.complete-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.ai-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.ai-status p {
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
</style>
