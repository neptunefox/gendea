<template>
  <div class="build-page">
    <div class="flow-wrap">
      <div class="flow-track">
        <div class="flow-progress">
          <div class="flow-progress-fill" :style="{ width: `${flowProgress}%` }" />
        </div>
        <div class="flow-steps">
          <div
            v-for="(stage, index) in flowStages"
            :key="stage.id"
            :class="[
              'flow-step',
              { active: index === activeStageIndex, done: index < activeStageIndex }
            ]"
          >
            <span>{{ stage.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentView === 'capture'" class="capture-stage">
      <section class="build-hero-card">
        <div>
          <p class="hero-label">Build mode</p>
          <h1>Ground a saved spark or start fresh.</h1>
          <p>
            Progress feels gentler when you pick one idea, pin a North Star, then ladder tiny tests.
            Select a saved idea below or open a blank slot when you want to experiment.
          </p>
        </div>
        <div class="hero-actions">
          <button class="hero-primary" @click="startNewBuild">Start new build</button>
          <span class="hero-hint"
            >Psychological safety: you can always branch or archive later.</span
          >
        </div>
        <div v-if="savedIdeasLoading" class="saved-pill-row">Loading saved ideas…</div>
        <div v-else-if="savedIdeas.length" class="saved-pill-row">
          <span>Use saved spark:</span>
          <button
            v-for="idea in savedIdeasSlice"
            :key="idea.id"
            class="saved-pill"
            @click="handlePrefillFromSaved(idea.text)"
          >
            {{ formatIdeaLabel(idea.text) }}
          </button>
        </div>
      </section>

      <div v-if="prefilledIdea || problemText" class="focus-card">
        <p class="focus-label">Current focus</p>
        <h3>{{ problemText || prefilledIdea }}</h3>
        <button class="focus-button" @click="clearPrefill">Switch idea</button>
      </div>

      <TreeCanvas :initial-problem="prefilledIdea" @save="handleSave" />
    </div>

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

    <ResumeCard
      v-else-if="currentView === 'resume'"
      :north-star="resumeData.northStar"
      :ladder-steps="resumeData.ladderSteps"
      :last-a-i-batch="resumeData.lastAIBatch"
      :pause-timestamp="resumeData.pauseTimestamp"
      :progress-stage="resumeData.progressStage"
      @continue="handleResumeContinue"
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Node } from '../types/node'
import { useNodeSave } from '../composables/useNodeSave'

interface SavedIdea {
  id: string
  text: string
  status: 'exploring' | 'ready' | 'building' | 'done'
  createdAt: string
}

type ViewState =
  | 'capture'
  | 'confirmation'
  | 'ideation'
  | 'incubation'
  | 'resume'
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

interface FlowStage {
  id: string
  label: string
  views: ViewState[]
}

const flowStages: FlowStage[] = [
  {
    id: 'spark',
    label: 'Spark',
    views: ['capture', 'ideation', 'incubation', 'resume', 'ideation-second']
  },
  {
    id: 'shape',
    label: 'Clarify',
    views: ['clarification', 'planning', 'risk-assessment']
  },
  {
    id: 'plan',
    label: 'Plan',
    views: ['if-then-planning']
  },
  {
    id: 'test',
    label: 'Test',
    views: ['progress-log', 'break-recommendation', 'break-timer']
  },
  {
    id: 'reflect',
    label: 'Adjust',
    views: ['action-crisis', 'action-crisis-exit', 'archive-prompt', 'confirmation']
  }
]

const { saveNode } = useNodeSave()
const route = useRoute()

const currentView = ref<ViewState>('capture')
const savedNode = ref<Node | null>(null)
const nodeName = ref('')
const suggestedTags = ref<string[]>([])
const problemText = ref('')
const selectedPlan = ref('')
const preservedIdeas = ref<Array<{ text: string; isAI: boolean; label?: string }>>([])
const breakReason = ref<'low-energy' | 'stalled'>('low-energy')
const returnView = ref<ViewState>('capture')
const savedIdeas = ref<SavedIdea[]>([])
const savedIdeasLoading = ref(true)
const prefilledIdea = ref('')
const actionCrisisData = ref({
  northStar: '',
  missedPlans: 0,
  lowExpectancy: false
})
const isCompletingBranch = ref(false)
const resumeData = ref({
  northStar: '',
  ladderSteps: [] as Array<{ id: string; text: string; order: number }>,
  lastAIBatch: [] as Array<{ text: string; label: string }>,
  pauseTimestamp: Date.now(),
  progressStage: 'capture' as 'capture' | 'plan' | 'test'
})

const savedIdeasSlice = computed(() => savedIdeas.value.slice(0, 4))
const activeStageIndex = computed(() => {
  const index = flowStages.findIndex(stage => stage.views.includes(currentView.value))
  return index === -1 ? 0 : index
})
const flowProgress = computed(() => ((activeStageIndex.value + 1) / flowStages.length) * 100)

watch(
  () => route.query.idea,
  idea => {
    const nextIdea = Array.isArray(idea) ? idea[0] : idea
    if (typeof nextIdea === 'string' && nextIdea.trim().length > 0) {
      prefilledIdea.value = nextIdea
      currentView.value = 'capture'
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchSavedIdeas()
})

async function fetchSavedIdeas() {
  savedIdeasLoading.value = true
  try {
    const response = await $fetch<{ ideas: SavedIdea[] }>('/api/saved-ideas')
    savedIdeas.value = response.ideas
  } catch (error) {
    console.error('Failed to load saved ideas:', error)
  } finally {
    savedIdeasLoading.value = false
  }
}

async function handleSave(data: { problem: string; assumptions: string[]; isAnonymous: boolean }) {
  try {
    const result = await saveNode(data)
    savedNode.value = result.node
    nodeName.value = result.nodeName
    suggestedTags.value = result.suggestedTags
    problemText.value = data.problem
    prefilledIdea.value = ''
    currentView.value = 'if-then-planning'
  } catch (error) {
    console.error('Failed to save node:', error)
  }
}

function startNewBuild() {
  prefilledIdea.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handlePrefillFromSaved(text: string) {
  prefilledIdea.value = text
  problemText.value = text
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatIdeaLabel(text: string) {
  return text.length > 48 ? `${text.slice(0, 45)}…` : text
}

function clearPrefill() {
  prefilledIdea.value = ''
  problemText.value = ''
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

async function handleTimerComplete() {
  if (!savedNode.value?.branchId) {
    currentView.value = 'ideation-second'
    return
  }

  try {
    const branchResponse = await fetch(`/api/branch/${savedNode.value.branchId}`)
    const branchData = (await branchResponse.json()) as {
      northStar: { text: string } | null
      ladderSteps: Array<{ id: string; text: string; order: number }>
    }

    resumeData.value = {
      northStar: branchData.northStar?.text || '',
      ladderSteps: branchData.ladderSteps || [],
      lastAIBatch: preservedIdeas.value
        .filter(idea => idea.isAI)
        .map(idea => ({ text: idea.text, label: idea.label || 'AI' })),
      pauseTimestamp: Date.now(),
      progressStage: 'capture'
    }

    currentView.value = 'resume'
  } catch (error) {
    console.error('Failed to fetch resume data:', error)
    currentView.value = 'ideation-second'
  }
}

function handleResumeContinue() {
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
</script>

<style scoped>
.build-page {
  min-height: 100vh;
  padding: 2rem;
  background: #faf8f6;
}

.flow-wrap {
  max-width: 960px;
  margin: 0 auto 1.5rem;
}

.flow-track {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1rem 1.25rem;
  box-shadow: 0 15px 35px rgba(36, 15, 12, 0.05);
}

.flow-progress {
  height: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 999px;
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.flow-progress-fill {
  height: 100%;
  background: linear-gradient(120deg, #ffbc8f, #f681c1);
  border-radius: inherit;
  transition: width 0.3s ease;
}

.flow-steps {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.flow-step {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c0b0a8;
}

.flow-step.active {
  color: #b4538d;
}

.flow-step.done {
  color: #6f8566;
}

.capture-stage {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.focus-card {
  background: white;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.focus-label {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9a6f53;
}

.focus-card h3 {
  margin: 0.2rem 0 0;
  flex: 1;
  color: #2f150f;
}

.focus-button {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  background: rgba(0, 0, 0, 0.06);
  font-weight: 600;
  cursor: pointer;
}

.build-hero-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 15px 30px rgba(36, 15, 12, 0.08);
}

.hero-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #9e7256;
  margin-bottom: 0.5rem;
}

.build-hero-card h1 {
  margin: 0 0 0.75rem;
  color: #2a140f;
}

.build-hero-card p {
  margin: 0;
  color: #5a4036;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.hero-primary {
  min-width: 44px;
  min-height: 44px;
  border: none;
  border-radius: 14px;
  padding: 0.85rem 1.75rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(120deg, #f6af7f, #ec6ad6);
  cursor: pointer;
  box-shadow: 0 12px 25px rgba(236, 106, 214, 0.25);
}

.hero-hint {
  font-size: 0.9rem;
  color: #8a6c5c;
}

.saved-pill-row {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  color: #6a4f43;
}

.saved-pill {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  background: white;
  cursor: pointer;
  min-height: 36px;
  font-weight: 600;
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
  min-width: 44px;
  min-height: 44px;
  padding: 0.875rem 2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.continue-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}
</style>
