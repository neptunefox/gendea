<template>
  <div class="risk-assessment-view">
    <h2 class="title">Risk Assessment</h2>

    <div v-if="context" class="context-section">
      <div v-if="context.northStar" class="context-card">
        <h3 class="context-title">North Star</h3>
        <p class="context-text">{{ context.northStar.text }}</p>
      </div>
      <div v-if="context.plan" class="context-card">
        <h3 class="context-title">Selected Plan</h3>
        <p class="context-text">{{ context.plan.description }}</p>
      </div>
    </div>

    <div v-if="currentStep === 'pre-mortem'" class="step-container">
      <PreMortemCard @submit="handlePreMortemSubmit" />
    </div>

    <div v-if="currentStep === 'skeptic'" class="step-container">
      <SkepticView :branch-id="branchId" :plan="plan" :user-failure-reason="userFailureReason" />
      <button class="next-button" @click="nextStep">Continue to Outside View</button>
    </div>

    <div v-if="currentStep === 'outside-view'" class="step-container">
      <OutsideViewCard :branch-id="branchId" @submit="handleOutsideViewSubmit" />
    </div>

    <div v-if="currentStep === 'statistician'" class="step-container">
      <StatisticianView :branch-id="branchId" :plan="plan" :reference-class="referenceClass" />
      <button class="complete-button" @click="complete">Complete Assessment</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBranchContext } from '~/composables/useBranchContext'

type AssessmentStep = 'pre-mortem' | 'skeptic' | 'outside-view' | 'statistician'

const props = defineProps<{
  branchId: string
  plan: string
}>()

const { context, fetchContext } = useBranchContext(props.branchId)

const emit = defineEmits<{
  complete: []
}>()

const currentStep = ref<AssessmentStep>('pre-mortem')
const userFailureReason = ref('')
const referenceClass = ref('')

onMounted(async () => {
  await fetchContext()
})

function handlePreMortemSubmit(failureReason: string) {
  userFailureReason.value = failureReason
  currentStep.value = 'skeptic'
}

function handleOutsideViewSubmit(refClass: string) {
  referenceClass.value = refClass
  currentStep.value = 'statistician'
}

function nextStep() {
  currentStep.value = 'outside-view'
}

function complete() {
  emit('complete')
}
</script>

<style scoped>
.risk-assessment-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2rem;
  text-align: center;
}

.context-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
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

.step-container {
  margin-bottom: 2rem;
}

.next-button,
.complete-button {
  width: 100%;
  padding: 0.875rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 2rem;
}

.next-button:hover,
.complete-button:hover {
  background-color: #059669;
}

.complete-button {
  background-color: #3b82f6;
}

.complete-button:hover {
  background-color: #2563eb;
}
</style>
