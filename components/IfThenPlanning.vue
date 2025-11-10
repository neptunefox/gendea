<template>
  <div class="if-then-planning">
    <h3 class="title">Create Your If-Then Plan</h3>
    <p class="subtitle">Turn your plan into a concrete commitment</p>

    <div v-if="showCoachSuggestion" class="coach-section">
      <button class="coach-button" :disabled="loadingCoach" @click="getCoachSuggestion">
        {{ loadingCoach ? 'Getting suggestions...' : '✨ Get AI Suggestions' }}
      </button>

      <div v-if="coachSuggestion" class="coach-suggestion">
        <p class="coach-label">Coach Suggestion:</p>
        <p class="coach-reasoning">{{ coachSuggestion.reasoning }}</p>
        <button class="apply-button" @click="applySuggestion">Apply Suggestion</button>
      </div>
    </div>

    <div class="form">
      <div class="form-group">
        <label class="form-label">Action</label>
        <textarea
          v-model="ifThenPlan.action"
          class="form-textarea"
          placeholder="What specific action will you take?"
          rows="3"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Date</label>
          <input v-model="ifThenPlan.date" type="date" class="form-input" :min="minDate" >
        </div>

        <div class="form-group">
          <label class="form-label">Time</label>
          <input v-model="ifThenPlan.time" type="time" class="form-input" >
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Place</label>
        <input
          v-model="ifThenPlan.place"
          type="text"
          class="form-input"
          placeholder="Where will you do this?"
        >
      </div>

      <div class="preview">
        <p class="preview-label">Your commitment:</p>
        <p class="preview-text">
          <strong>If</strong> it is {{ formatDateTime() }} and I am at
          {{ ifThenPlan.place || '[place]' }}, <strong>then</strong> I will
          {{ ifThenPlan.action || '[action]' }}.
        </p>
      </div>

      <button class="save-button" :disabled="!isValid" @click="savePlan">Save Plan</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface IfThenPlan {
  action: string
  date: string
  time: string
  place: string
}

interface CoachSuggestion {
  action: string
  suggestedDate: string
  suggestedTime: string
  suggestedPlace: string
  reasoning: string
}

const props = defineProps<{
  branchId: string
  initialPlan?: IfThenPlan
  planContext?: string
}>()

const emit = defineEmits<{
  save: [plan: IfThenPlan]
}>()

const ifThenPlan = ref<IfThenPlan>({
  action: props.initialPlan?.action || '',
  date: props.initialPlan?.date || '',
  time: props.initialPlan?.time || '',
  place: props.initialPlan?.place || ''
})

const showCoachSuggestion = ref(true)
const loadingCoach = ref(false)
const coachSuggestion = ref<CoachSuggestion | null>(null)

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const isValid = computed(() => {
  return (
    ifThenPlan.value.action.trim() !== '' &&
    ifThenPlan.value.date !== '' &&
    ifThenPlan.value.time !== '' &&
    ifThenPlan.value.place.trim() !== ''
  )
})

function formatDateTime(): string {
  if (!ifThenPlan.value.date || !ifThenPlan.value.time) {
    return '[date and time]'
  }

  const date = new Date(`${ifThenPlan.value.date}T${ifThenPlan.value.time}`)
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return `${dateStr} at ${timeStr}`
}

async function getCoachSuggestion() {
  loadingCoach.value = true
  try {
    const response = await $fetch<CoachSuggestion>('/api/coach', {
      method: 'POST',
      body: {
        action: ifThenPlan.value.action || 'work on my plan',
        context: props.planContext
      }
    })
    coachSuggestion.value = response
  } catch (error) {
    console.error('Failed to get coach suggestion:', error)
  } finally {
    loadingCoach.value = false
  }
}

function applySuggestion() {
  if (!coachSuggestion.value) return

  ifThenPlan.value.action = coachSuggestion.value.action
  ifThenPlan.value.date = coachSuggestion.value.suggestedDate
  ifThenPlan.value.time = coachSuggestion.value.suggestedTime
  ifThenPlan.value.place = coachSuggestion.value.suggestedPlace

  showCoachSuggestion.value = false
}

function savePlan() {
  if (!isValid.value) return
  emit('save', { ...ifThenPlan.value })
}
</script>

<style scoped>
.if-then-planning {
  max-width: 600px;
  margin: 0 auto;
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

.coach-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 0.5rem;
  border: 1px solid #bae6fd;
}

.coach-button {
  width: 100%;
  padding: 0.75rem;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.coach-button:hover:not(:disabled) {
  background: #0284c7;
}

.coach-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.coach-suggestion {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
}

.coach-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #0284c7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.coach-reasoning {
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.apply-button {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.apply-button:hover {
  background: #059669;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.preview {
  padding: 1rem;
  background: #f9fafb;
  border-left: 4px solid #3b82f6;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
}

.preview-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.preview-text {
  font-size: 0.9375rem;
  color: #111827;
  line-height: 1.6;
  margin: 0;
}

.preview-text strong {
  color: #3b82f6;
  font-weight: 600;
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
  margin-top: 0.5rem;
}

.save-button:hover:not(:disabled) {
  background: #059669;
}

.save-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
