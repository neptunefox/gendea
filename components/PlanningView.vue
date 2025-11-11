<template>
  <div class="planning-view">
    <h2 class="title">Create Your Plan</h2>

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

    <ConstraintBanner :has-constraints="hasActiveConstraints" />

    <ConstraintToggles v-model="constraints" />

    <div v-if="idea" class="idea-section">
      <h3 class="section-title">Your Idea</h3>
      <p class="idea-text">{{ idea }}</p>
    </div>

    <div v-if="loading" class="ai-status">
      <div class="spinner" />
      <p>Planner is finding paths within your constraints…</p>
    </div>

    <button class="generate-button" :disabled="loading" @click="generatePlans">
      {{ loading ? 'Generating...' : 'Ask Planner for help' }}
    </button>

    <div v-if="plans.length > 0" class="plans-section">
      <h3 class="section-title">Micro-Plans</h3>

      <div class="plans-grid">
        <div
          v-for="(plan, index) in plans"
          :key="index"
          class="plan-card"
          :class="{ selected: selectedPlanIndex === index }"
          @click="selectPlan(index)"
        >
          <h4 class="plan-title">Plan {{ index + 1 }}</h4>
          <p class="plan-description">{{ plan.description }}</p>

          <TestSelection
            v-if="selectedPlanIndex === index"
            v-model="selectedTests[index]"
            :tests="plan.tests"
          />
        </div>
      </div>

      <div v-if="loadingCritique" class="ai-status">
        <div class="spinner" />
        <p>Coach is preparing supportive guidance…</p>
      </div>

      <button
        v-if="selectedPlanIndex !== null && selectedTests[selectedPlanIndex]"
        class="review-button"
        :disabled="loadingCritique"
        @click="reviewWithCoach"
      >
        {{ loadingCritique ? 'Getting feedback...' : 'Ask Coach for help' }}
      </button>

      <CritiqueCard
        v-if="critique"
        :critique="critique"
        :dismissable="true"
        @dismiss="critique = null"
      />

      <button
        v-if="selectedPlanIndex !== null && selectedTests[selectedPlanIndex]"
        class="proceed-button"
        @click="proceedToRiskAssessment"
      >
        Continue to Risk Assessment →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBranchContext } from '~/composables/useBranchContext'

interface Constraints {
  timeCap: boolean
  moneyCap: boolean
  skillsOnHand: boolean
}

interface TestOption {
  metric: string
  passThreshold: string
  failThreshold: string
}

interface MicroPlan {
  description: string
  tests: TestOption[]
}

const props = defineProps<{
  branchId: string
  idea: string
}>()

const { context, fetchContext } = useBranchContext(props.branchId)

const constraints = ref<Constraints>({
  timeCap: false,
  moneyCap: false,
  skillsOnHand: false
})

const emit = defineEmits<{
  proceed: [plan: string]
  showIfThen: [plan: string]
}>()

const plans = ref<MicroPlan[]>([])
const loading = ref(false)
const selectedPlanIndex = ref<number | null>(null)
const selectedTests = ref<Record<number, TestOption | null>>({})
const loadingCritique = ref(false)
const critique = ref<{
  bar: string
  affirmation: string
  processChanges: string[]
  focusAreas?: string[]
} | null>(null)

const hasActiveConstraints = computed(() => {
  return constraints.value.timeCap || constraints.value.moneyCap || constraints.value.skillsOnHand
})

onMounted(async () => {
  await fetchContext()
  if (context.value?.plan) {
    const existingPlan = context.value.plan
    plans.value = [
      {
        description: existingPlan.description,
        tests: [
          {
            metric: existingPlan.metric,
            passThreshold: existingPlan.passThreshold,
            failThreshold: existingPlan.failThreshold
          }
        ]
      }
    ]
    selectedPlanIndex.value = 0
    selectedTests.value[0] = {
      metric: existingPlan.metric,
      passThreshold: existingPlan.passThreshold,
      failThreshold: existingPlan.failThreshold
    }
    if (existingPlan.constraints) {
      constraints.value = {
        timeCap: existingPlan.constraints.timeCap || false,
        moneyCap: existingPlan.constraints.moneyCap || false,
        skillsOnHand: existingPlan.constraints.skillsOnHand || false
      }
    }
  }
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

function selectPlan(index: number) {
  selectedPlanIndex.value = index
}

async function reviewWithCoach() {
  if (selectedPlanIndex.value === null) return

  const plan = plans.value[selectedPlanIndex.value]
  const selectedTest = selectedTests.value[selectedPlanIndex.value]

  if (!selectedTest) {
    return
  }

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
        userInput: `Plan: ${plan.description}\nTest: ${selectedTest.metric}\nPass: ${selectedTest.passThreshold}\nFail: ${selectedTest.failThreshold}`,
        context: `Constraints: ${JSON.stringify(constraints.value)}`
      }
    })
    critique.value = response
  } catch (error) {
    console.error('Failed to get critique:', error)
  } finally {
    loadingCritique.value = false
  }
}

async function proceedToRiskAssessment() {
  if (selectedPlanIndex.value === null) return

  const plan = plans.value[selectedPlanIndex.value]
  const selectedTest = selectedTests.value[selectedPlanIndex.value]

  if (!selectedTest) {
    return
  }

  try {
    await $fetch('/api/plans', {
      method: 'PUT',
      body: {
        branchId: props.branchId,
        description: plan.description,
        constraints: constraints.value,
        test: selectedTest
      }
    })

    await $fetch('/api/tests', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        metric: selectedTest.metric,
        passThreshold: selectedTest.passThreshold,
        failThreshold: selectedTest.failThreshold
      }
    })

    await $fetch('/api/workflow/transition', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        event: { type: 'THRESHOLDS_SET' }
      }
    })

    emit('showIfThen', plan.description)
  } catch (error) {
    console.error('Failed to save plan or transition workflow:', error)
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
  min-height: 44px;
  padding: 0.875rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
  margin: 1.5rem 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.generate-button:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}

.generate-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
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
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.plan-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.plan-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
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
  margin-bottom: 0;
}

.review-button {
  width: 100%;
  min-height: 44px;
  padding: 0.875rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
  margin-top: 2rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.review-button:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.5);
}

.review-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

.proceed-button {
  width: 100%;
  min-height: 44px;
  padding: 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
  margin-top: 1rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.proceed-button:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
}

.ai-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.ai-status p {
  color: #6b7280;
  font-size: 0.9375rem;
  font-weight: 500;
  margin: 0;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
