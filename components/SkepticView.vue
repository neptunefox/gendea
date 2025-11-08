<template>
  <div class="skeptic-view">
    <h3 class="title">Risk Analysis</h3>

    <button class="analyze-button" :disabled="loading" @click="analyzeRisks">
      {{ loading ? 'Analyzing...' : 'Analyze Risks' }}
    </button>

    <div v-if="analysis" class="analysis-section">
      <div class="failure-causes">
        <h4 class="section-title">Most Likely Failure Causes</h4>
        <div v-for="(item, index) in analysis.failureCauses" :key="index" class="cause-card">
          <div class="cause-number">{{ index + 1 }}</div>
          <div class="cause-content">
            <p class="cause-text">{{ item.cause }}</p>
            <div class="test-section">
              <span class="test-label">Test:</span>
              <span class="test-text">{{ item.test }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="critical-assumption">
        <h4 class="section-title">Critical Assumption</h4>
        <p class="assumption-text">{{ analysis.criticalAssumption }}</p>
        <p class="assumption-note">
          This assumption would likely change first if the plan is failing
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FailureCause {
  cause: string
  test: string
}

interface SkepticAnalysis {
  failureCauses: FailureCause[]
  criticalAssumption: string
}

const props = defineProps<{
  plan: string
  userFailureReason?: string
}>()

const analysis = ref<SkepticAnalysis | null>(null)
const loading = ref(false)

async function analyzeRisks() {
  loading.value = true
  try {
    const response = await $fetch<SkepticAnalysis>('/api/skeptic', {
      method: 'POST',
      body: {
        plan: props.plan,
        userFailureReason: props.userFailureReason
      }
    })
    analysis.value = response
  } catch (error) {
    console.error('Failed to analyze risks:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.skeptic-view {
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
  background-color: #ef4444;
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
  background-color: #dc2626;
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

.failure-causes {
  background: white;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.cause-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.cause-card:last-child {
  margin-bottom: 0;
}

.cause-number {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
}

.cause-content {
  flex: 1;
}

.cause-text {
  font-size: 0.9375rem;
  color: #111827;
  margin: 0 0 0.75rem 0;
  font-weight: 500;
}

.test-section {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.test-label {
  font-weight: 600;
  color: #6b7280;
}

.test-text {
  color: #374151;
}

.critical-assumption {
  background: #fffbeb;
  padding: 1.5rem;
  border: 2px solid #fbbf24;
  border-radius: 0.5rem;
}

.assumption-text {
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.assumption-note {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-style: italic;
}
</style>
