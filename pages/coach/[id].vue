<template>
  <div class="coach-workspace">
    <div class="banner-wrapper">
      <FlowGuidanceBanner
        :suggestion="flowGuidance.currentSuggestion.value"
        :is-visible="flowGuidance.isVisible.value"
        @dismiss="flowGuidance.dismissSuggestion()"
        @action="handleFlowGuidanceAction"
      />
    </div>

    <div v-if="isLoading" class="loading-state">
      <Loader :size="32" class="spin" />
      <p>Loading workspace...</p>
    </div>

    <div v-else-if="!idea" class="error-state">
      <h2>Idea not found</h2>
      <router-link to="/coach" class="primary-btn">Back to projects</router-link>
    </div>

    <div v-else class="workspace-layout">
      <aside class="context-sidebar">
        <button class="back-btn" @click="$router.push('/coach')">
          <ArrowLeft :size="20" />
          All projects
        </button>

        <div class="idea-context">
          <h2>{{ idea.text }}</h2>

          <div v-if="northStar" class="north-star-card">
            <label>Why this matters</label>
            <p>{{ northStar }}</p>
          </div>

          <button v-else class="ghost-btn" @click="showNorthStarPrompt = true">
            + Add why this matters
          </button>
        </div>

        <CanvasPlanProgress :plan-summary="planSummary" @view-canvas="navigateToCanvas" />

        <div class="context-actions">
          <button class="ghost-btn" @click="backToExploring">← Back to exploring</button>
        </div>
      </aside>

      <main class="phase-area">
        <CommitPhase v-if="currentPhase === 'commit'" :idea="idea" @committed="handleCommitment" />
        <TestPhase
          v-else-if="currentPhase === 'test'"
          :idea="idea"
          :commitment="idea.testCommitment"
          @completed="handleTestComplete"
        />
        <LearnPhase v-else-if="currentPhase === 'learn'" :idea="idea" @next="handleNext" />
      </main>

      <aside class="tools-sidebar">
        <h3>Research tools</h3>
        <p class="tools-hint">Optional helpers based on behavioral science</p>

        <details class="tool-card">
          <summary>
            <span class="tool-icon">🔍</span>
            <span class="tool-name">Pre-mortem</span>
          </summary>
          <div class="tool-content">
            <PreMortemTool :idea="idea" />
          </div>
        </details>

        <details class="tool-card">
          <summary>
            <span class="tool-icon">📊</span>
            <span class="tool-name">Reference class</span>
          </summary>
          <div class="tool-content">
            <ReferenceClassTool :idea="idea" />
          </div>
        </details>
      </aside>
    </div>

    <transition name="modal">
      <div v-if="showNorthStarPrompt" class="modal-overlay" @click="showNorthStarPrompt = false">
        <div class="modal-card" @click.stop>
          <h3>Why does this matter?</h3>
          <p class="modal-hint">One sentence about why you care about this idea</p>
          <textarea
            v-model="northStarInput"
            placeholder="This matters because..."
            rows="3"
            autofocus
          />
          <div class="modal-actions">
            <button class="ghost-btn" @click="showNorthStarPrompt = false">Cancel</button>
            <button class="primary-btn" @click="saveNorthStar">Save</button>
          </div>
        </div>
      </div>
    </transition>

    <button
      v-if="idea"
      class="floating-toggle-btn"
      title="Switch to Canvas"
      @click="navigateToCanvas"
    >
      <LayoutGrid :size="18" />
      <span>Canvas</span>
    </button>

    <transition name="toast">
      <div v-if="showToast" class="toast">
        <Check :size="20" />
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Loader, Check, LayoutGrid } from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CanvasPlanProgress from '~/components/coach/CanvasPlanProgress.vue'
import CommitPhase from '~/components/coach/CommitPhase.vue'
import LearnPhase from '~/components/coach/LearnPhase.vue'
import PreMortemTool from '~/components/coach/PreMortemTool.vue'
import ReferenceClassTool from '~/components/coach/ReferenceClassTool.vue'
import TestPhase from '~/components/coach/TestPhase.vue'
import FlowGuidanceBanner from '~/components/FlowGuidanceBanner.vue'
import { useFlowGuidance } from '~/composables/useFlowGuidance'

