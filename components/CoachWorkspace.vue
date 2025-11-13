<template>
  <div class="coach-workspace">
    <div v-if="!idea" class="coach-empty">
      <p>Select an idea to unlock guided coaching.</p>
    </div>

    <div v-else>
      <div v-if="setupLoading" class="coach-loader">
        <Loader :size="20" class="spin" />
        <p>Spinning up a workspace…</p>
      </div>

      <div v-else-if="creationError" class="coach-error">
        <p>{{ creationError }}</p>
        <button class="primary small" @click="initializeWorkspace(true)">Retry</button>
      </div>

      <div v-else-if="!branchId" class="coach-empty">
        <p>Workspace unavailable. Try selecting a different idea.</p>
      </div>

      <div v-else class="coach-sections">
        <div class="coach-tabs">
          <button
            v-for="section in sections"
            :key="section.id"
            class="coach-tab"
            :class="{ active: activeSection === section.id }"
            @click="activateSection(section.id)"
          >
            {{ section.label }}
          </button>
        </div>

        <section ref="clarifySection" class="coach-section">
          <header>
            <h4>Clarify</h4>
            <p>Pin your North Star and three ladder steps.</p>
          </header>
          <ClarificationView
            :branch-id="branchId"
            @proceed="activateSection('ideate')"
            @show-if-then="handleShowIfThenFromClarify"
          />
        </section>

        <section ref="ideateSection" class="coach-section">
          <header>
            <h4>Ideate</h4>
            <p>Generate diverse approaches with AI help (optional).</p>
          </header>
          <div class="ideate-content">
            <p class="ideate-hint">
              Fill 3+ ideas yourself, then ask AI for wild alternatives. Or skip to planning.
            </p>
            <div class="ideate-slots">
              <div v-for="n in 6" :key="n" class="idea-slot-mini">
                <span class="slot-num">{{ n }}</span>
                <textarea
                  v-model="ideaSlots[n - 1]"
                  :placeholder="n <= 3 ? 'Your idea...' : 'AI suggestion...'"
                  :disabled="n > 3 && !isGeneratingIdeas"
                  :readonly="n > 3"
                  class="slot-input-mini"
                  rows="2"
                />
              </div>
            </div>
            <div class="ideate-actions">
              <button class="ghost small" :disabled="isGeneratingIdeas" @click="generateAIIdeas">
                {{ isGeneratingIdeas ? 'Generating...' : 'Ask AI for alternatives' }}
              </button>
              <button class="primary small" @click="activateSection('plan')">Skip to Plan →</button>
            </div>
          </div>
        </section>

        <section ref="planSection" class="coach-section">
          <header>
            <h4>Plan</h4>
            <p>Generate micro plans with constraints, then lock an if-then.</p>
          </header>
          <PlanningView
            :branch-id="branchId"
            :idea="idea"
            @proceed="activateSection('progress')"
            @show-if-then="handleShowIfThenFromPlanning"
          />

          <IfThenPlanning
            v-if="showIfThenPlanning"
            :branch-id="branchId"
            :plan-context="selectedPlan"
            @save="handleIfThenPlanSave"
          />
        </section>

        <section ref="progressSection" class="coach-section">
          <header>
            <h4>Progress</h4>
            <p>Log evidence, capture energy, and request next commitments.</p>
          </header>
          <ProgressLogView
            :branch-id="branchId"
            @complete="handleProgressComplete"
            @show-if-then="handleShowIfThenFromProgress"
            @mark-complete="handleMarkComplete"
          />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader } from 'lucide-vue-next'
import { ref, watch, nextTick } from 'vue'

import ClarificationView from '~/components/ClarificationView.vue'
import IfThenPlanning from '~/components/IfThenPlanning.vue'
import PlanningView from '~/components/PlanningView.vue'
import ProgressLogView from '~/components/ProgressLogView.vue'
import { useNodeSave } from '~/composables/useNodeSave'

interface SectionDefinition {
  id: 'clarify' | 'ideate' | 'plan' | 'progress'
  label: string
}

const props = defineProps<{
  idea: string
  showToast?: (message: string) => void
}>()

const { saveNode } = useNodeSave()

const MAP_KEY = 'coach-branch-map'

