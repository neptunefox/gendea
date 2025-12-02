<template>
  <div class="spark-page">
    <BackgroundRunes variant="spark" />
    <div v-if="showDemo" class="demo-overlay" @click="dismissDemo">
      <div class="demo-ambient"></div>
      <div class="grimoire-container" @click.stop>
        <div class="grimoire-spine"></div>
        <div class="grimoire-page">
          <div class="page-texture"></div>
          <p class="grimoire-whisper">Start with one idea. Leave with many.</p>
          <p class="grimoire-subtitle">Describe what you're working on — we'll show you angles you haven't considered</p>
          <div class="grimoire-divider">
            <span class="divider-line"></span>
            <span class="divider-symbol">✦</span>
            <span class="divider-line"></span>
          </div>
          <p class="demo-label">Example</p>
          <p class="demo-prompt">"{{ DEMO_ENTRY.prompt }}"</p>
          <p class="demo-result-label">generates ideas like:</p>
          <div class="demo-ideas">
            <div
              v-for="(idea, index) in DEMO_ENTRY.coreIdeas"
              :key="index"
              class="demo-idea"
              :style="{ animationDelay: `${0.6 + index * 0.12}s` }"
            >
              <span class="card-numeral">{{ ['I', 'II', 'III', 'IV', 'V'][index] }}</span>
              <p>{{ idea.text }}</p>
            </div>
          </div>
          <button class="demo-cta" @click="dismissDemo">Try it yourself</button>
        </div>
      </div>
    </div>

    <div class="spark-layout">
      <div class="spark-header">
        <DailyTarot @use-prompt="handleTarotPrompt" />
        <p class="spark-tagline">Use when you need options</p>
      </div>
      <div ref="inputSection" class="spark-input-wrapper" @click="focusInput">
        <textarea
          ref="inputField"
          v-model="input"
          class="spark-input"
          rows="1"
          placeholder="Describe an idea, problem, or challenge..."
          @keydown.enter.exact.prevent="handleGenerate()"
        />
        <button
          class="generate-btn"
          type="button"
          :disabled="!canGenerate || isGenerating"
          @click.stop="handleGenerate()"
        >
          <Loader v-if="isGenerating" :size="18" class="spin" />
          <span v-else>Diverge</span>
        </button>
      </div>

      <FlowGuidanceBanner
        :visible="showCauldronNudge && savedIdeas.length >= 5"
        message="You have fragments. Ready to make them whole?"
        hint="The Cauldron finds connections between your ideas and synthesizes something stronger."
        variant="cauldron"
        action-link="/cauldron"
        action-label="Converge ideas"
        @dismiss="dismissCauldronNudge"
      />

      <section v-if="savedIdeas.length > 0" class="ideas-collection">
        <button class="collection-header" @click="ideasCollapsed = !ideasCollapsed">
          <h2 class="collection-title">Your ideas</h2>
          <span class="collection-count">{{ savedIdeas.length }}</span>
          <ChevronDown :size="18" class="collapse-icon" :class="{ collapsed: ideasCollapsed }" />
        </button>
        <div v-show="!ideasCollapsed" class="collection-content">
          <div class="ideas-grid-wrapper">
            <transition-group name="idea-list" tag="div" class="ideas-grid">
              <div
                v-for="(idea, index) in showAllIdeas ? savedIdeas : savedIdeas.slice(0, 6)"
                :key="idea.id"
                class="idea-card"
                :class="{ dragging: isDraggingIdea === idea.id }"
                draggable="true"
                @dragstart="e => handleIdeaDragStart(e, idea)"
                @dragend="handleIdeaDragEnd"
              >
              <span class="tarot-corner top-left" />
              <span class="tarot-corner top-right" />
              <span class="tarot-corner bottom-left" />
              <span class="tarot-corner bottom-right" />
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
              <p class="idea-text">{{ idea.text }}</p>
              <div class="idea-actions">
                <button class="action-btn" @click="handleExploreIdea(idea.text)">
                  Diverge more
                </button>
                <button class="action-btn oracle-btn" @click="navigateToOracle(idea.id)">
                  <HelpCircle :size="16" />
                  Dialogue
                </button>
              </div>
            </div>
            </transition-group>
          </div>
          <div v-if="savedIdeas.length > 6" class="collection-footer">
            <button class="expand-btn" @click="showAllIdeas = !showAllIdeas">
              {{ showAllIdeas ? 'Show less' : `View all ${savedIdeas.length}` }}
            </button>
          </div>
        </div>
      </section>

      <section v-if="entries.length > 0 || isGenerating" class="recent-runs">
        <div class="runs-header">
          <h2 class="section-title">Recent explorations</h2>
          <div v-if="selectedIdeas.size > 0" class="selection-actions">
            <span class="selection-count">{{ selectedIdeas.size }} selected</span>
            <button class="selection-btn" @click="handleBranchSelected">
              <Split :size="16" />
              Diverge all
            </button>
            <button class="selection-btn secondary" @click="clearSelection">Clear</button>
          </div>
        </div>
        <div v-if="isGenerating" ref="loadingCard" class="loading-card">
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
              <CornerDownRight :size="16" />
              <span>{{ entry.parentPrompt }}</span>
            </div>
            <div class="entry-header">
              <div class="entry-prompt-wrapper">
                <p
                  class="entry-prompt"
                  :class="{ truncated: !entry.expanded && entry.prompt.length > 150 }"
                >
                  {{
                    entry.expanded || entry.prompt.length <= 150
                      ? entry.prompt
                      : entry.prompt.slice(0, 150) + '...'
                  }}
                </p>
                <button
                  v-if="entry.prompt.length > 150"
                  class="expand-prompt-btn"
                  @click.stop="togglePromptExpansion(entry.id)"
                >
                  {{ entry.expanded ? 'Show less' : 'Show more' }}
                </button>
              </div>
              <div class="entry-meta">
                <span v-if="index === 0" class="new-badge">New</span>
                <span class="entry-time">{{ formatFull(entry.timestamp) }}</span>
              </div>
            </div>

            <div class="idea-deck">
              <div
                v-for="(idea, ideaIndex) in entry.coreIdeas"
                :key="`${entry.id}-core-${ideaIndex}`"
                class="idea-pill"
                :class="{
                  selected: selectedIdeas.has(`${entry.id}-${ideaIndex}`),
                  'card-deal-animate': shouldAnimateCard(entry.id)
                }"
                :style="getCardDealDelay(entry.id, ideaIndex) ? { animationDelay: getCardDealDelay(entry.id, ideaIndex) } : undefined"
                @click="toggleIdeaSelection(`${entry.id}-${ideaIndex}`, idea.text, entry)"
              >
                <div class="pill-checkbox">
                  <Check v-if="selectedIdeas.has(`${entry.id}-${ideaIndex}`)" :size="14" />
                </div>
                <p>{{ idea.text }}</p>
                <div class="pill-actions" @click.stop>
                  <button
                    class="icon-action-btn"
                    title="Save to collection"
                    @click="handleSaveIdea(idea.text)"
                  >
                    <BookmarkPlus :size="18" />
                  </button>
                  <button
                    class="icon-action-btn"
                    title="Diverge from this"
                    @click="handleBranch(idea.text, entry)"
                  >
                    <Split :size="18" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <transition name="toast" @before-leave="handleToastLeave">
      <div v-if="showToast" ref="toastRef" class="toast">
        <Check :size="20" />
        {{ toastMessage }}
        <SealAnimation
          :color="'#d4a574'"
          :active="showSealAnimation"
          @complete="showSealAnimation = false"
        />
      </div>
    </transition>

    <div class="particle-layer">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle smoke-particle"
        :style="{
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          opacity: particle.opacity,
          backgroundColor: particle.color
        }"
      />
    </div>

    <button v-if="savedIdeas.length > 6" class="floating-input-btn" @click="scrollToInput">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  Loader,
  Check,
  BookmarkPlus,
  CornerDownRight,
  Split,
  HelpCircle,
  ChevronDown
} from 'lucide-vue-next'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import DailyTarot from '~/components/DailyTarot.vue'
import FlowGuidanceBanner from '~/components/FlowGuidanceBanner.vue'
import SealAnimation from '~/components/SealAnimation.vue'
import { useReducedMotion } from '~/composables/useReducedMotion'
import { useSound } from '~/composables/useSound'
import { useParticles } from '~/composables/useParticles'

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
  expanded?: boolean
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
  createdAt: string
}