interface SavedIdea {
  id: string
  text: string
  status: 'exploring' | 'ready' | 'building' | 'done'
  createdAt: string
  testCommitment?: {
    description: string
    when: string
    where: string
    successSignal: string
    committedAt: string
  }
  testResult?: {
    outcome: 'worked' | 'didnt-work' | 'didnt-try'
    learnings?: string
    completedAt: string
  }
  northStar?: string
}

interface PlanNode {
  id: string
  type: string
  text: string
  completed?: boolean
  coachOrigin?: boolean
}

interface PlanSummary {
  totalNodes: number
  taskNodes: PlanNode[]
  goalNodes: PlanNode[]
  completedTasks: number
  totalTasks: number
  progressPercent: number
  hasStructure: boolean
}

const route = useRoute()
const router = useRouter()
const flowGuidance = useFlowGuidance()

const idea = ref<SavedIdea | null>(null)
const planSummary = ref<PlanSummary | null>(null)
const isLoading = ref(true)
const showNorthStarPrompt = ref(false)
const northStarInput = ref('')
const showToast = ref(false)
const toastMessage = ref('')
let syncInterval: NodeJS.Timeout | null = null

const northStar = computed(() => idea.value?.northStar || '')

const currentPhase = computed(() => {
  if (!idea.value) return 'commit'
  if (idea.value.testResult) return 'learn'
  if (idea.value.testCommitment) return 'test'
  return 'commit'
})

async function loadIdea() {
  const ideaId = route.params.id as string
  try {
    const { ideas } = await $fetch<{ ideas: SavedIdea[] }>('/api/saved-ideas')
    idea.value = ideas.find(i => i.id === ideaId) || null
  } catch (error) {
    console.error('Failed to load idea:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadPlanSummary() {
  const ideaId = route.params.id as string
  try {
    planSummary.value = await $fetch<PlanSummary>(`/api/canvas/plan-summary/${ideaId}`)
    if (planSummary.value && !planSummary.value.hasStructure) {
      flowGuidance.showSuggestion(flowGuidance.suggestions.coachToCanvas)
    }
  } catch (error) {
    console.error('Failed to load plan summary:', error)
  }
}

async function saveNorthStar() {
  if (!idea.value || !northStarInput.value.trim()) return

  try {
    await $fetch(`/api/saved-ideas/${idea.value.id}`, {
      method: 'PATCH',
      body: { northStar: northStarInput.value.trim() }
    })

    if (idea.value) {
      idea.value.northStar = northStarInput.value.trim()
    }

    showNorthStarPrompt.value = false
    northStarInput.value = ''
    showToastMessage('North star saved')
  } catch (error) {
    console.error('Failed to save north star:', error)
    showToastMessage('Failed to save')
  }
}

async function navigateToCanvas() {
  const ideaId = route.params.id as string
  try {
    await $fetch(`/api/saved-ideas/${ideaId}`, {
      method: 'PATCH',
      body: { lastActiveView: 'canvas' }
    })
  } catch (error) {
    console.error('Failed to save view preference:', error)
  }
  router.push(`/canvas/${ideaId}`)
}

async function backToExploring() {
  if (!idea.value) return

  try {
    await $fetch(`/api/saved-ideas/${idea.value.id}`, {
      method: 'PATCH',
      body: { status: 'exploring' }
    })

    router.push('/')
  } catch (error) {
    console.error('Failed to update status:', error)
  }
}

function handleCommitment() {
  loadIdea()
  showToastMessage('Test committed')
}

function handleTestComplete() {
  loadIdea()
  showToastMessage('Test completed')
}

function handleNext(action: 'next-test' | 'back-to-exploring') {
  if (action === 'next-test') {
    loadIdea()
  } else {
    backToExploring()
  }
}

function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2200)
}