const sections: SectionDefinition[] = [
  { id: 'clarify', label: 'Clarify' },
  { id: 'ideate', label: 'Ideate' },
  { id: 'plan', label: 'Plan' },
  { id: 'progress', label: 'Progress' }
]

const branchId = ref<string>('')
const nodeId = ref<string>('')
const setupLoading = ref(false)
const creationError = ref('')
const activeSection = ref<SectionDefinition['id']>('clarify')
const showIfThenPlanning = ref(false)
const selectedPlan = ref('')
const ideaSlots = ref<string[]>(['', '', '', '', '', ''])
const isGeneratingIdeas = ref(false)

const clarifySection = ref<HTMLElement | null>(null)
const ideateSection = ref<HTMLElement | null>(null)
const planSection = ref<HTMLElement | null>(null)
const progressSection = ref<HTMLElement | null>(null)

watch(
  () => props.idea,
  idea => {
    if (idea && idea.trim().length > 0) {
      initializeWorkspace(false)
    } else {
      branchId.value = ''
      nodeId.value = ''
    }
  },
  { immediate: true }
)

function loadBranchMap(): Record<string, { branchId: string; nodeId: string }> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(MAP_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch (error) {
    console.error('Failed to parse branch map', error)
    return {}
  }
}

function saveBranchMap(map: Record<string, { branchId: string; nodeId: string }>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MAP_KEY, JSON.stringify(map))
}

function ideaKey(idea: string) {
  return idea.trim().toLowerCase()
}

async function initializeWorkspace(forceRefresh: boolean) {
  if (!props.idea || typeof window === 'undefined') return

  setupLoading.value = true
  creationError.value = ''
  showIfThenPlanning.value = false

  try {
    const map = loadBranchMap()
    const key = ideaKey(props.idea)
    const existing = !forceRefresh ? map[key] : undefined

    if (existing) {
      branchId.value = existing.branchId
      nodeId.value = existing.nodeId
    } else {
      const result = await saveNode({
        problem: props.idea,
        assumptions: [],
        isAnonymous: false
      })

      branchId.value = result.node.branchId
      nodeId.value = result.node.id

      map[key] = {
        branchId: branchId.value,
        nodeId: nodeId.value
      }
      saveBranchMap(map)
    }
  } catch (error) {
    console.error('Failed to prepare coach workspace', error)
    creationError.value = 'Could not prepare workspace for this idea.'
  } finally {
    setupLoading.value = false
  }
}