const STORAGE_KEY = 'spark-thread-journal'
const DEMO_DISMISSED_KEY = 'spark-demo-dismissed'

const DEMO_ENTRY: JournalEntry = {
  id: 'demo',
  prompt: 'A morning routine app that actually sticks',
  timestamp: Date.now(),
  coreIdeas: [
    {
      text: 'Start with just one habit — the keystone — and let users unlock more only after a 7-day streak.'
    },
    {
      text: 'Replace reminders with a "morning score" that decays if you skip, gamifying consistency without nagging.'
    },
    { text: 'Partner mode: two friends see each other\'s streaks and can "nudge" once per day.' },
    {
      text: 'Build it as an Apple Watch complication that shows a single emoji reflecting your week.'
    },
    {
      text: 'Anti-feature: no stats dashboard. Just today, yesterday, and a binary "on track" or "rebuild."'
    }
  ],
  lenses: [],
  nudges: []
}

const input = ref('')
const entries = ref<JournalEntry[]>([])
const savedIdeas = ref<SavedIdea[]>([])
const isGenerating = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const lastPrompt = ref('')
const resumingRunId = ref<string | null>(null)
const showAllIdeas = ref(false)
const ideasCollapsed = ref(false)
const selectedIdeas = ref<Map<string, { text: string; entry: JournalEntry }>>(new Map())
const inputSection = ref<HTMLElement | null>(null)
const inputField = ref<HTMLTextAreaElement | null>(null)
const loadingCard = ref<HTMLElement | null>(null)
const showDemo = ref(false)
const showCauldronNudge = ref(false)
const toastRef = ref<HTMLElement | null>(null)
const showSealAnimation = ref(false)

