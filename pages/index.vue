<template>
  <div class="page-container">
    <TreeCanvas v-if="currentView === 'capture'" @save="handleSave" />

    <div v-else-if="currentView === 'confirmation'" class="save-confirmation">
      <div class="confirmation-message">
        <h2>✓ Save confirmed</h2>
        <p class="node-name">{{ nodeName }}</p>

        <div v-if="suggestedTags.length > 0" class="tags-section">
          <p class="tags-label">Suggested tags:</p>
          <div class="tags">
            <span v-for="tag in suggestedTags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>

        <p class="nudge">Ready to plan your next steps?</p>

        <button class="continue-button" @click="startIdeation">Continue</button>
      </div>
    </div>

    <IdeationSlots
      v-else-if="currentView === 'ideation'"
      :branch-id="savedNode?.branchId || ''"
      :problem-text="problemText"
      @complete="handleIdeationComplete"
      @incubate="handleIncubation"
      @update:ideas="preservedIdeas = $event"
    />

    <IncubationTimer
      v-else-if="currentView === 'incubation'"
      :branch-id="savedNode?.branchId || ''"
      @complete="handleTimerComplete"
    />

    <IdeationSlots
      v-else-if="currentView === 'ideation-second'"
      :branch-id="savedNode?.branchId || ''"
      :problem-text="problemText"
      :preserved-ideas="preservedIdeas"
      @complete="handleSecondPassComplete"
      @incubate="handleSecondIncubation"
      @proceed="handleSecondPassProceed"
      @update:ideas="preservedIdeas = $event"
    />

    <ClarificationView
      v-else-if="currentView === 'clarification'"
      :branch-id="savedNode?.branchId || ''"
      @proceed="handleClarificationComplete"
    />

    <PlanningView
      v-else-if="currentView === 'planning'"
      :branch-id="savedNode?.branchId || ''"
      :idea="problemText"
      @proceed="handlePlanningComplete"
    />

    <RiskAssessmentView
      v-else-if="currentView === 'risk-assessment'"
      :branch-id="savedNode?.branchId || ''"
      :plan="selectedPlan"
      @complete="handleRiskAssessmentComplete"
    />

    <IfThenPlanning
      v-else-if="currentView === 'if-then-planning'"
      :branch-id="savedNode?.branchId || ''"
      :plan-context="selectedPlan"
      @save="handleIfThenPlanSave"
    />

    <ProgressLogView
      v-else-if="currentView === 'progress-log'"
      :branch-id="savedNode?.branchId || ''"
      @complete="handleProgressLogComplete"
    />

    <BreakRecommendation
      v-else-if="currentView === 'break-recommendation'"
      :branch-id="savedNode?.branchId || ''"
      :reason="breakReason"
      @start-break="handleStartBreak"
      @skip="handleSkipBreak"
    />

    <IncubationTimer
      v-else-if="currentView === 'break-timer'"
      :branch-id="savedNode?.branchId || ''"
      :duration="15"
      @complete="handleBreakComplete"
    />

    <ActionCrisisCard
      v-else-if="currentView === 'action-crisis'"
      :branch-id="savedNode?.branchId || ''"
      :north-star="actionCrisisData.northStar"
      :missed-plans="actionCrisisData.missedPlans"
      :low-expectancy="actionCrisisData.lowExpectancy"
      @recommit="handleRecommit"
      @exit="handleActionCrisisExit"
    />

    <ActionCrisisExit
      v-else-if="currentView === 'action-crisis-exit'"
      :branch-id="savedNode?.branchId || ''"
      :north-star="actionCrisisData.northStar || ''"
      :failed-approach="problemText"
      @select="handleAlternativeSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Node } from '../types/node'
import { useNodeSave } from '../composables/useNodeSave'

type ViewState =
  | 'capture'
  | 'confirmation'
  | 'ideation'
  | 'incubation'
  | 'ideation-second'
  | 'clarification'
  | 'planning'
  | 'risk-assessment'
  | 'if-then-planning'
  | 'progress-log'
  | 'break-recommendation'
  | 'break-timer'
  | 'action-crisis'
  | 'action-crisis-exit'

const { saveNode } = useNodeSave()

