<template>
  <div class="coach-workspace">
    <FlowGuidanceBanner
      :suggestion="flowGuidance.currentSuggestion.value"
      :is-visible="flowGuidance.isVisible.value"
      @dismiss="flowGuidance.dismissSuggestion()"
      @action="handleFlowGuidanceAction"
    />

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
  background: linear-gradient(135deg, #fff5f0 0%, #fef8f5 100%);
  padding: 2rem 1.5rem 4rem;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: #8a7566;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.workspace-layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 2rem;
  align-items: start;
}

.context-sidebar,
.tools-sidebar {
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid #f0e5e0;
  border-radius: 10px;
  color: #8a7566;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  border-color: #d4756f;
  color: #d4756f;
}

.idea-context {
  background: linear-gradient(135deg, #fefaf5 0%, #fef5f0 100%);
  border: 1px solid #f0e5e0;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.idea-context h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #40312b;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.north-star-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(212, 117, 111, 0.1);
}

.north-star-card label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #d4756f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.north-star-card p {
  font-size: 0.9375rem;
  color: #40312b;
  margin: 0;
  line-height: 1.6;
}

.ghost-btn {
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid rgba(212, 117, 111, 0.25);
  border-radius: 10px;
  color: #8a7566;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.ghost-btn:hover {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.4);
  color: #d4756f;
}

.floating-toggle-btn {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  color: #40312b;
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.floating-toggle-btn:hover {
  background: white;
  border-color: #d4756f;
  color: #d4756f;
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.2);
}

.context-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.phase-area {
  min-height: 400px;
}

.tools-sidebar h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #40312b;
  margin: 0;
}

.tools-hint {
  font-size: 0.8125rem;
  color: #b8a89d;
  margin: -0.5rem 0 0 0;
  line-height: 1.4;
}

.tool-card {
  background: linear-gradient(135deg, #fefaf5 0%, #fef5f0 100%);
  border: 1px solid #f0e5e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.tool-card:hover {
  border-color: #d4756f;
}

.tool-card summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  list-style: none;
  font-weight: 600;
  color: #40312b;
  font-size: 0.9375rem;
}

.tool-card summary::-webkit-details-marker {
  display: none;
}

.tool-icon {
  font-size: 1.25rem;
}

.tool-content {
  padding: 0 1rem 1rem;
  border-top: 1px solid rgba(212, 117, 111, 0.1);
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
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #40312b;
  margin: 0 0 0.5rem 0;
}

.modal-hint {
  font-size: 0.9375rem;
  color: #8a7566;
  margin: 0 0 1rem 0;
}

.modal-card textarea {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #f0e5e0;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;
}

.modal-card textarea:focus {
  outline: none;
  border-color: #d4756f;
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.primary-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(246, 113, 118, 0.25);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(246, 113, 118, 0.35);
}

.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border: 2px solid #d4756f;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  color: #40312b;
  font-weight: 600;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .workspace-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .context-sidebar,
  .tools-sidebar {
    position: static;
  }
}
</style>
