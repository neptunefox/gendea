<template>
  <div class="outside-view-card">
    <h3 class="title">Outside View</h3>
    <p class="subtitle">Base rates from similar projects</p>

    <div v-if="loading" class="loading-state">
      <p>Statistician is finding similar projects...</p>
    </div>

    <div v-else-if="analysis && !analysis.needsUserInput" class="analysis-display">
      <div class="comparable-efforts">
        <h4 class="section-title">Comparable Efforts</h4>
        <div v-for="(effort, index) in analysis.comparableEfforts" :key="index" class="effort-card">
          <p class="effort-description">{{ effort.description }}</p>
          <div class="effort-stats">
            <div v-if="effort.successRate" class="stat">
              <span class="stat-label">Success Rate:</span>
              <span class="stat-value">{{ effort.successRate }}</span>
            </div>
            <div v-if="effort.timeToMilestone" class="stat">
              <span class="stat-label">Time to Milestone:</span>
              <span class="stat-value">{{ effort.timeToMilestone }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="base-rates">
        <h4 class="section-title">Base Rate Summary</h4>
        <div class="base-rate-card">
          <div v-if="analysis.baseRates.successRate" class="base-rate-item">
            <span class="base-rate-label">Success Rate:</span>
            <span class="base-rate-value">{{ analysis.baseRates.successRate }}</span>
          </div>
          <div v-if="analysis.baseRates.timeToFirstMilestone" class="base-rate-item">
            <span class="base-rate-label">Time to First Milestone:</span>
            <span class="base-rate-value">{{ analysis.baseRates.timeToFirstMilestone }}</span>
          </div>
        </div>
      </div>

      <div class="reference-class-display">
        <div class="reference-header">
          <span class="reference-label">Reference Class:</span>
          <span class="reference-text">{{ referenceClass }}</span>
        </div>
        <button class="change-button" @click="changeReferenceClass">Change</button>
      </div>
    </div>

    <div v-else-if="analysis && analysis.needsUserInput" class="user-input-section">
      <p class="input-prompt">
        Data is scarce. Pick three nearest cases and rate their similarity (1-10):
      </p>

      <div class="cases-input">
        <div v-for="i in 3" :key="i" class="case-input">
          <input
            v-model="userCases[i - 1].description"
            type="text"
            class="case-description"
            :placeholder="`Case ${i} description...`"
          />
          <input
            v-model.number="userCases[i - 1].similarity"
            type="number"
            min="1"
            max="10"
            class="case-similarity"
            placeholder="1-10"
          />
        </div>
      </div>

      <button class="submit-cases-button" :disabled="!allCasesFilled" @click="submitUserCases">
        Analyze with Cases
      </button>
    </div>

    <div v-else class="reference-class-input">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ComparableEffort {
  description: string
  successRate?: string
  timeToMilestone?: string
}

interface StatisticianAnalysis {
  comparableEfforts: ComparableEffort[]
  baseRates: {
    successRate?: string
    timeToFirstMilestone?: string
  }
  needsUserInput: boolean
}

interface UserCase {
  description: string
  similarity: number
}

const props = defineProps<{
  branchId: string
  plan: string
}>()

const emit = defineEmits<{
  analysisComplete: [analysis: StatisticianAnalysis, referenceClass: string]
}>()

const referenceClass = ref('')
const analysis = ref<StatisticianAnalysis | null>(null)
const loading = ref(false)
const userCases = ref<UserCase[]>([
  { description: '', similarity: 5 },
  { description: '', similarity: 5 },
  { description: '', similarity: 5 }
])

const allCasesFilled = computed(() => {
  return userCases.value.every(c => c.description.trim().length > 0)
})

onMounted(async () => {
  const existingAnalysis = await fetchExistingAnalysis()
  if (existingAnalysis) {
    analysis.value = existingAnalysis
    referenceClass.value = existingAnalysis.referenceClass || ''
  }
})

async function fetchExistingAnalysis() {
  try {
    const response = await $fetch(`/api/branch/${props.branchId}`)
    return response.branch?.outsideViewAnalysis || null
  } catch (error) {
    console.error('Failed to fetch existing analysis:', error)
    return null
  }
}

async function submitReferenceClass() {
  if (!referenceClass.value.trim()) return

  loading.value = true
  try {
    const response = await $fetch<StatisticianAnalysis>('/api/statistician', {
      method: 'POST',
      body: {
        plan: props.plan,
        referenceClass: referenceClass.value
      }
    })
    analysis.value = response

    if (!response.needsUserInput) {
      await saveAnalysis(response)
    }
  } catch (error) {
    console.error('Failed to analyze base rates:', error)
  } finally {
    loading.value = false
  }
}

async function submitUserCases() {
  if (!allCasesFilled.value) return

  loading.value = true
  try {
    const response = await $fetch<StatisticianAnalysis>('/api/statistician', {
      method: 'POST',
      body: {
        plan: props.plan,
        referenceClass: referenceClass.value,
        userCases: userCases.value
      }
    })
    analysis.value = response
    await saveAnalysis(response)
  } catch (error) {
    console.error('Failed to analyze base rates:', error)
  } finally {
    loading.value = false
  }
}

async function saveAnalysis(analysisData: StatisticianAnalysis) {
  try {
    await $fetch(`/api/branch/${props.branchId}/outside-view`, {
      method: 'PUT',
      body: {
        analysis: {
          comparableEfforts: analysisData.comparableEfforts,
          baseRates: analysisData.baseRates,
          referenceClass: referenceClass.value
        }
      }
    })
    emit('analysisComplete', analysisData, referenceClass.value)
  } catch (error) {
    console.error('Failed to save analysis:', error)
  }
}

function changeReferenceClass() {
  analysis.value = null
  referenceClass.value = ''
  userCases.value = [
    { description: '', similarity: 5 },
    { description: '', similarity: 5 },
    { description: '', similarity: 5 }
  ]
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

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

.analysis-display {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.comparable-efforts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.effort-card {
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.effort-description {
  font-size: 0.9375rem;
  color: #111827;
  margin: 0 0 0.75rem 0;
  font-weight: 500;
}

.effort-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.stat-label {
  font-weight: 600;
  color: #6b7280;
}

.stat-value {
  color: #374151;
}

.base-rates {
  background: #eff6ff;
  padding: 1.25rem;
  border: 2px solid #3b82f6;
  border-radius: 0.5rem;
}

.base-rate-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.base-rate-item {
  display: flex;
  gap: 0.75rem;
  font-size: 1rem;
}

.base-rate-label {
  font-weight: 600;
  color: #1e40af;
}

.base-rate-value {
  color: #111827;
  font-weight: 500;
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
  margin-top: 0.5rem;
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

.user-input-section {
  background: #fef3c7;
  padding: 1.5rem;
  border: 1px solid #fbbf24;
  border-radius: 0.5rem;
}

.input-prompt {
  font-size: 0.9375rem;
  color: #111827;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.cases-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.case-input {
  display: flex;
  gap: 0.75rem;
}

.case-description {
  flex: 1;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.case-similarity {
  width: 5rem;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
}

.case-description:focus,
.case-similarity:focus {
  outline: none;
  border-color: #f59e0b;
}

.submit-cases-button {
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

.submit-cases-button:hover:not(:disabled) {
  background-color: #d97706;
}

.submit-cases-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>
