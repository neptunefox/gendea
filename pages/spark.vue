<template>
  <div class="spark-page">
    <div class="ambient orb-one" />
    <div class="ambient orb-two" />

    <div class="spark-layout">
      <section class="journal-panel glass">
        <header class="journal-hero">
          <div>
            <p class="hero-label">Creative journal</p>
            <h1>Light a thread whenever you feel blank.</h1>
            <p>
              Drop one line, let the run blossom in parallel lanes, and keep the sparks that feel
              alive. No prep, no force—just a gentle place to wander.
            </p>
          </div>
          <div class="hero-actions">
            <div v-if="entries.length > 0" class="thread-stats">
              <p>Thread depth · {{ entries.length }} run{{ entries.length === 1 ? '' : 's' }}</p>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${threadProgress}%` }" />
              </div>
              <span>Last spark · {{ formatRelative(entries[0].timestamp) }}</span>
            </div>
            <button class="pinboard-button" @click="toggleBoardDrawer(true)">
              <LayoutGrid :size="16" />
              Pinboard ({{ savedIdeas.length }})
            </button>
          </div>
        </header>

        <div class="input-card glass">
          <textarea
            v-model="input"
            class="spark-input"
            rows="3"
            placeholder="I want to build... learn... remix..."
            @keydown.enter.exact.prevent="handleGenerate()"
          />
          <div class="input-actions">
            <button
              class="primary"
              :disabled="!canGenerate || isGenerating"
              @click="handleGenerate()"
            >
              <Lightbulb v-if="!isGenerating" :size="18" />
              <Loader v-else :size="18" class="spin" />
              {{ isGenerating ? 'Weaving ideas' : 'Generate' }}
            </button>
            <button v-if="entries.length" class="ghost" @click="handleResetThread">
              Reset thread
            </button>
          </div>
          <div v-if="entries.length" class="thread-memory">
            <span>Memory on · avoids repeats</span>
            <span>Anchor: {{ lastPrompt }}</span>
          </div>
        </div>

        <div v-if="isGenerating" class="loading-card">
          <Loader :size="28" class="spin" />
          <p>Parallel divergers are stitching new angles…</p>
        </div>

        <div v-else-if="entries.length" class="journal-feed">
          <article
            v-for="(entry, index) in entries"
            :key="entry.id"
            class="journal-entry"
            :class="{ latest: index === 0 }"
          >
            <div class="entry-header">
              <div>
                <p class="entry-seq">Run {{ entries.length - index }}</p>
                <p class="entry-time">{{ formatFull(entry.timestamp) }}</p>
              </div>
              <button class="link-button" @click="prefillInput(entry.prompt)">
                Revisit prompt
              </button>
            </div>

            <p class="entry-prompt">{{ entry.prompt }}</p>

            <div class="idea-deck">
              <div
                v-for="(idea, ideaIndex) in entry.coreIdeas"
                :key="`${entry.id}-core-${ideaIndex}`"
                class="idea-pill"
              >
                <p>{{ idea.text }}</p>
                <div class="pill-actions">
                  <button class="link-button" @click="handleSaveIdea(idea.text)">
                    <BookmarkPlus :size="14" />
                    Save
                  </button>
                  <button class="link-button" @click="handleBranch(idea.text)">Branch</button>
                  <button class="link-button" @click="handleSendToBuild(idea.text)">Build</button>
                  <button class="link-button" @click="openCoachPanel(idea.text)">
                    <Sparkles :size="14" />
                    Coach
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="placeholder-card">
          <Sparkles :size="32" />
          <p>Drop the vaguest idea. We’ll keep the thread and draw new riffs each run.</p>
        </div>
      </section>
    </div>

    <transition name="drawer">
      <aside v-if="showBoardDrawer" class="board-drawer glass">
        <header class="board-header">
          <div>
            <p class="board-label">Pinboard</p>
            <h2>Saved sparks</h2>
          </div>
          <div class="board-actions">
            <NuxtLink to="/saved" class="ghost small">Open board</NuxtLink>
            <button class="ghost icon" @click="toggleBoardDrawer(false)">
              <X :size="16" />
            </button>
          </div>
        </header>

        <div v-if="boardLoading" class="board-loading">
          <Loader :size="24" class="spin" />
        </div>

        <div v-else-if="savedIdeas.length === 0" class="board-empty">
          <p>No pins yet.</p>
          <p class="board-empty-sub">Tap “Save” on any idea to keep it close.</p>
        </div>

        <div v-else class="board-content">
          <div class="board-scroll">
            <div class="board-meta">
              <div>
                <p class="board-total">{{ boardSummary.total }} saved</p>
                <p class="board-ready">{{ boardSummary.counts.ready || 0 }} ready to build</p>
              </div>
              <div class="board-filters">
                <button
                  v-for="option in boardFilterOptions"
                  :key="option.value"
                  class="filter-chip"
                  :class="{ active: boardFilter === option.value }"
                  @click="boardFilter = option.value"
                >
                  <span>{{ option.label }}</span>
                  <span class="chip-count">
                    {{
                      option.value === 'all'
                        ? boardSummary.total
                        : (boardSummary.counts[option.value] ?? 0)
                    }}
                  </span>
                </button>
              </div>
            </div>

            <div v-if="boardIdeas.length === 0" class="board-filter-empty">
              <p>No pins in this lane yet.</p>
              <button class="link-button" @click="boardFilter = 'all'">Show all pins</button>
            </div>

            <div v-else class="board-grid">
              <div v-for="idea in boardIdeas" :key="idea.id" class="pin-card">
                <div class="pin-card-head">
                  <span class="status-chip" :data-status="idea.status">
                    {{ ideaStatusLabels[idea.status] }}
                  </span>
                  <small>{{ formatRelative(new Date(idea.createdAt).getTime()) }}</small>
                </div>
                <p class="pin-card-text">{{ idea.text }}</p>
                <div class="card-actions">
                  <button class="link-button" @click="handleSendToBuild(idea.text)">Build</button>
                  <button class="link-button" @click="copyIdea(idea.text)">Copy</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </transition>

    <transition name="drawer">
      <aside v-if="coachState.open" class="coach-panel glass">
        <header class="coach-header">
          <div>
            <p class="coach-label">Idea coach</p>
            <h3>{{ coachState.idea }}</h3>
            <p v-if="coachState.lane" class="coach-lane">{{ coachState.lane }}</p>
          </div>
          <div class="coach-actions">
            <button class="ghost small" :disabled="coachState.loading" @click="refreshCoachTips">
              {{ coachState.loading ? 'Refreshing' : 'Refresh tips' }}
            </button>
            <button class="ghost icon" @click="closeCoachPanel">
              <X :size="16" />
            </button>
          </div>
        </header>

        <div v-if="coachState.loading" class="coach-loading">
          <Loader :size="20" class="spin" />
          <p>Personalizing cues…</p>
        </div>

        <div v-else-if="coachState.error" class="coach-error">
          <p>{{ coachState.error }}</p>
          <button class="primary small" @click="refreshCoachTips">Try again</button>
        </div>

        <div v-else class="coach-body">
          <div v-if="coachState.tips" class="coach-grid">
            <article class="coach-card">
              <p class="coach-tag">Plan cue</p>
              <h4>{{ coachState.tips.plan.title }}</h4>
              <p class="coach-copy">{{ coachState.tips.plan.summary }}</p>
              <div class="coach-meta">
                <span>{{ coachState.tips.plan.action }}</span>
                <small>{{ coachState.tips.plan.when }} · {{ coachState.tips.plan.where }}</small>
              </div>
              <button class="ghost small" @click="applyCoachPlanSuggestion">
                Apply suggestion
              </button>
              <div class="plan-form">
                <label>Action</label>
                <input v-model="planCue.action" placeholder="Sketch 3 covers" />
                <label>When</label>
                <input v-model="planCue.when" placeholder="Tonight 7:30" />
                <label>Where</label>
                <input v-model="planCue.where" placeholder="Kitchen table" />
                <button class="primary small" @click="handlePlanCueSave">Save cue</button>
                <p v-if="planCueSaved" class="plan-hint">Saved—check History anytime.</p>
              </div>
            </article>

            <article class="coach-card">
              <p class="coach-tag">Incubation</p>
              <h4>{{ coachState.tips.incubation.title }}</h4>
              <p class="coach-copy">{{ coachState.tips.incubation.summary }}</p>
              <p class="coach-meta">{{ coachState.tips.incubation.activity }}</p>
              <div class="coach-card-actions">
                <button class="link-button" @click="startIncubationTimer()">
                  Start 10-min timer
                </button>
              </div>
            </article>

            <article class="coach-card">
              <p class="coach-tag">Novelty</p>
              <h4>{{ coachState.tips.novelty.title }}</h4>
              <p class="coach-copy">{{ coachState.tips.novelty.summary }}</p>
              <p class="coach-meta">{{ coachState.tips.novelty.prompt }}</p>
              <div class="coach-card-actions">
                <button
                  class="link-button"
                  @click="copyCoachPrompt(coachState.tips.novelty.prompt)"
                >
                  Copy prompt
                </button>
              </div>
            </article>
          </div>
          <p v-if="coachState.tips" class="coach-mantra">{{ coachState.tips.mantra }}</p>
          <CoachWorkspace :idea="coachState.idea" :show-toast="showToastMessage" />
        </div>
      </aside>
    </transition>

    <transition name="toast">
      <div v-if="showToast" class="toast">
        <Check :size="20" />
        {{ toastMessage }}
      </div>
    </transition>

    <div v-if="timerActive" class="timer-banner">
      <Clock :size="16" />
      <span>Incubating · {{ formattedTimer }}</span>
      <button class="link-button" @click="stopIncubationTimer(true)">Dismiss</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Lightbulb,
  Loader,
  Check,
  Sparkles,
  BookmarkPlus,
  Clock,
  LayoutGrid,
  X
} from 'lucide-vue-next'
import CoachWorkspace from '~/components/CoachWorkspace.vue'

interface SparkIdea {
  text: string
}

interface SparkLens {
  id: string
  title: string
  description: string
  researchCue: string
  whyItMatters: string
  ideas: SparkIdea[]
}

interface SparkNudge {
  id: string
  title: string
  body: string
  actionLabel?: string
  researchCue: string
}

interface JournalEntry {
  id: string
  prompt: string
  timestamp: number
  coreIdeas: SparkIdea[]
  lenses: SparkLens[]
  nudges: SparkNudge[]
}

interface SavedIdea {
  id: string
  text: string
  status: 'exploring' | 'ready' | 'building' | 'done'
  createdAt: string
}

type SavedIdeaStatus = SavedIdea['status']
type BoardFilter = SavedIdeaStatus | 'all'

interface CoachPlanSuggestion {
  title: string
  summary: string
  action: string
  when: string
  where: string
}

interface CoachIncubationSuggestion {
  title: string
  summary: string
  activity: string
}

interface CoachNoveltySuggestion {
  title: string
  summary: string
  prompt: string
}

interface IdeaCoachTips {
  plan: CoachPlanSuggestion
  incubation: CoachIncubationSuggestion
  novelty: CoachNoveltySuggestion
  mantra: string
}

interface SparkRunRecord {
  id: string
  prompt: string
  coreIdeas: SparkIdea[]
  lenses: SparkLens[]
  nudges: SparkNudge[]
  createdAt: string
}

const STORAGE_KEY = 'spark-thread-journal'
const PLAN_CUE_KEY = 'spark-plan-cue'

const input = ref('')
const entries = ref<JournalEntry[]>([])
const isGenerating = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const lastPrompt = ref('')
const timerActive = ref(false)
const timerSeconds = ref(600)
const savedIdeas = ref<SavedIdea[]>([])
const boardFilter = ref<BoardFilter>('all')
const statusOrder: SavedIdeaStatus[] = ['exploring', 'ready', 'building', 'done']
const ideaStatusLabels: Record<SavedIdeaStatus, string> = {
  exploring: 'Exploring',
  ready: 'Ready to build',
  building: 'In build',
  done: 'Shipped'
}
const boardFilterOptions: Array<{ value: BoardFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'exploring', label: 'Exploring' },
  { value: 'ready', label: 'Ready' },
  { value: 'building', label: 'Building' },
  { value: 'done', label: 'Done' }
]
const boardSummary = computed(() => {
  const counts = statusOrder.reduce(
    (acc, status) => {
      acc[status] = 0
      return acc
    },
    {} as Record<SavedIdeaStatus, number>
  )

  savedIdeas.value.forEach(idea => {
    counts[idea.status] += 1
  })

  return {
    total: savedIdeas.value.length,
    counts
  }
})
const boardIdeas = computed(() =>
  boardFilter.value === 'all'
    ? savedIdeas.value
    : savedIdeas.value.filter(idea => idea.status === boardFilter.value)
)
const boardLoading = ref(true)
const showBoardDrawer = ref(false)
const planCue = reactive({
  action: '',
  when: '',
  where: ''
})
const planCueSaved = ref(false)
const resumingRunId = ref<string | null>(null)
const coachState = reactive<{
  open: boolean
  loading: boolean
  idea: string
  lane: string
  tips: IdeaCoachTips | null
  error: string
}>({
  open: false,
  loading: false,
  idea: '',
  lane: '',
  tips: null,
  error: ''
})
let timerInterval: NodeJS.Timeout | null = null

const router = useRouter()
const route = useRoute()

const canGenerate = computed(() => input.value.trim().length > 0)
const threadProgress = computed(() => Math.min(entries.value.length * 25, 100))
const historyPayload = computed(() =>
  entries.value.map(entry => ({
    prompt: entry.prompt,
    ideas: [
      ...entry.coreIdeas.map(idea => idea.text),
      ...entry.lenses.flatMap(lens => lens.ideas.map(idea => idea.text))
    ]
  }))
)

async function handleGenerate(customPrompt?: string) {
  const topic = (customPrompt ?? input.value).trim()
  if (!topic || isGenerating.value) return

  isGenerating.value = true

  try {
    const response = await $fetch<{
      coreIdeas: SparkIdea[]
      lenses: SparkLens[]
      nudges: SparkNudge[]
    }>('/api/spark', {
      method: 'POST',
      body: {
        input: topic,
        history: historyPayload.value
      }
    })

    const entry: JournalEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      prompt: topic,
      timestamp: Date.now(),
      coreIdeas: response.coreIdeas,
      lenses: response.lenses,
      nudges: response.nudges
    }

    entries.value = [entry, ...entries.value].slice(0, 6)
    lastPrompt.value = topic

    if (!customPrompt) {
      input.value = ''
    }
  } catch (error) {
    console.error('Failed to generate ideas:', error)
    showToastMessage('Something went wrong')
  } finally {
    isGenerating.value = false
  }
}

async function handleSaveIdea(text: string) {
  try {
    await $fetch('/api/saved-ideas', {
      method: 'POST',
      body: {
        text,
        source: 'ai',
        status: 'exploring'
      }
    })

    showToastMessage('Saved to pinboard')
    await fetchSavedIdeas()
  } catch (error) {
    console.error('Failed to save idea:', error)
    showToastMessage('Failed to save')
  }
}

function handleBranch(text: string) {
  input.value = text
  handleGenerate(text)
}

async function handleSendToBuild(text: string) {
  await router.push(`/?idea=${encodeURIComponent(text)}`)
}

function handleResetThread() {
  entries.value = []
  input.value = ''
  lastPrompt.value = ''
  showToastMessage('Thread cleared')
}

function prefillInput(prompt: string) {
  input.value = prompt
}

function toggleBoardDrawer(force?: boolean) {
  showBoardDrawer.value = typeof force === 'boolean' ? force : !showBoardDrawer.value
}

function clearQueryParam(key: string) {
  if (!import.meta.client) return
  if (!(key in route.query)) return

  const nextQuery: Record<string, string | string[]> = {}
  Object.entries(route.query).forEach(([paramKey, value]) => {
    if (paramKey === key || value == null) return
    if (Array.isArray(value)) {
      if (value.length > 0) {
        nextQuery[paramKey] = value
      }
    } else if (typeof value === 'string' && value.length > 0) {
      nextQuery[paramKey] = value
    }
  })

  router.replace({ query: nextQuery })
}

function startIncubationTimer() {
  timerActive.value = true
  timerSeconds.value = 600
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  timerInterval = setInterval(() => {
    timerSeconds.value = Math.max(0, timerSeconds.value - 1)
    if (timerSeconds.value === 0) {
      stopIncubationTimer()
      showToastMessage('Break finished—same prompt is ready when you are')
    }
  }, 1000)
}

function stopIncubationTimer(manual = false) {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  timerActive.value = false
  if (manual) {
    showToastMessage('Incubation logged')
  }
}

async function fetchSavedIdeas() {
  boardLoading.value = true
  try {
    const response = await $fetch<{ ideas: SavedIdea[] }>('/api/saved-ideas')
    savedIdeas.value = response.ideas
  } catch (error) {
    console.error('Failed to load saved ideas:', error)
  } finally {
    boardLoading.value = false
  }
}

async function copyText(text?: string, successMessage = 'Copied') {
  if (!text || !text.trim()) return
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    showToastMessage('Clipboard unavailable')
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    showToastMessage(successMessage)
  } catch (error) {
    console.error('Failed to copy text:', error)
    showToastMessage('Failed to copy')
  }
}

async function copyIdea(text: string) {
  await copyText(text, 'Copied idea')
}

async function copyCoachPrompt(text?: string) {
  await copyText(text, 'Tip copied')
}

function formatRelative(timestamp: number) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatFull(timestamp: number) {
  const formatter = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
  return formatter.format(timestamp)
}

const formattedTimer = computed(() => {
  const minutes = Math.floor(timerSeconds.value / 60)
  const seconds = timerSeconds.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2200)
}

function restoreThread() {
  if (typeof window === 'undefined') return
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return
  try {
    const parsed = JSON.parse(stored) as JournalEntry[]
    if (Array.isArray(parsed) && parsed.length > 0) {
      entries.value = parsed
      lastPrompt.value = parsed[0]?.prompt || ''
    }
  } catch (error) {
    console.warn('Failed to restore thread history', error)
  }
}

function loadPlanCue() {
  if (typeof window === 'undefined') return
  const stored = window.localStorage.getItem(PLAN_CUE_KEY)
  if (!stored) return
  try {
    const parsed = JSON.parse(stored) as Partial<typeof planCue>
    planCue.action = parsed.action ?? ''
    planCue.when = parsed.when ?? ''
    planCue.where = parsed.where ?? ''
  } catch (error) {
    console.warn('Failed to load saved cue', error)
  }
}

function handlePlanCueSave() {
  if (
    !planCue.action.trim().length ||
    !planCue.when.trim().length ||
    !planCue.where.trim().length
  ) {
    showToastMessage('Add the action, when, and where first')
    return
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PLAN_CUE_KEY, JSON.stringify(planCue))
  }

  planCueSaved.value = true
  showToastMessage('Cue saved')
  setTimeout(() => {
    planCueSaved.value = false
  }, 2400)
}

onMounted(async () => {
  restoreThread()
  loadPlanCue()
  await fetchSavedIdeas()
})

async function resumeFromHistory(runId: string) {
  if (!import.meta.client) return
  if (!runId || resumingRunId.value === runId) return
  resumingRunId.value = runId

  try {
    const { run } = await $fetch<{ run: SparkRunRecord }>(`/api/spark-history/${runId}`)
    const entry: JournalEntry = {
      id: run.id,
      prompt: run.prompt,
      timestamp: new Date(run.createdAt).getTime(),
      coreIdeas: run.coreIdeas,
      lenses: run.lenses,
      nudges: run.nudges
    }

    const remainingEntries = entries.value.filter(existing => existing.id !== entry.id)
    entries.value = [entry, ...remainingEntries].slice(0, 6)
    lastPrompt.value = entry.prompt
    input.value = entry.prompt
    showToastMessage('Thread restored from History')
  } catch (error) {
    console.error('Failed to resume thread', error)
    showToastMessage('Could not load saved run')
  } finally {
    clearQueryParam('resume')
    resumingRunId.value = null
  }
}

function closeCoachPanel() {
  coachState.open = false
}

async function openCoachPanel(idea: string, lane?: string) {
  const trimmed = idea.trim()
  if (!trimmed) return
  showBoardDrawer.value = false
  coachState.open = true
  coachState.idea = trimmed
  coachState.lane = lane ?? ''
  coachState.tips = null
  coachState.error = ''
  await fetchCoachTips()
}

async function fetchCoachTips() {
  if (!coachState.idea) return
  coachState.loading = true
  try {
    const tips = await $fetch<IdeaCoachTips>('/api/coach', {
      method: 'POST',
      body: {
        mode: 'idea-nudge',
        idea: coachState.idea,
        laneTitle: coachState.lane
      }
    })
    coachState.tips = tips
  } catch (error) {
    console.error('Failed to load coach tips', error)
    coachState.error = 'Could not load nudges'
  } finally {
    coachState.loading = false
  }
}

async function refreshCoachTips() {
  await fetchCoachTips()
}

function applyCoachPlanSuggestion() {
  if (!coachState.tips?.plan) return
  const suggestion = coachState.tips.plan
  if (suggestion.action) {
    planCue.action = suggestion.action
  }
  if (suggestion.when) {
    planCue.when = suggestion.when
  }
  if (suggestion.where) {
    planCue.where = suggestion.where
  }
  showToastMessage('Plan suggestion applied')
}

watch(
  () => [route.query.prefill, route.query.explore],
  ([prefill, explore]) => {
    const candidates = [prefill, explore]
      .map(value => (Array.isArray(value) ? value[0] : value))
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

    if (candidates.length > 0) {
      input.value = candidates[0]
      toggleBoardDrawer(false)
    }
  },
  { immediate: true }
)

watch(
  () => route.query.resume,
  value => {
    if (!import.meta.client) return
    const runId = Array.isArray(value) ? value[0] : value
    if (typeof runId === 'string' && runId.trim().length > 0) {
      void resumeFromHistory(runId)
    }
  },
  { immediate: true }
)

watch(
  entries,
  value => {
    if (typeof window === 'undefined') return
    const serializable = value.map(entry => ({ ...entry, timestamp: entry.timestamp }))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable.slice(0, 6)))
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.spark-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, #f4f7ff 20%, #f7f0ea 70%);
  padding: 2.5rem 1.5rem 4rem;
  position: relative;
  overflow: hidden;
}

.ambient {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.45;
  z-index: 0;
}

.orb-one {
  top: -80px;
  left: 10%;
  background: #ffd7bd;
}

.orb-two {
  bottom: -120px;
  right: 15%;
  background: #b8d8ff;
}

.spark-layout {
  position: relative;
  z-index: 1;
  max-width: 950px;
  margin: 0 auto;
}

.glass {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 55px rgba(64, 37, 24, 0.12);
}

.journal-panel {
  padding: 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.journal-hero {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.hero-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  color: #a2724c;
  margin: 0 0 0.35rem;
}

.journal-hero h1 {
  margin: 0;
  color: #2c150e;
  font-size: 2.4rem;
  line-height: 1.1;
}

.journal-hero p {
  margin: 0.75rem 0 0;
  color: #593e33;
  line-height: 1.5;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;
}

.pinboard-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  background: #f3d9ff;
  border: none;
  font-weight: 600;
  color: #6c3082;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(108, 48, 130, 0.18);
}

.input-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.spark-input {
  width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(108, 48, 130, 0.2);
  padding: 1rem 1.25rem;
  font-size: 1.15rem;
  resize: none;
  background: rgba(255, 255, 255, 0.9);
}

.input-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.primary {
  border: none;
  border-radius: 18px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(246, 113, 118, 0.25);
}

.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

.ghost {
  border: 1px solid rgba(89, 62, 51, 0.2);
  border-radius: 18px;
  padding: 0.75rem 1.25rem;
  background: transparent;
  color: #593e33;
  cursor: pointer;
}

.ghost.small {
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
}

.ghost.icon {
  padding: 0.4rem;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
}

.primary.small {
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
}

.thread-memory {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #755555;
}

.loading-card {
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #835872;
}

.journal-feed {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.journal-entry {
  padding: 1.5rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(40, 18, 13, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.journal-entry.latest {
  border-color: #f8c0ff;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.entry-seq {
  font-weight: 600;
  margin: 0;
}

.entry-time {
  margin: 0.25rem 0 0;
  color: #7a6b65;
  font-size: 0.9rem;
}

.entry-prompt {
  margin: 0;
  font-size: 1.1rem;
  color: #2f1810;
}

.idea-deck {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.idea-pill {
  border-radius: 16px;
  padding: 1rem;
  background: linear-gradient(135deg, #fff6ef, #fdefff);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.idea-pill p {
  margin: 0;
  line-height: 1.4;
}

.pill-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.link-button {
  background: none;
  border: none;
  padding: 0;
  font-weight: 600;
  color: #c0667f;
  cursor: pointer;
  min-width: 44px;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.lens-note {
  font-size: 0.8rem;
  color: #6f6cb5;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.lens-card h3 {
  margin: 0.1rem 0 0;
  font-size: 1rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lens-cue {
  background: rgba(95, 76, 138, 0.15);
  color: #4f3b78;
  border-radius: 999px;
  padding: 0.15rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 600;
}

.lens-label {
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: #6f6cb5;
  margin: 0 0 0.25rem;
}

.lens-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lens-card ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lens-card li {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.95rem;
  align-items: flex-start;
  border-top: 1px solid rgba(93, 116, 189, 0.18);
  padding-top: 0.65rem;
}

.lens-card ul li:first-child {
  border-top: none;
  padding-top: 0;
}

.lens-card span {
  flex: 1;
  line-height: 1.4;
}

.lens-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.35rem;
}

.plan-form {
  display: grid;
  gap: 0.4rem;
}

.plan-form input {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0.75rem;
}

.plan-form label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #a36854;
}

.plan-hint {
  margin: 0;
  font-size: 0.8rem;
  color: #6f4c58;
}

.placeholder-card {
  padding: 3rem 1rem;
  border-radius: 18px;
  text-align: center;
  color: #835872;
  border: 1px dashed rgba(131, 88, 114, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.board-drawer {
  position: fixed;
  right: 1.5rem;
  top: 4.5rem;
  bottom: 1.5rem;
  width: min(360px, calc(100% - 3rem));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  z-index: 4;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.board-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #7b6fa0;
  margin: 0 0 0.35rem;
}

.board-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.board-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.35rem;
  padding-bottom: 0.5rem;
}

.board-scroll::-webkit-scrollbar {
  width: 6px;
}

.board-scroll::-webkit-scrollbar-thumb {
  background: rgba(91, 76, 161, 0.3);
  border-radius: 999px;
}

.board-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 0.75rem;
  margin-bottom: 0.25rem;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(91, 76, 161, 0.08);
  z-index: 1;
}

.board-total {
  margin: 0;
  font-weight: 700;
  color: #443360;
}

.board-ready {
  margin: 0.15rem 0 0;
  font-size: 0.9rem;
  color: #7a6b9e;
}

.board-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-chip {
  border: 1px solid rgba(91, 76, 161, 0.2);
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  background: transparent;
  color: #4c3a7a;
  font-weight: 600;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.filter-chip.active {
  background: rgba(76, 58, 122, 0.18);
  border-color: rgba(76, 58, 122, 0.45);
  color: #3a2763;
}

.chip-count {
  font-size: 0.78rem;
  color: #7a6b9e;
}

.board-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.pin-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 1rem;
  border: 1px solid rgba(91, 76, 161, 0.12);
  box-shadow: 0 12px 30px rgba(23, 0, 37, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.pin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 32px rgba(23, 0, 37, 0.12);
}

.pin-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.pin-card-head small {
  color: #7a6b65;
}

.pin-card-text {
  margin: 0;
  color: #3a2035;
  line-height: 1.45;
}

.status-chip {
  border-radius: 999px;
  padding: 0.2rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background: rgba(76, 58, 122, 0.12);
  color: #4c3a7a;
}

.status-chip[data-status='ready'] {
  background: rgba(66, 184, 131, 0.2);
  color: #2f7b56;
}

.status-chip[data-status='building'] {
  background: rgba(255, 196, 87, 0.25);
  color: #9b5c00;
}

.status-chip[data-status='done'] {
  background: rgba(0, 0, 0, 0.08);
  color: #4a4a4a;
}

.board-loading,
.board-empty,
.board-filter-empty {
  flex: 1;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.4rem;
  color: #7b6f76;
  font-weight: 600;
  margin-top: 0.5rem;
}

.board-filter-empty {
  margin-top: 0.75rem;
}

.board-empty-sub {
  color: #a08f97;
  font-weight: 500;
  margin: 0;
}

.board-filter-empty {
  border: 1px dashed rgba(123, 111, 118, 0.35);
  border-radius: 16px;
  padding: 1rem;
}

.coach-panel {
  position: fixed;
  left: 1.5rem;
  top: 4.5rem;
  bottom: 1.5rem;
  width: min(420px, calc(100% - 3rem));
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  z-index: 4;
  overflow: hidden;
}

.coach-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.coach-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #6b5a8b;
  margin: 0 0 0.35rem;
}

.coach-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2a1a32;
}

.coach-lane {
  margin: 0.2rem 0 0;
  color: #6b5a8b;
  font-size: 0.9rem;
}

.coach-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.coach-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 0.25rem;
}

.coach-body::-webkit-scrollbar {
  width: 6px;
}

.coach-body::-webkit-scrollbar-thumb {
  background: rgba(98, 76, 138, 0.3);
  border-radius: 999px;
}

.coach-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.coach-card {
  border: 1px solid rgba(86, 72, 143, 0.12);
  border-radius: 18px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: rgba(255, 255, 255, 0.92);
}

.coach-tag {
  margin: 0;
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: #7c5aa6;
}

.coach-copy {
  margin: 0;
  color: #3d2a44;
  line-height: 1.45;
}

.coach-meta {
  margin: 0;
  font-size: 0.9rem;
  color: #6b5a8b;
  line-height: 1.3;
}

.coach-card small {
  color: #a08fb8;
}

.coach-card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.coach-loading,
.coach-error {
  flex: 1;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  color: #6b5a8b;
}

.coach-mantra {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #594c74;
  font-weight: 600;
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: #1d1b24;
  color: white;
  padding: 0.85rem 1.25rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
}

.timer-banner {
  position: fixed;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 9;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 900px) {
  .journal-panel {
    padding: 1.5rem;
  }

  .journal-hero h1 {
    font-size: 2rem;
  }

  .pinboard-button {
    align-self: flex-start;
  }

  .board-drawer {
    left: 1rem;
    right: 1rem;
    width: auto;
    top: auto;
    bottom: 1rem;
    height: auto;
    max-height: calc(100vh - 2rem);
  }

  .board-scroll {
    padding-right: 0;
  }

  .coach-panel {
    left: 1rem;
    right: 1rem;
    width: auto;
    top: auto;
    bottom: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .coach-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .input-actions {
    flex-direction: column;
  }

  .thread-memory {
    flex-direction: column;
    gap: 0.35rem;
  }
}
</style>