const CAULDRON_NUDGE_KEY = 'spark-cauldron-nudge-dismissed'

const INPUT_HEIGHT_LIMIT = 100

const router = useRouter()
const route = useRoute()
const prefersReducedMotion = useReducedMotion()
const { play: playSound } = useSound()
const { particles, spawnSmokeParticles } = useParticles()

const isDraggingIdea = ref<string | null>(null)
const generationCount = ref(0)
const latestEntryId = ref<string | null>(null)

const canGenerate = computed(() => input.value.trim().length > 0)
const historyPayload = computed(() =>
  entries.value.map(entry => ({
    prompt: entry.prompt,
    ideas: [
      ...entry.coreIdeas.map(idea => idea.text),
      ...entry.lenses.flatMap(lens => lens.ideas.map(idea => idea.text))
    ]
  }))
)

function getCardDealDelay(entryId: string, index: number): string | undefined {
  if (prefersReducedMotion.value) return undefined
  if (entryId !== latestEntryId.value) return undefined
  return `${index * 80}ms`
}

function shouldAnimateCard(entryId: string): boolean {
  return !prefersReducedMotion.value && entryId === latestEntryId.value
}

function toggleIdeaSelection(key: string, text: string, entry: JournalEntry) {
  if (selectedIdeas.value.has(key)) {
    selectedIdeas.value.delete(key)
  } else {
    selectedIdeas.value.set(key, { text, entry })
  }
  selectedIdeas.value = new Map(selectedIdeas.value)
}

function clearSelection() {
  selectedIdeas.value = new Map()
}

function handleIdeaDragStart(event: DragEvent, idea: SavedIdea) {
  isDraggingIdea.value = idea.id
  event.dataTransfer?.setData(
    'application/json',
    JSON.stringify({
      id: idea.id,
      text: idea.text,
      source: 'saved'
    })
  )
}

