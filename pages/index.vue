<template>
  <div class="spark-page">
    <div class="spark-layout">
      <header class="momentum-header">
        <div class="momentum-stats">
          <div class="stat-card">
            <div class="stat-number">{{ savedIdeas.length }}</div>
            <div class="stat-label">Ideas saved</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ entries.length }}</div>
            <div class="stat-label">Runs today</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ buildingCount }}</div>
            <div class="stat-label">In progress</div>
          </div>
        </div>
      </header>

      <section ref="inputSection" class="input-section">
        <h2 class="section-title">
          {{ savedIdeas.length > 0 ? 'Explore more' : 'Start exploring' }}
        </h2>
        <div class="spark-input-wrapper">
          <textarea
            v-model="input"
            class="spark-input"
            rows="2"
            placeholder="What do you want to explore?"
            @keydown.enter.exact.prevent="handleGenerate()"
          />
          <button
            class="generate-button"
            :disabled="!canGenerate || isGenerating"
            @click="handleGenerate()"
          >
            <Lightbulb v-if="!isGenerating" :size="18" />
            <Loader v-else :size="18" class="spin" />
            {{ isGenerating ? 'Generating' : 'Generate' }}
          </button>
        </div>
      </section>

      <section v-if="savedIdeas.length > 0" class="ideas-collection">
        <div class="collection-header">
          <h2 class="collection-title">Your ideas</h2>
          <button
            v-if="savedIdeas.length > 6"
            class="expand-btn"
            @click="showAllIdeas = !showAllIdeas"
          >
            {{ showAllIdeas ? 'Show less' : `View all ${savedIdeas.length}` }}
          </button>
        </div>
        <transition-group name="idea-list" tag="div" class="ideas-grid">
          <div
            v-for="idea in showAllIdeas ? savedIdeas : savedIdeas.slice(0, 6)"
            :key="idea.id"
            class="idea-card"
          >
            <button class="unpin-btn" title="Remove" @click="handleDeleteIdea(idea.id)">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <div class="idea-status" :data-status="idea.status">{{ idea.status }}</div>
            <p class="idea-text">{{ idea.text }}</p>
            <div class="idea-actions">
              <button class="action-btn" @click="handleExploreIdea(idea.text)">
                Generate more
              </button>
              <button class="action-btn secondary" @click="openCoachPanel(idea.text)">Coach</button>
            </div>
          </div>
        </transition-group>
        <div v-if="showAllIdeas && savedIdeas.length > 6" class="collection-footer">
          <button class="expand-btn" @click="showAllIdeas = false">Show less</button>
        </div>
      </section>

      <section v-if="entries.length > 0 || isGenerating" class="recent-runs">
        <h2 class="section-title">Recent explorations</h2>
        <div v-if="isGenerating" class="loading-card">
          <Loader :size="28" class="spin" />
          <p>Generating ideas...</p>
        </div>

        <div v-else class="journal-feed">
          <article
            v-for="(entry, index) in entries"
            :key="entry.id"
            class="journal-entry"
            :class="{ latest: index === 0, branched: !!entry.parentPrompt }"
          >
            <div v-if="entry.parentPrompt" class="branch-indicator">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5 3v10M11 8H5M11 8l-2-2M11 8l-2 2"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              <span>Branched from: {{ entry.parentPrompt }}</span>
            </div>
            <div class="entry-header">
              <p class="entry-prompt">{{ entry.prompt }}</p>
              <span class="entry-time">{{ formatFull(entry.timestamp) }}</span>
            </div>

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
                  <button class="link-button" @click="handleBranch(idea.text, entry)">
                    Branch
                  </button>
                  <button class="link-button" @click="openCoachPanel(idea.text)">
                    <Sparkles :size="14" />
                    Coach
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

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
          <div class="workspace-container">
            <CoachWorkspace :idea="coachState.idea" :show-toast="showToastMessage" />
          </div>
          <details v-if="coachState.tips" class="coach-tips-toggle">
            <summary>
              <span>💡 Quick tips</span>
              <span class="toggle-hint">Optional nudges</span>
            </summary>
            <div class="tips-container">
              <p v-if="coachState.tips" class="coach-mantra">{{ coachState.tips.mantra }}</p>
              <div class="coach-grid">
                <article class="coach-card">
                  <p class="coach-tag">Plan cue</p>
                  <h4>{{ coachState.tips.plan.title }}</h4>
                  <p class="coach-copy">{{ coachState.tips.plan.summary }}</p>
                  <div class="coach-meta">
                    <span>{{ coachState.tips.plan.action }}</span>
                    <small
                      >{{ coachState.tips.plan.when }} · {{ coachState.tips.plan.where }}</small
                    >
                  </div>
                </article>

                <article class="coach-card">
                  <p class="coach-tag">Incubation</p>
                  <h4>{{ coachState.tips.incubation.title }}</h4>
                  <p class="coach-copy">{{ coachState.tips.incubation.summary }}</p>
                  <p class="coach-meta">{{ coachState.tips.incubation.activity }}</p>
                </article>

                <article class="coach-card">
                  <p class="coach-tag">Novelty</p>
                  <h4>{{ coachState.tips.novelty.title }}</h4>
                  <p class="coach-copy">{{ coachState.tips.novelty.summary }}</p>
                  <p class="coach-meta">{{ coachState.tips.novelty.prompt }}</p>
                </article>
              </div>
            </div>
          </details>
        </div>
      </aside>
    </transition>

    <transition name="toast">
      <div v-if="showToast" class="toast">
        <Check :size="20" />
        {{ toastMessage }}
      </div>
    </transition>

    <button v-if="savedIdeas.length > 6" class="floating-input-btn" @click="scrollToInput">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Lightbulb, Loader, Check, Sparkles, BookmarkPlus, X } from 'lucide-vue-next'
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import CoachWorkspace from '../components/CoachWorkspace.vue'

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
  parentPrompt?: string
}

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

