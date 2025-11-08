<template>
  <div class="planning-view">
    <h2 class="title">Create Your Plan</h2>

    <ConstraintBanner :has-constraints="hasActiveConstraints" />

    <ConstraintToggles v-model="constraints" />

    <div v-if="idea" class="idea-section">
      <h3 class="section-title">Your Idea</h3>
      <p class="idea-text">{{ idea }}</p>
    </div>

    <button class="generate-button" :disabled="loading" @click="generatePlans">
      {{ loading ? 'Generating...' : 'Generate Plans' }}
    </button>

    <div v-if="plans.length > 0" class="plans-section">
      <h3 class="section-title">Micro-Plans</h3>

      <div class="plans-grid">
        <div v-for="(plan, index) in plans" :key="index" class="plan-card">
          <h4 class="plan-title">Plan {{ index + 1 }}</h4>
          <p class="plan-description">{{ plan.description }}</p>

          <div class="test-section">
            <h5 class="test-title">Smallest Honest Test</h5>
            <div class="test-details">
              <div class="test-item">
                <span class="test-label">Metric:</span>
                <span class="test-value">{{ plan.test.metric }}</span>
              </div>
              <div class="test-item">
                <span class="test-label">Pass:</span>
                <span class="test-value pass">{{ plan.test.passThreshold }}</span>
              </div>
              <div class="test-item">
                <span class="test-label">Fail:</span>
                <span class="test-value fail">{{ plan.test.failThreshold }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Constraints {
  timeCap: boolean
  moneyCap: boolean
  skillsOnHand: boolean
}

interface MicroPlan {
  description: string
  test: {
    metric: string
    passThreshold: string
    failThreshold: string
  }
}

const props = defineProps<{
  idea: string
}>()

const constraints = ref<Constraints>({
  timeCap: false,
  moneyCap: false,
  skillsOnHand: false
})

const plans = ref<MicroPlan[]>([])
const loading = ref(false)

const hasActiveConstraints = computed(() => {
  return constraints.value.timeCap || constraints.value.moneyCap || constraints.value.skillsOnHand
})

async function generatePlans() {
  loading.value = true
  try {
    const response = await $fetch<{ plans: MicroPlan[] }>('/api/plans', {
      method: 'POST',
      body: {
        idea: props.idea,
        constraints: constraints.value
      }
    })
    plans.value = response.plans
  } catch (error) {
    console.error('Failed to generate plans:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.planning-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

.idea-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.idea-text {
  font-size: 0.9375rem;
  color: #111827;
  margin: 0;
}

.generate-button {
  width: 100%;
  padding: 0.875rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 1.5rem 0;
}

.generate-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.generate-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.plans-section {
  margin-top: 2rem;
}

.plans-grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 1rem;
}

.plan-card {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.plan-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.plan-description {
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.test-section {
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.test-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.test-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.test-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.test-label {
  font-weight: 600;
  color: #6b7280;
  min-width: 4rem;
}

.test-value {
  color: #111827;
}

.test-value.pass {
  color: #059669;
}

.test-value.fail {
  color: #dc2626;
}
</style>