function handleIdeaDragEnd() {
  isDraggingIdea.value = null
}

async function handleBranchSelected() {
  if (selectedIdeas.value.size === 0) return

  const selectedTexts = Array.from(selectedIdeas.value.values()).map(s => s.text)
  const combinedPrompt = selectedTexts.join(' + ')
  const firstEntry = Array.from(selectedIdeas.value.values())[0].entry

  clearSelection()
  await handleGenerate(combinedPrompt, firstEntry)
}

async function handleGenerate(customPrompt?: string, parentEntry?: JournalEntry) {
  const topic = (customPrompt ?? input.value).trim()
  if (!topic || isGenerating.value) return

  isGenerating.value = true

  await nextTick()
  loadingCard.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })

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

    latestEntryId.value = entry.id
    entries.value = [entry, ...entries.value].slice(0, 6)
    lastPrompt.value = topic

    if (!customPrompt) {
      input.value = ''
    }

    generationCount.value++
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
    playSound('chime')
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

function focusInput() {
  nextTick(() => {
    inputField.value?.focus()
  })
}

function handleBranch(text: string, parentEntry?: JournalEntry) {
  input.value = text
  handleGenerate(text, parentEntry)
}

watch(
  input,
  () => {
    void nextTick(() => {
      adjustInputHeight()
    })
  },
  { immediate: true }
)

function adjustInputHeight() {
  const field = inputField.value
  if (!field) return
  field.style.height = 'auto'
  const scrollHeight = field.scrollHeight
  if (scrollHeight > INPUT_HEIGHT_LIMIT) {
    field.style.height = `${INPUT_HEIGHT_LIMIT}px`
    field.style.overflowY = 'auto'
  } else {
    field.style.height = `${scrollHeight}px`
    field.style.overflowY = 'hidden'
  }
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
  
  if (message.toLowerCase().includes('saved')) {
    showSealAnimation.value = true
  }
  
  setTimeout(() => {
    showToast.value = false
  }, 2200)
}

function handleToastLeave() {
  if (prefersReducedMotion.value) return
  if (!toastRef.value) return
  
  const rect = toastRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  spawnSmokeParticles(centerX, centerY)
}

function togglePromptExpansion(entryId: string) {
  const entry = entries.value.find(e => e.id === entryId)
  if (entry) {
    entry.expanded = !entry.expanded
  }
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

function checkShowDemo() {
  if (typeof window === 'undefined') return
  const dismissed = window.localStorage.getItem(DEMO_DISMISSED_KEY)
  if (dismissed) return
  if (entries.value.length === 0 && savedIdeas.value.length === 0) {
    showDemo.value = true
  }
}

function dismissDemo() {
  showDemo.value = false
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(DEMO_DISMISSED_KEY, 'true')
  }
  nextTick(() => inputField.value?.focus())
}

function dismissCauldronNudge() {
  showCauldronNudge.value = false
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CAULDRON_NUDGE_KEY, 'true')
  }
}

function checkCauldronNudge() {
  if (typeof window === 'undefined') return
  const dismissed = window.localStorage.getItem(CAULDRON_NUDGE_KEY)
  if (dismissed) return
  if (savedIdeas.value.length >= 5) {
    showCauldronNudge.value = true
  }
}

onMounted(async () => {
  restoreThread()
  await fetchSavedIdeas()
  checkShowDemo()
  checkCauldronNudge()
  await nextTick()
  adjustInputHeight()
})

async function fetchSavedIdeas() {
  try {
    const response = await $fetch<{ ideas: SavedIdea[] }>('/api/saved-ideas')
    savedIdeas.value = response.ideas.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('Failed to fetch saved ideas:', error)
  }
}

function handleExploreIdea(text: string) {
  input.value = text
  handleGenerate(text)
}

function navigateToOracle(ideaId: string) {
  router.push(`/oracle?idea=${ideaId}`)
}