const currentView = ref<ViewState>('capture')
const savedNode = ref<Node | null>(null)
const nodeName = ref('')
const suggestedTags = ref<string[]>([])
const problemText = ref('')
const selectedPlan = ref('')
const preservedIdeas = ref<Array<{ text: string; isAI: boolean; label?: string }>>([])
const breakReason = ref<'low-energy' | 'stalled'>('low-energy')
const returnView = ref<ViewState>('capture')
const actionCrisisData = ref({
  northStar: '',
  missedPlans: 0,
  lowExpectancy: false
})

async function handleSave(data: { problem: string; assumptions: string[] }) {
  try {
    const result = await saveNode(data)
    savedNode.value = result.node
    nodeName.value = result.nodeName
    suggestedTags.value = result.suggestedTags
    problemText.value = data.problem
    currentView.value = 'confirmation'
  } catch (error) {
    console.error('Failed to save node:', error)
  }
}

function startIdeation() {
  currentView.value = 'ideation'
}

function handleIdeationComplete(ideas: string[]) {
  console.log('User ideas:', ideas)
}

function handleIncubation() {
  currentView.value = 'incubation'
}

function handleTimerComplete() {
  currentView.value = 'ideation-second'
}

function handleSecondPassComplete(ideas: string[]) {
  console.log('Second pass ideas:', ideas)
  currentView.value = 'clarification'
}

function handleSecondIncubation() {
  console.log('User wants another break')
}

function handleSecondPassProceed() {
  currentView.value = 'clarification'
}

function handleClarificationComplete() {
  currentView.value = 'planning'
}

function handlePlanningComplete(plan: string) {
  selectedPlan.value = plan
  currentView.value = 'risk-assessment'
}

function handleRiskAssessmentComplete() {
  currentView.value = 'if-then-planning'
}

async function handleIfThenPlanSave(plan: {
  action: string
  date: string
  time: string
  place: string
}) {
  try {
    await $fetch('/api/if-then-plan', {
      method: 'PUT',
      body: {
        branchId: savedNode.value?.branchId,
        ifThenPlan: plan
      }
    })
    currentView.value = 'progress-log'
  } catch (error) {
    console.error('Failed to save if-then plan:', error)
  }
}

async function handleProgressLogComplete() {
  console.log('Progress log saved successfully')

  if (!savedNode.value?.branchId) return

  try {
    const crisisCheck = (await $fetch('/api/action-crisis/check', {
      params: { branchId: savedNode.value.branchId }
    })) as {
      shouldShowCrisis: boolean
      missedPlans: number
      northStar?: string
    }

    if (crisisCheck.shouldShowCrisis) {
      actionCrisisData.value = {
        northStar: crisisCheck.northStar || '',
        missedPlans: crisisCheck.missedPlans,
        lowExpectancy: true
      }
      currentView.value = 'action-crisis'
      return
    }

    const breakCheck = (await $fetch('/api/break-recommendation', {
      params: { branchId: savedNode.value.branchId }
    })) as {
      shouldRecommendBreak: boolean
      reason?: string
    }

    const { shouldRecommendBreak, reason } = breakCheck

    if (shouldRecommendBreak && reason) {
      breakReason.value = reason as 'low-energy' | 'stalled'
      returnView.value = 'ideation-second'
      currentView.value = 'break-recommendation'
    }
  } catch (error) {
    console.error('Failed to check progress state:', error)
  }
}

function handleStartBreak() {
  currentView.value = 'break-timer'
}

function handleSkipBreak() {
  currentView.value = returnView.value
}

function handleBreakComplete() {
  currentView.value = returnView.value
}

async function handleRecommit(data: { metric: string; threshold: string }) {
  console.log('Recommitted with:', data)
  currentView.value = 'if-then-planning'
}

function handleActionCrisisExit() {
  currentView.value = 'action-crisis-exit'
}

function handleAlternativeSelect(alternative: { title: string; description: string }) {
  console.log('Selected alternative:', alternative)
  problemText.value = `${alternative.title}: ${alternative.description}`
  savedNode.value = null
  currentView.value = 'capture'
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f9fafb;
}

.save-confirmation {
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.confirmation-message {
  text-align: center;
}

.confirmation-message h2 {
  color: #10b981;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.node-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
}

.tags-section {
  margin-bottom: 1.5rem;
}

.tags-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.nudge {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.continue-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.continue-button:hover {
  background-color: #2563eb;
}
</style>
