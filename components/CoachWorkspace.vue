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
            @proceed="activateSection('plan')"
            @show-if-then="handleShowIfThenFromClarify"
          />
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
import { ref, watch, nextTick } from 'vue'
import ClarificationView from '~/components/ClarificationView.vue'
import PlanningView from '~/components/PlanningView.vue'
import IfThenPlanning from '~/components/IfThenPlanning.vue'
import ProgressLogView from '~/components/ProgressLogView.vue'
import { useNodeSave } from '~/composables/useNodeSave'
import { Loader } from 'lucide-vue-next'

interface SectionDefinition {
  id: 'clarify' | 'plan' | 'progress'
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

const clarifySection = ref<HTMLElement | null>(null)
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
        : sectionId === 'plan'
          ? planSection.value
          : progressSection.value
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function handleShowIfThenFromClarify() {
  activateSection('plan')
  showIfThenPlanning.value = true
  selectedPlan.value = `Translate ladder step "${props.idea}" into action`
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
</script>

<style scoped>
.coach-workspace {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.coach-loader,
.coach-error,
.coach-empty {
  height: 200px;
  border: 1px dashed rgba(98, 76, 138, 0.3);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #5f4a82;
  gap: 0.5rem;
}

.coach-sections {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.coach-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.coach-tab {
  border: 1px solid rgba(98, 76, 138, 0.2);
  background: white;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #4f3a76;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.coach-tab.active {
  background: rgba(98, 76, 138, 0.15);
  border-color: rgba(98, 76, 138, 0.45);
  color: #2f1c4f;
}

.coach-section {
  padding: 1rem;
  border: 1px solid rgba(94, 80, 135, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 30px rgba(21, 0, 36, 0.08);
}

.coach-section header {
  margin-bottom: 0.75rem;
}

.coach-section h4 {
  margin: 0;
  font-size: 1rem;
  color: #2c1f3f;
}

.coach-section p {
  margin: 0.2rem 0 0;
  color: #6c5b88;
  font-size: 0.9rem;
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

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