interface SavedIdea {
  id: string
  text: string
  status: 'exploring' | 'ready' | 'building' | 'done'
  createdAt: string
}

const STORAGE_KEY = 'spark-thread-journal'

const input = ref('')
const entries = ref<JournalEntry[]>([])
const savedIdeas = ref<SavedIdea[]>([])
const isGenerating = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const lastPrompt = ref('')
const resumingRunId = ref<string | null>(null)
const showAllIdeas = ref(false)
const inputSection = ref<HTMLElement | null>(null)
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

const router = useRouter()
const route = useRoute()

const canGenerate = computed(() => input.value.trim().length > 0)
const buildingCount = computed(() => savedIdeas.value.filter(i => i.status === 'building').length)
const historyPayload = computed(() =>
  entries.value.map(entry => ({
    prompt: entry.prompt,
    ideas: [
      ...entry.coreIdeas.map(idea => idea.text),
      ...entry.lenses.flatMap(lens => lens.ideas.map(idea => idea.text))
    ]
  }))
)

async function handleGenerate(customPrompt?: string, parentEntry?: JournalEntry) {
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
        history: parentEntry ? historyPayload.value : [],
        isBranch: !!parentEntry,
        parentPrompt: parentEntry?.prompt
      }
    })

    const entry: JournalEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      prompt: topic,
      timestamp: Date.now(),
      coreIdeas: response.coreIdeas,
      lenses: response.lenses,
      nudges: response.nudges,
      parentPrompt: parentEntry?.prompt
    }

    entries.value = [entry, ...entries.value].slice(0, 6)
    lastPrompt.value = topic

    if (!customPrompt) {
      input.value = ''
    }
  } catch (error: unknown) {
    console.error('Failed to generate ideas:', error)
    const message =
      (error as { data?: { statusMessage?: string }; message?: string })?.data?.statusMessage ||
      (error as { message?: string })?.message ||
      'Failed to generate ideas'
    showToastMessage(message)
  } finally {
    isGenerating.value = false
  }
}

async function handleSaveIdea(text: string) {
  try {
    const response = await $fetch<{ idea: SavedIdea }>('/api/saved-ideas', {
      method: 'POST',
      body: {
        text,
        source: 'ai',
        status: 'exploring'
      }
    })

    savedIdeas.value = [response.idea, ...savedIdeas.value]
    showToastMessage('Saved to your collection')
  } catch (error) {
    console.error('Failed to save idea:', error)
    showToastMessage('Failed to save')
  }
}

async function handleDeleteIdea(ideaId: string) {
  try {
    await $fetch(`/api/saved-ideas/${ideaId}`, { method: 'DELETE' })
    savedIdeas.value = savedIdeas.value.filter(i => i.id !== ideaId)
    showToastMessage('Removed from collection')
  } catch (error) {
    console.error('Failed to delete idea:', error)
    showToastMessage('Failed to remove')
  }
}