function handleTarotPrompt(prompt: string) {
  input.value = prompt
  nextTick(() => {
    inputField.value?.focus()
    inputField.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
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
    showToastMessage('Thread restored from History')
  } catch (error) {
    console.error('Failed to resume thread', error)
    showToastMessage('Could not load saved run')
  } finally {
    clearQueryParam('resume')
    resumingRunId.value = null
  }
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
  background: var(--color-bg);
  padding: var(--space-8) var(--space-6);
  position: relative;
}

.spark-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 50% at 50% 0%,
    rgba(212, 165, 116, 0.06) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.spark-header {
  text-align: center;
  margin-bottom: var(--space-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.spark-tagline {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  letter-spacing: 0.01em;
}

.spark-layout {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  transition: max-width 0.3s ease;
}

.spark-input-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  cursor: text;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.spark-input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-ring);
}

.spark-input {
  flex: 1;
  border: none;
  padding: var(--space-1) 0;
  font-size: var(--text-base);
  resize: none;
  background: transparent;
  font-family: inherit;
  min-height: 24px;
  max-height: 200px;
  line-height: 1.5;
  overflow-y: auto;
  outline: none;
  color: var(--color-text);
  scrollbar-width: none;
}

.spark-input::-webkit-scrollbar {
  display: none;
}

.spark-input::placeholder {
  color: var(--color-text-tertiary);
}

.generate-btn {
  flex-shrink: 0;
  align-self: flex-end;
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  height: 36px;
}

.generate-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.generate-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ideas-collection {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.collection-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.collection-header:hover .collapse-icon {
  color: var(--color-text-secondary);
}

.collection-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--color-text);
  margin: 0;
}

.collection-count {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--weight-normal);
}

.collapse-icon {
  margin-left: auto;
  color: var(--color-text-tertiary);
  transition:
    transform var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.collection-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.expand-btn {
  border: none;
  background: none;
  color: var(--color-primary);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--duration-fast) var(--ease-out);
}

.expand-btn:hover {
  background: var(--color-primary-subtle);
}

.ideas-grid-wrapper {
  position: relative;
}

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-6);
}

.idea-card {
  background: linear-gradient(180deg, rgba(42, 36, 32, 0.95) 0%, rgba(26, 22, 20, 0.98) 100%);
  border: 2px solid rgba(212, 165, 116, 0.3);
  border-radius: 4px;
  padding: var(--space-6);
  padding-top: var(--space-8);
  transition: all var(--duration-slow) var(--ease-out);
  position: relative;
  cursor: grab;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    inset 0 0 60px rgba(212, 165, 116, 0.03);
}

.idea-card::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(212, 165, 116, 0.2);
  pointer-events: none;
}

.idea-card::after {
  content: '✦';
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--color-primary);
  opacity: 0.7;
  letter-spacing: 0.5em;
}

.idea-card .tarot-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: rgba(212, 165, 116, 0.25);
  border-style: solid;
  border-width: 0;
}

.idea-card .tarot-corner.top-left {
  top: 16px;
  left: 16px;
  border-top-width: 1px;
  border-left-width: 1px;
}

.idea-card .tarot-corner.top-right {
  top: 16px;
  right: 16px;
  border-top-width: 1px;
  border-right-width: 1px;
}

.idea-card .tarot-corner.bottom-left {
  bottom: 16px;
  left: 16px;
  border-bottom-width: 1px;
  border-left-width: 1px;
}

.idea-card .tarot-corner.bottom-right {
  bottom: 16px;
  right: 16px;
  border-bottom-width: 1px;
  border-right-width: 1px;
}

.idea-card:hover {
  border-color: var(--color-primary);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(212, 165, 116, 0.15),
    inset 0 0 80px rgba(212, 165, 116, 0.05),
    inset 0 0 20px rgba(212, 165, 116, 0.12);
  transform: translateY(-8px);
}

.idea-card.dragging {
  opacity: 0.7;
  cursor: grabbing;
  transform: rotate(3deg) scale(1.03);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 30px rgba(212, 165, 116, 0.2);
}

