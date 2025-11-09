<template>
  <div class="statistician-view">
    <h3 class="title">Base Rate Analysis</h3>

    <button class="analyze-button" :disabled="loading" @click="analyzeBaseRates">
      {{ loading ? 'Analyzing...' : 'Get Base Rates' }}
    </button>

    <div v-if="analysis && !analysis.needsUserInput" class="analysis-section">
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
        <h4 class="section-title">Estimated Base Rates</h4>
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
    </div>

    <div v-if="analysis && analysis.needsUserInput" class="user-input-section">
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
          >
          <input
            v-model.number="userCases[i - 1].similarity"
            type="number"
            min="1"
            max="10"
            class="case-similarity"
            placeholder="1-10"
          >
        </div>
      </div>

      <button class="submit-cases-button" :disabled="!allCasesFilled" @click="submitUserCases">
        Analyze with Cases
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
  plan: string
  referenceClass?: string
}>()

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

async function analyzeBaseRates() {
  loading.value = true
  try {
    const response = await $fetch<StatisticianAnalysis>('/api/statistician', {
      method: 'POST',
      body: {
        plan: props.plan,
        referenceClass: props.referenceClass
      }
    })
    analysis.value = response
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
        referenceClass: props.referenceClass,
        userCases: userCases.value
      }
    })
    analysis.value = response
  } catch (error) {
    console.error('Failed to analyze base rates:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.statistician-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

.analyze-button {
  width: 100%;
  padding: 0.875rem;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 2rem;
}

.analyze-button:hover:not(:disabled) {
  background-color: #7c3aed;
}

.analyze-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.analysis-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.comparable-efforts {
  background: white;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.effort-card {
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.effort-card:last-child {
  margin-bottom: 0;
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
  padding: 1.5rem;
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
