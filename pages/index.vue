<template>
  <div class="page-container">
    <div v-if="pendingLogs.length > 0" class="log-progress-banner">
      <div class="banner-content">
        <span class="banner-text">Test window passed - time to log progress</span>
        <button class="log-progress-button" @click="openProgressLog">Log Progress</button>
      </div>
    </div>

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
      @show-if-then="handleShowIfThenFromClarification"
    />

    <PlanningView
      v-else-if="currentView === 'planning'"
      :branch-id="savedNode?.branchId || ''"
      :idea="problemText"
      @proceed="handlePlanningComplete"
      @show-if-then="handleShowIfThenFromPlanning"
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
      @show-if-then="handleShowIfThenFromProgressLog"
      @mark-complete="handleMarkComplete"
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
      @select="handleAlternativeSelectWithReengagement"
      @exit="handleExitToArchive"
    />

    <ArchivePrompt
      v-else-if="currentView === 'archive-prompt'"
      :branch-id="savedNode?.branchId || ''"
      @created="handleArchiveCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Node } from '../types/node'
import { useNodeSave } from '../composables/useNodeSave'
import { useProgressMonitor } from '../composables/useProgressMonitor'

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
  | 'archive-prompt'

const { saveNode } = useNodeSave()
const { pendingLogs, checkTestWindows } = useProgressMonitor()

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
const isCompletingBranch = ref(false)

async function handleSave(data: { problem: string; assumptions: string[]; isAnonymous: boolean }) {
  try {
    const result = await saveNode(data)
    savedNode.value = result.node
    nodeName.value = result.nodeName
    suggestedTags.value = result.suggestedTags
    problemText.value = data.problem
    currentView.value = 'if-then-planning'
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

function handleShowIfThenFromClarification() {
  returnView.value = 'clarification'
  currentView.value = 'if-then-planning'
}

function handlePlanningComplete(plan: string) {
  selectedPlan.value = plan
  currentView.value = 'risk-assessment'
}

function handleShowIfThenFromPlanning(plan: string) {
  selectedPlan.value = plan
  returnView.value = 'planning'
  currentView.value = 'if-then-planning'
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
    await fetch('/api/if-then-plan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId: savedNode.value?.branchId,
        nodeId: savedNode.value?.id,
        ifThenPlan: plan
      })
    })

    const previousView = returnView.value
    if (previousView === 'capture') {
      currentView.value = 'confirmation'
    } else if (previousView === 'clarification') {
      currentView.value = 'clarification'
    } else if (previousView === 'planning') {
      currentView.value = 'risk-assessment'
    } else if (previousView === 'progress-log') {
      await handleProgressLogComplete()
    } else {
      currentView.value = 'confirmation'
    }
  } catch (error) {
    console.error('Failed to save if-then plan:', error)
  }
}

function handleShowIfThenFromProgressLog() {
  returnView.value = 'progress-log'
  currentView.value = 'if-then-planning'
}

async function handleProgressLogComplete() {
  console.log('Progress log saved successfully')

  if (!savedNode.value?.branchId) return

  try {
    await fetch('/api/workflow/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId: savedNode.value.branchId,
        event: { type: 'LOG_ENTRY' }
      })
    })

    await checkTestWindows()

    const crisisResponse = await fetch(
      `/api/action-crisis/check?branchId=${savedNode.value.branchId}`
    )
    const crisisCheck = (await crisisResponse.json()) as {
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

    const breakResponse = await fetch(
      `/api/break-recommendation?branchId=${savedNode.value.branchId}`
    )
    const breakCheck = (await breakResponse.json()) as {
      shouldRecommendBreak: boolean
      reason?: string
    }

    const { shouldRecommendBreak, reason } = breakCheck

    if (shouldRecommendBreak && reason) {
      breakReason.value = reason as 'low-energy' | 'stalled'
      returnView.value = 'ideation-second'
      currentView.value = 'break-recommendation'
      return
    }

    currentView.value = 'capture'
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
  isCompletingBranch.value = false
  currentView.value = 'action-crisis-exit'
}

function handleMarkComplete() {
  isCompletingBranch.value = true
  currentView.value = 'archive-prompt'
}

async function handleArchiveCreated() {
  if (isCompletingBranch.value) {
    currentView.value = 'capture'
    savedNode.value = null
    problemText.value = ''
  } else {
    currentView.value = 'capture'
    savedNode.value = null
    problemText.value = ''
  }
}

function handleExitToArchive() {
  isCompletingBranch.value = false
  currentView.value = 'archive-prompt'
}

async function handleAlternativeSelectWithReengagement(data: {
  alternative: { title: string; description: string }
  branchId: string
}) {
  const { alternative, branchId } = data

  try {
    const branchResponse = await fetch(`/api/branch/${branchId}`)
    const branchData = (await branchResponse.json()) as {
      northStar: { text: string } | null
    }

    const northStarText = branchData.northStar?.text || actionCrisisData.value.northStar

    await fetch('/api/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId,
        adviceToSelf: `Tried: ${problemText.value}. Switching to: ${alternative.title}`
      })
    })

    const newBranchId = crypto.randomUUID()

    await fetch('/api/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: {
          type: 'Idea',
          text: `${alternative.title}: ${alternative.description}`,
          branchId: newBranchId
        },
        assumptions: []
      })
    })

    await fetch('/api/north-star', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId: newBranchId,
        text: northStarText
      })
    })

    await fetch('/api/ladder-steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId: newBranchId,
        text: alternative.description,
        order: 0
      })
    })

    await fetch('/api/workflow/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId: newBranchId,
        event: { type: 'CLARIFY' }
      })
    })

    savedNode.value = {
      id: crypto.randomUUID(),
      branchId: newBranchId
    } as Node
    problemText.value = `${alternative.title}: ${alternative.description}`
    currentView.value = 'clarification'
  } catch (error) {
    console.error('Failed to create new branch from alternative:', error)
  }
}

function openProgressLog() {
  if (pendingLogs.value.length === 0) return

  const firstPending = pendingLogs.value[0]
  if (!savedNode.value) {
    savedNode.value = {
      id: firstPending.nodeId,
      branchId: firstPending.branchId
    } as Node
  } else {
    savedNode.value.branchId = firstPending.branchId
  }

  currentView.value = 'progress-log'
}

async function checkBranchState() {
  if (!savedNode.value?.branchId) return

  try {
    const crisisResponse = await fetch(
      `/api/action-crisis/check?branchId=${savedNode.value.branchId}`
    )
    const crisisCheck = (await crisisResponse.json()) as {
      shouldShowCrisis: boolean
      missedPlans: number
      northStar?: string
    }

    if (crisisCheck.shouldShowCrisis) {
      actionCrisisData.value = {
        northStar: crisisCheck.northStar || '',
        missedPlans: crisisCheck.missedPlans,
        lowExpectancy: false
      }
      currentView.value = 'action-crisis'
    }
  } catch (error) {
    console.error('Failed to check branch state:', error)
  }
}

onMounted(() => {
  checkBranchState()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f9fafb;
}

.log-progress-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.banner-text {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.log-progress-button {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.log-progress-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