.unpin-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s var(--ease-out);
  color: var(--color-text-tertiary);
  z-index: 10;
}

.idea-card:hover .unpin-btn {
  opacity: 0.6;
}

.unpin-btn:hover {
  opacity: 1;
  color: var(--color-error);
  transform: scale(1.1);
}

.idea-text {
  margin: var(--space-2) 0 var(--space-4) 0;
  padding: 0 var(--space-2);
  color: var(--color-text);
  line-height: 1.7;
  font-size: var(--text-sm);
  flex: 1;
  text-align: center;
}

.idea-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  opacity: 0;
  transition: opacity 0.3s var(--ease-out);
  margin-top: auto;
  padding-top: var(--space-3);
}

.idea-card:hover .idea-actions {
  opacity: 1;
}

.action-btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid rgba(212, 165, 116, 0.25);
  background: transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-heading);
  font-weight: 400;
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s var(--ease-out);
}

.action-btn:hover {
  background: rgba(212, 165, 116, 0.1);
  border-color: rgba(212, 165, 116, 0.5);
  color: var(--color-primary);
}

.action-btn.oracle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-color: rgba(126, 184, 201, 0.25);
}

.action-btn.oracle-btn:hover {
  background: rgba(126, 184, 201, 0.1);
  border-color: rgba(126, 184, 201, 0.5);
  color: var(--color-oracle);
}

.collection-footer {
  display: flex;
  justify-content: center;
  padding-top: var(--space-4);
}

.recent-runs {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.runs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--color-text);
  margin: 0;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.selection-count {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--weight-medium);
}

.selection-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.selection-btn:hover {
  background: var(--color-primary-hover);
}

.selection-btn.secondary {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.selection-btn.secondary:hover {
  background: var(--color-hover-bg);
}

.loading-card {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-secondary);
}

.journal-feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.journal-entry {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.journal-entry.branched {
  border-left: 3px solid var(--color-primary);
}

.branch-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.branch-indicator svg {
  flex-shrink: 0;
  color: var(--color-primary);
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
  gap: var(--space-4);
}

.entry-prompt-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.entry-prompt {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  line-height: 1.5;
}

.expand-prompt-btn {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  padding: 0;
}

.expand-prompt-btn:hover {
  text-decoration: underline;
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.new-badge {
  background: var(--color-primary);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.entry-time {
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  white-space: nowrap;
}

.idea-deck {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.idea-pill {
  border-radius: 4px;
  padding: var(--space-5);
  padding-top: var(--space-6);
  background: linear-gradient(180deg, rgba(42, 36, 32, 0.9) 0%, rgba(26, 22, 20, 0.95) 100%);
  border: 1.5px solid rgba(212, 165, 116, 0.25);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: all var(--duration-slow) var(--ease-out);
  position: relative;
  cursor: pointer;
  min-height: 180px;
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.4),
    inset 0 0 40px rgba(212, 165, 116, 0.02);
}

.idea-pill::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(212, 165, 116, 0.15);
  pointer-events: none;
}

.idea-pill::after {
  content: '◆';
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  color: var(--color-primary);
  opacity: 0.5;
}

.idea-pill.selected {
  border-color: var(--color-primary);
  background: linear-gradient(180deg, rgba(212, 165, 116, 0.1) 0%, rgba(26, 22, 20, 0.95) 100%);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(212, 165, 116, 0.2),
    inset 0 0 60px rgba(212, 165, 116, 0.05);
}

.idea-pill:hover {
  border-color: rgba(212, 165, 116, 0.5);
  box-shadow:
    0 10px 36px rgba(0, 0, 0, 0.45),
    0 0 20px rgba(212, 165, 116, 0.1);
  transform: translateY(-4px);
}

.pill-checkbox {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  color: transparent;
  transition: all var(--duration-fast) var(--ease-out);
}

.idea-pill.selected .pill-checkbox {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg);
  box-shadow: 0 0 8px var(--color-glow-amber);
}

.idea-pill p {
  margin: 0;
  line-height: 1.6;
  padding-right: calc(20px + var(--space-2));
  font-size: var(--text-sm);
  color: var(--color-text);
  flex: 1;
}

.pill-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-3);
}