function activateSection(sectionId: SectionDefinition['id']) {
  activeSection.value = sectionId
  nextTick(() => {
    const target =
      sectionId === 'clarify'
        ? clarifySection.value
        : sectionId === 'ideate'
          ? ideateSection.value
          : sectionId === 'plan'
            ? planSection.value
            : progressSection.value
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function handleShowIfThenFromClarify() {
  activateSection('ideate')
}

function handleShowIfThenFromPlanning(plan: string) {
  selectedPlan.value = plan
  showIfThenPlanning.value = true
  activateSection('plan')
}

function handleShowIfThenFromProgress() {
  showIfThenPlanning.value = true
  selectedPlan.value = 'Log follow-up action'
  activateSection('plan')
}

async function handleIfThenPlanSave(plan: {
  action: string
  date: string
  time: string
  place: string
}) {
  if (!branchId.value || !nodeId.value) return
  try {
    await $fetch('/api/if-then-plan', {
      method: 'PUT',
      body: {
        branchId: branchId.value,
        nodeId: nodeId.value,
        ifThenPlan: plan
      }
    })
    showIfThenPlanning.value = false
    props.showToast?.('If-then plan saved')
  } catch (error) {
    console.error('Failed to save if-then plan', error)
    props.showToast?.('Could not save plan')
  }
}

function handleProgressComplete() {
  props.showToast?.('Progress logged')
}

function handleMarkComplete() {
  props.showToast?.('Marked complete — archive when ready')
}

async function generateAIIdeas() {
  const userIdeas = ideaSlots.value.slice(0, 3).filter(idea => idea.trim().length > 0)

  if (userIdeas.length < 3) {
    props.showToast?.('Fill at least 3 ideas first')
    return
  }

  isGeneratingIdeas.value = true

  try {
    const response = await $fetch<{ ideas: Array<{ text: string; label: string }> }>(
      '/api/diverge',
      {
        method: 'POST',
        body: {
          problem: props.idea,
          userIdeas: userIdeas
        }
      }
    )

    ideaSlots.value[3] = response.ideas[0]?.text || ''
    ideaSlots.value[4] = response.ideas[1]?.text || ''
    ideaSlots.value[5] = response.ideas[2]?.text || ''

    props.showToast?.('AI alternatives generated')
  } catch (error) {
    console.error('Failed to generate AI ideas:', error)
    props.showToast?.('Failed to generate ideas')
  } finally {
    isGeneratingIdeas.value = false
  }
}
</script>

<style scoped>
.coach-workspace {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.coach-loader,
.coach-error,
.coach-empty {
  min-height: 180px;
  border: 1px dashed rgba(212, 117, 111, 0.25);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #835872;
  gap: 0.75rem;
  padding: 2rem;
  background: rgba(255, 246, 239, 0.3);
}

.coach-sections {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.coach-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  padding: 0 0 1rem;
  border-bottom: 1px solid rgba(212, 117, 111, 0.1);
  margin-bottom: 1rem;
}

.coach-tab {
  border: 1px solid rgba(212, 117, 111, 0.2);
  background: transparent;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.8rem;
  color: #835872;
  cursor: pointer;
  transition: all 0.2s ease;
}

.coach-tab:hover {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.3);
}

.coach-tab.active {
  background: linear-gradient(135deg, #ffd7bd, #f8c0ff);
  border-color: #d4756f;
  color: #2f1810;
  box-shadow: 0 2px 8px rgba(212, 117, 111, 0.2);
}

.coach-section {
  padding: 0 0 1.5rem;
  border: none;
  background: transparent;
  box-shadow: none;
}

.coach-section:last-child {
  padding-bottom: 0;
}

.coach-section header {
  margin-bottom: 1rem;
}

.coach-section h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #2f1810;
  font-weight: 700;
}

.coach-section p {
  margin: 0.3rem 0 0;
  color: #835872;
  font-size: 0.9rem;
  line-height: 1.5;
}

:deep(.clarification-view),
:deep(.planning-view),
:deep(.progress-log-view),
:deep(.if-then-planning) {
  padding: 0;
  background: transparent;
  box-shadow: none;
}

:deep(.clarification-view .header),
:deep(.clarification-view .proceed-section),
:deep(.planning-view .title),
:deep(.progress-log-view .title) {
  text-align: left;
}

:deep(.planning-view) {
  padding-top: 0.5rem;
}

:deep(.progress-log-view) {
  padding-top: 0.5rem;
}

.ideate-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ideate-hint {
  margin: 0;
  font-size: 0.9rem;
  color: #835872;
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: rgba(255, 215, 189, 0.15);
  border-radius: 10px;
  border-left: 3px solid #d4756f;
}

.ideate-slots {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.idea-slot-mini {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 0.85rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(212, 117, 111, 0.15);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.idea-slot-mini:hover {
  border-color: rgba(212, 117, 111, 0.3);
  box-shadow: 0 2px 8px rgba(212, 117, 111, 0.08);
}

.slot-num {
  font-size: 0.75rem;
  font-weight: 700;
  color: #d4756f;
  min-width: 1.5rem;
  text-align: center;
  background: rgba(212, 117, 111, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
}

.slot-input-mini {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: #2f1810;
  outline: none;
  resize: vertical;
  min-height: 2.5rem;
  line-height: 1.5;
  font-family: inherit;
  padding: 0;
}

.slot-input-mini:disabled,
.slot-input-mini:read-only {
  cursor: default;
  opacity: 0.9;
}

.slot-input-mini::placeholder {
  color: #9b7455;
  font-style: italic;
}

.ideate-actions {
  display: flex;
  gap: 0.65rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.primary {
  border: none;
  border-radius: 12px;
  padding: 0.65rem 1.25rem;
  font-weight: 600;
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(246, 113, 118, 0.25);
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(246, 113, 118, 0.35);
}

.primary.small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.ghost {
  border: 1px solid rgba(212, 117, 111, 0.25);
  border-radius: 12px;
  padding: 0.65rem 1.25rem;
  background: transparent;
  color: #835872;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.ghost:hover {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.4);
  color: #2f1810;
}

.ghost.small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