function handleFlowGuidanceAction() {
  const suggestion = flowGuidance.currentSuggestion.value
  if (suggestion?.icon === 'canvas') {
    flowGuidance.hideSuggestion()
    navigateToCanvas()
  }
}

async function saveLastActiveView() {
  const ideaId = route.params.id as string
  try {
    await $fetch(`/api/saved-ideas/${ideaId}`, {
      method: 'PATCH',
      body: { lastActiveView: 'coach' }
    })
  } catch (error) {
    console.error('Failed to save view preference:', error)
  }
}

async function syncData() {
  const ideaId = route.params.id as string
  try {
    const [ideasResponse, planResponse] = await Promise.all([
      $fetch<{ ideas: SavedIdea[] }>('/api/saved-ideas'),
      $fetch<PlanSummary>(`/api/canvas/plan-summary/${ideaId}`)
    ])
    const updated = ideasResponse.ideas.find(i => i.id === ideaId)
    if (updated && idea.value) {
      idea.value = updated
    }
    planSummary.value = planResponse
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

function startSync() {
  syncInterval = setInterval(syncData, 2000)
}

function stopSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

onMounted(() => {
  loadIdea()
  loadPlanSummary()
  saveLastActiveView()
  startSync()
  flowGuidance.initialize()
})

onUnmounted(() => {
  stopSync()
})
</script>

<style scoped>
.coach-workspace {
  min-height: 100vh;
  background: var(--color-bg);
  padding: var(--space-8) var(--space-6);
}

.banner-wrapper {
  max-width: 1400px;
  margin: 0 auto var(--space-4);
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: var(--space-6);
}

.banner-wrapper > * {
  grid-column: 2;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-12) var(--space-6);
  color: var(--color-text-secondary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.workspace-layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: var(--space-6);
  align-items: start;
}

.context-sidebar,
.tools-sidebar {
  position: sticky;
  top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.back-btn:hover {
  background: var(--color-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.idea-context {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}

.idea-context h2 {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-4) 0;
  line-height: 1.4;
}

.north-star-card {
  padding: var(--space-4);
  background: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.north-star-card label {
  display: block;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.north-star-card p {
  font-size: var(--text-sm);
  color: var(--color-text);
  margin: 0;
  line-height: 1.6;
}

.ghost-btn {
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  width: 100%;
}

.ghost-btn:hover {
  background: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.floating-toggle-btn {
  position: fixed;
  bottom: var(--space-5);
  right: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.floating-toggle-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.context-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.phase-area {
  min-height: 400px;
}

.tools-sidebar h3 {
  font-size: var(--text-base);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  margin: 0;
}

.tools-hint {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin: calc(var(--space-2) * -1) 0 0 0;
  line-height: 1.4;
}

.tool-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--duration-fast) var(--ease-out);
}

.tool-card:hover {
  border-color: var(--color-primary);
}

.tool-card summary {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  cursor: pointer;
  list-style: none;
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  font-size: var(--text-sm);
}

.tool-card summary::-webkit-details-marker {
  display: none;
}

.tool-icon {
  font-size: var(--text-xl);
}

.tool-content {
  padding: 0 var(--space-4) var(--space-4);
  border-top: 1px solid var(--color-border);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
}

.modal-card h3 {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-2) 0;
}

.modal-hint {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-4) 0;
}

.modal-card textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: inherit;
  resize: vertical;
  margin-bottom: var(--space-4);
}

.modal-card textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-ring);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

.primary-btn {
  padding: var(--space-3) var(--space-5);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.primary-btn:hover {
  background: var(--color-primary-hover);
}

.toast {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  color: var(--color-text);
  font-weight: var(--weight-semibold);
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .banner-wrapper {
    display: block;
  }

  .workspace-layout {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .context-sidebar,
  .tools-sidebar {
    position: static;
  }
}
</style>