.icon-action-btn {
  background: transparent;
  border: 1px solid rgba(212, 165, 116, 0.2);
  padding: var(--space-2);
  color: var(--color-text-tertiary);
  cursor: pointer;
  min-width: 36px;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s var(--ease-out);
}

.icon-action-btn:hover {
  background: rgba(212, 165, 116, 0.1);
  border-color: rgba(212, 165, 116, 0.4);
  color: var(--color-primary);
}

.toast {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  background: var(--color-surface);
  color: var(--color-text);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  z-index: 150;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

.toast svg {
  color: var(--color-success);
}

.toast-enter-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.toast-leave-active {
  transition: all 400ms var(--ease-out);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.particle-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 200;
}

.smoke-particle {
  position: fixed;
  border-radius: 50%;
  filter: blur(4px);
  pointer-events: none;
}

.floating-input-btn {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 48px;
  height: 48px;
  border: none;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all var(--duration-fast) var(--ease-out);
  z-index: 100;
}

.floating-input-btn:hover {
  background: var(--color-primary-hover);
  transform: scale(1.05);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.idea-list-enter-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.idea-list-leave-active {
  transition: all var(--duration-fast) var(--ease-out);
}

.idea-list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.idea-list-leave-to {
  opacity: 0;
}

.idea-list-move {
  transition: transform var(--duration-normal) var(--ease-out);
}

@media (max-width: 640px) {
  .spark-page {
    padding: var(--space-4);
  }

  .ideas-grid {
    grid-template-columns: 1fr;
  }

  .idea-deck {
    grid-template-columns: 1fr;
  }

  .runs-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .selection-actions {
    width: 100%;
    justify-content: space-between;
  }

  .floating-input-btn {
    bottom: 80px;
  }
}

.demo-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 8, 6, 0.97);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--space-4);
  animation: overlayReveal 1.2s var(--ease-out);
}

@keyframes overlayReveal {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.demo-ambient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212, 165, 116, 0.08) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(149, 117, 205, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(126, 184, 201, 0.04) 0%, transparent 35%);
  opacity: 1;
  pointer-events: none;
  animation: ambientBreath 6s ease-in-out infinite;
}

@keyframes ambientBreath {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

.grimoire-container {
  position: relative;
  display: flex;
  animation: grimoireOpen 1s var(--ease-out) 0.3s both;
}

@keyframes grimoireOpen {
  0% {
    opacity: 0;
    transform: scale(0.9) rotateX(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateX(0);
  }
}

.grimoire-spine {
  width: 20px;
  background: linear-gradient(
    90deg,
    rgba(60, 45, 35, 1) 0%,
    rgba(80, 60, 45, 1) 30%,
    rgba(50, 38, 28, 1) 70%,
    rgba(40, 30, 22, 1) 100%
  );
  border-radius: 4px 0 0 4px;
  box-shadow:
    inset -4px 0 8px rgba(0, 0, 0, 0.4),
    2px 0 4px rgba(0, 0, 0, 0.3);
}

.grimoire-page {
  position: relative;
  max-width: 580px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: var(--space-8) var(--space-8);
  text-align: center;
  background: linear-gradient(
    135deg,
    rgba(35, 30, 25, 0.98) 0%,
    rgba(28, 24, 20, 0.99) 50%,
    rgba(32, 27, 22, 0.98) 100%
  );
  border: 2px solid rgba(212, 165, 116, 0.25);
  border-left: none;
  border-radius: 0 4px 4px 0;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    inset 0 0 100px rgba(212, 165, 116, 0.03);
}

.page-texture {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}

.grimoire-whisper {
  margin: 0 0 var(--space-2);
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.2;
  letter-spacing: 0.02em;
  animation: whisperReveal 1.5s var(--ease-out) 0.8s both;
  text-shadow:
    0 0 60px rgba(212, 165, 116, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.08),
    0 -1px 0 rgba(0, 0, 0, 0.3);
}

.grimoire-subtitle {
  margin: 0 0 var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  letter-spacing: 0.05em;
  animation: whisperReveal 1.5s var(--ease-out) 1s both;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06),
    0 -1px 0 rgba(0, 0, 0, 0.25);
}

@keyframes whisperReveal {
  0% {
    opacity: 0;
    transform: translateY(-10px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.grimoire-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  animation: dividerReveal 1s var(--ease-out) 1.2s both;
}

@keyframes dividerReveal {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}

.divider-line {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.4), transparent);
}

.divider-symbol {
  color: var(--color-primary);
  font-size: 12px;
  opacity: 0.6;
}

.demo-label {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text-tertiary);
  font-weight: var(--weight-medium);
  animation: labelReveal 0.8s var(--ease-out) 1.4s both;
}