function scrollToInput() {
  inputSection.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function handleBranch(text: string, parentEntry?: JournalEntry) {
  input.value = text
  handleGenerate(text, parentEntry)
}

function clearQueryParam(key: string) {
  if (!import.meta.client) return
  if (!(key in route.query)) return

  const nextQuery: Record<string, string | string[]> = {}
  Object.entries(route.query).forEach(([paramKey, value]) => {
    if (paramKey === key || value == null) return
    if (Array.isArray(value)) {
      const filtered = value.filter((v): v is string => typeof v === 'string' && v.length > 0)
      if (filtered.length > 0) {
        nextQuery[paramKey] = filtered
      }
    } else if (typeof value === 'string' && value.length > 0) {
      nextQuery[paramKey] = value
    }
  })

  router.replace({ query: nextQuery })
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

onMounted(() => {
  restoreThread()
  fetchSavedIdeas()
})

async function fetchSavedIdeas() {
  try {
    const response = await $fetch<{ ideas: SavedIdea[] }>('/api/saved-ideas')
    savedIdeas.value = response.ideas
  } catch (error) {
    console.error('Failed to fetch saved ideas:', error)
  }
}

function handleExploreIdea(text: string) {
  input.value = text
  handleGenerate(text)
}

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

watch(
  () => [route.query.prefill, route.query.explore],
  ([prefill, explore]) => {
    const candidates = [prefill, explore]
      .map(value => (Array.isArray(value) ? value[0] : value))
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

    if (candidates.length > 0) {
      input.value = candidates[0]
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
</script>

<style scoped>
.spark-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f0 0%, #fef8f5 100%);
  padding: 2rem 1.5rem 4rem;
}

.spark-layout {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.momentum-header {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0e5e0;
}

.momentum-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #d4756f;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #8a7566;
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ideas-collection {
  background: linear-gradient(135deg, #fefaf5 0%, #fef5f0 100%);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0e5e0;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.collection-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #40312b;
  margin: 0;
}

.expand-btn {
  border: none;
  background: none;
  color: #d4756f;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: rgba(212, 117, 111, 0.1);
}

.collection-footer {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0e5e0;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #40312b;
  margin: 0 0 1rem 0;
}

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.idea-card {
  animation: fadeInUp 0.3s ease-out backwards;
}

.idea-card:nth-child(1) {
  animation-delay: 0.05s;
}
.idea-card:nth-child(2) {
  animation-delay: 0.1s;
}
.idea-card:nth-child(3) {
  animation-delay: 0.15s;
}
.idea-card:nth-child(4) {
  animation-delay: 0.2s;
}
.idea-card:nth-child(5) {
  animation-delay: 0.25s;
}
.idea-card:nth-child(6) {
  animation-delay: 0.3s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.idea-list-enter-active {
  transition: all 0.3s ease-out;
}

.idea-list-leave-active {
  transition: all 0.3s ease-in;
}

.idea-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.idea-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.idea-list-move {
  transition: transform 0.3s ease;
}

.idea-card {
  background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%);
  border: 1px solid #f0e5e0;
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.idea-card::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background: #d4756f;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(212, 117, 111, 0.5);
}

.unpin-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  color: #8a7566;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.idea-card:hover .unpin-btn {
  opacity: 1;
}

.unpin-btn:hover {
  background: #fff;
  color: #d4756f;
  transform: scale(1.1);
}

.idea-card:nth-child(6n + 1) {
  transform: rotate(-0.5deg);
}

.idea-card:nth-child(6n + 2) {
  transform: rotate(0.8deg);
}

.idea-card:nth-child(6n + 3) {
  transform: rotate(-0.3deg);
}

.idea-card:nth-child(6n + 4) {
  transform: rotate(0.6deg);
}

.idea-card:nth-child(6n + 5) {
  transform: rotate(-0.7deg);
}

.idea-card:nth-child(6n + 6) {
  transform: rotate(0.4deg);
}

.idea-card:nth-child(6n + 1):hover {
  transform: translateY(-2px) rotate(-2deg);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.idea-card:nth-child(6n + 2):hover {
  transform: translateY(-2px) rotate(2.5deg);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.idea-card:nth-child(6n + 3):hover {
  transform: translateY(-2px) rotate(-1.5deg);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.idea-card:nth-child(6n + 4):hover {
  transform: translateY(-2px) rotate(2deg);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.idea-card:nth-child(6n + 5):hover {
  transform: translateY(-2px) rotate(-2.5deg);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.idea-card:nth-child(6n + 6):hover {
  transform: translateY(-2px) rotate(1.5deg);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.idea-status {
  display: inline-block;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-bottom: 0.75rem;
  background: #fde7ff;
  color: #8b5a8f;
  box-shadow: 0 2px 4px rgba(139, 90, 143, 0.15);
}

.idea-status[data-status='ready'] {
  background: #fff0da;
  color: #9b7455;
  box-shadow: 0 2px 4px rgba(155, 116, 85, 0.15);
}

.idea-status[data-status='building'] {
  background: #e9f8ec;
  color: #4a7c59;
  box-shadow: 0 2px 4px rgba(74, 124, 89, 0.15);
}

.idea-status[data-status='done'] {
  background: #e9edff;
  color: #5a6b9b;
  box-shadow: 0 2px 4px rgba(90, 107, 155, 0.15);
}

.idea-text {
  margin: 0 0 1rem 0;
  color: #40312b;
  line-height: 1.5;
  font-size: 0.9375rem;
}

.idea-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #d4756f;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #c26660;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #f0e5e0;
  color: #8a7566;
}

.action-btn.secondary:hover {
  background: #e8d5cf;
}

.view-all-link {
  display: inline-block;
  color: #d4756f;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9375rem;
}

.view-all-link:hover {
  text-decoration: underline;
}

.input-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0e5e0;
}

.recent-runs {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0e5e0;
}

.spark-input-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.spark-input {
  flex: 1;
  border-radius: 12px;
  border: 1px solid #f0e5e0;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  resize: none;
  background: #fef8f5;
  transition: all 0.2s ease;
  font-family: inherit;
  min-height: 60px;
}

.spark-input:focus {
  outline: none;
  border-color: #d4756f;
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.1);
  background: white;
}

.generate-button {
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #d4756f;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  white-space: nowrap;
  height: 60px;
}

.generate-button:hover:not(:disabled) {
  background: #c26660;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.3);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.reset-button {
  border: 1px solid #e5e5e5;
  border-radius: 50%;
  padding: 0.5rem;
  background: white;
  color: #666;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
}

.reset-button:hover {
  background: #f5f5f5;
  border-color: #d4d4d4;
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

.loading-card {
  text-align: center;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #8a7566;
}

.journal-feed {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.journal-entry {
  padding: 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff9f5 0%, #fef5f0 100%);
  border: 1px solid #f0e5e0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.journal-entry.latest {
  border-color: #d4756f;
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.1);
}

.journal-entry.branched {
  border-left: 3px solid #d4756f;
}

.branch-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(212, 117, 111, 0.08);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #8a7566;
}

.branch-indicator svg {
  flex-shrink: 0;
  color: #d4756f;
}

.branch-indicator span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.entry-prompt {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #40312b;
  flex: 1;
}

.entry-time {
  color: #8a7566;
  font-size: 0.875rem;
  white-space: nowrap;
}

.idea-deck {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.idea-pill {
  border-radius: 12px;
  padding: 1rem;
  background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%);
  border: 1px solid #f0e5e0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.idea-pill::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #d4756f;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(212, 117, 111, 0.4);
}

.idea-pill:nth-child(3n + 1):hover {
  transform: translateY(-4px) rotate(-1.5deg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.idea-pill:nth-child(3n + 2):hover {
  transform: translateY(-4px) rotate(0deg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.idea-pill:nth-child(3n + 3):hover {
  transform: translateY(-4px) rotate(1.5deg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
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
  color: #d4756f;
  cursor: pointer;
  min-width: 44px;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.2s ease;
  font-size: 0.875rem;
}

.link-button:hover {
  color: #c26660;
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
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: rgba(98, 76, 138, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(98, 76, 138, 0.08);
}

.plan-form input {
  border-radius: 8px;
  border: 1px solid rgba(98, 76, 138, 0.15);
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
  background: white;
  transition: border-color 0.2s ease;
}

.plan-form input:focus {
  outline: none;
  border-color: rgba(98, 76, 138, 0.4);
}

.plan-form label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #7c5aa6;
  font-weight: 600;
  margin-top: 0.25rem;
}

.plan-form label:first-child {
  margin-top: 0;
}

.plan-hint {
  margin: 0;
  font-size: 0.75rem;
  color: #6b5a8b;
  font-style: italic;
}

.placeholder-card {
  padding: 2rem 1rem;
  border-radius: 12px;
  text-align: center;
  color: #999;
  border: 1px dashed #e5e5e5;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.board-drawer {
  position: fixed;
  right: 1.5rem;
  top: 4.5rem;
  bottom: 1.5rem;
  width: min(320px, calc(100% - 3rem));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  z-index: 4;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.board-header h2 {
  font-size: 1rem;
  margin: 0;
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
  border-radius: 12px;
  padding: 0.75rem;
  border: 1px solid rgba(91, 76, 161, 0.1);
  box-shadow: 0 2px 8px rgba(23, 0, 37, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.pin-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(23, 0, 37, 0.08);
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
  line-height: 1.4;
  font-size: 0.9rem;
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
  top: 5.5rem;
  bottom: 1.5rem;
  width: min(420px, calc(100% - 3rem));
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  z-index: 4;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(212, 117, 111, 0.15);
  box-shadow: 0 20px 40px rgba(64, 37, 24, 0.12);
}

.coach-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 215, 189, 0.2), rgba(243, 217, 255, 0.2));
  border-bottom: 1px solid rgba(212, 117, 111, 0.12);
}

.coach-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.65rem;
  color: #9b7455;
  margin: 0 0 0.3rem;
  font-weight: 600;
}

.coach-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #2c150e;
  line-height: 1.3;
  font-weight: 700;
}

.coach-lane {
  margin: 0.3rem 0 0;
  color: #9b7455;
  font-size: 0.85rem;
  font-style: italic;
  opacity: 0.8;
}

.coach-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.coach-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.coach-body::-webkit-scrollbar {
  width: 8px;
}

.coach-body::-webkit-scrollbar-track {
  background: rgba(243, 217, 255, 0.2);
  border-radius: 999px;
}

.coach-body::-webkit-scrollbar-thumb {
  background: rgba(108, 48, 130, 0.25);
  border-radius: 999px;
}

.coach-body::-webkit-scrollbar-thumb:hover {
  background: rgba(108, 48, 130, 0.4);
}

.coach-grid {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.coach-card {
  border: 1px solid rgba(86, 72, 143, 0.1);
  border-radius: 10px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  background: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
}

.coach-card:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(86, 72, 143, 0.2);
}

.coach-card h4 {
  font-size: 0.9rem;
  margin: 0;
  color: #2f1c4f;
}

.coach-tag {
  margin: 0;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: #7c5aa6;
  font-weight: 600;
  display: inline-block;
  padding: 0.15rem 0.5rem;
  background: rgba(124, 90, 166, 0.08);
  border-radius: 4px;
  align-self: flex-start;
}

.coach-copy {
  margin: 0;
  color: #3d2a44;
  line-height: 1.45;
  font-size: 0.85rem;
}

.coach-meta {
  margin: 0;
  font-size: 0.8rem;
  color: #6b5a8b;
  line-height: 1.4;
  padding: 0.5rem;
  background: rgba(98, 76, 138, 0.04);
  border-radius: 6px;
  border-left: 2px solid rgba(98, 76, 138, 0.2);
}

.coach-meta span {
  display: block;
  font-weight: 600;
  color: #4f3a76;
  margin-bottom: 0.25rem;
}

.coach-card small {
  color: #a08fb8;
  display: block;
  margin-top: 0.15rem;
}

.coach-card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.coach-loading,
.coach-error {
  flex: 1;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.75rem;
  color: #835872;
  padding: 2rem;
}

.coach-mantra {
  margin: 0 0 0.85rem;
  font-size: 0.85rem;
  color: #593e33;
  font-weight: 500;
  font-style: italic;
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: rgba(255, 215, 189, 0.15);
  border-radius: 10px;
  border-left: 3px solid #d4756f;
}

.workspace-container {
  margin-top: 0;
}

.coach-tips-toggle {
  margin-top: 1rem;
  border: 1px solid rgba(212, 117, 111, 0.15);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  transition: all 0.2s ease;
}

.coach-tips-toggle:hover {
  border-color: rgba(212, 117, 111, 0.25);
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.08);
}

.coach-tips-toggle summary {
  padding: 0.85rem 1.1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #593e33;
  user-select: none;
  transition: background 0.2s ease;
}

.coach-tips-toggle summary:hover {
  background: rgba(255, 215, 189, 0.15);
}

.coach-tips-toggle summary span:first-child {
  flex: 1;
}

.toggle-hint {
  font-size: 0.8rem;
  color: #9b7455;
  font-weight: 500;
  opacity: 0.75;
}

.tips-container {
  padding: 1rem;
  border-top: 1px solid rgba(212, 117, 111, 0.1);
  background: rgba(255, 246, 239, 0.4);
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toast {
  position: fixed;
  top: 5rem;
  right: 1.5rem;
  background: white;
  color: #40312b;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 150;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #f0e5e0;
}

.toast svg {
  color: #4a7c59;
}

.floating-input-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border: none;
  background: #d4756f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(212, 117, 111, 0.4);
  transition: all 0.2s ease;
  z-index: 100;
}

.floating-input-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(212, 117, 111, 0.5);
}

.floating-input-btn:active {
  transform: scale(0.95);
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
  .spark-input {
    padding-right: 1.25rem;
    padding-bottom: 4.5rem;
  }

  .input-controls {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    justify-content: space-between;
  }

  .generate-button {
    flex: 1;
  }
}
</style>