@keyframes labelReveal {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.demo-prompt {
  margin: 0 0 var(--space-3);
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.4;
  animation: promptReveal 0.8s var(--ease-out) 1.5s both;
}

.demo-result-label {
  margin: 0 0 var(--space-5);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  animation: promptReveal 0.8s var(--ease-out) 1.6s both;
}

@keyframes promptReveal {
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.demo-ideas {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  text-align: left;
  margin-bottom: var(--space-6);
  max-height: 320px;
  overflow-y: auto;
}

.demo-idea {
  padding: var(--space-3) var(--space-4);
  background: linear-gradient(180deg, rgba(42, 36, 32, 0.7) 0%, rgba(26, 22, 20, 0.8) 100%);
  border: 1px solid rgba(212, 165, 116, 0.15);
  border-radius: 4px;
  opacity: 0;
  animation: cardDeal 0.5s var(--ease-out) forwards;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.card-numeral {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  color: var(--color-primary);
  opacity: 0.6;
  flex-shrink: 0;
  min-width: 20px;
}

@keyframes cardDeal {
  0% {
    opacity: 0;
    transform: translateX(-20px) rotate(-2deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotate(0);
  }
}

.demo-idea p {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text);
}

.demo-cta {
  display: inline-block;
  padding: var(--space-4) var(--space-8);
  background: transparent;
  color: var(--color-primary);
  border: 1.5px solid rgba(212, 165, 116, 0.4);
  border-radius: 4px;
  font-family: var(--font-heading);
  font-size: var(--text-base);
  font-weight: 400;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.4s var(--ease-out);
  animation: ctaReveal 0.8s var(--ease-out) 1.8s both;
}

@keyframes ctaReveal {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.demo-cta:hover {
  background: rgba(212, 165, 116, 0.1);
  border-color: var(--color-primary);
  box-shadow: 0 0 30px rgba(212, 165, 116, 0.2);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .grimoire-spine {
    display: none;
  }

  .grimoire-page {
    border-radius: 4px;
    border-left: 2px solid rgba(212, 165, 116, 0.25);
    padding: var(--space-6);
  }

  .grimoire-whisper {
    font-size: 1.75rem;
  }

  .demo-prompt {
    font-size: 1.25rem;
  }
}

@keyframes card-deal {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-3deg);
  }
  70% {
    opacity: 1;
    transform: scale(1.02) rotate(1deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.idea-pill.card-deal-animate {
  animation: card-deal 0.4s var(--ease-out) backwards;
}

@media (prefers-reduced-motion: reduce) {
  .demo-overlay,
  .grimoire-container,
  .grimoire-whisper,
  .grimoire-divider,
  .demo-idea,
  .demo-cta,
  .demo-ambient {
    animation: none;
  }

  .demo-idea,
  .grimoire-whisper,
  .grimoire-divider,
  .demo-cta {
    opacity: 1;
  }

  .idea-pill.card-deal-animate {
    animation: none;
    opacity: 1;
  }
}
</style>
