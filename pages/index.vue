<template>
  <div class="spark-page">
    <BackgroundRunes variant="spark" />

    <div class="spark-layout">
      <div class="spark-input-section">
        <ClientOnly>
          <DailyTarot
            :locked-lens="lockedLens"
            @card-selected="handleTarotCard"
            @lens-locked="handleLensLocked"
            @lens-unlocked="handleLensUnlocked"
          />
        </ClientOnly>

        <div
          ref="inputSection"
          class="spark-input-wrapper"
          :class="{ 'input-empty': !input.trim() && !isGenerating, 'has-lens': !!lockedLens }"
          @click="focusInput"
        >
          <textarea
            ref="inputField"
            v-model="input"
            class="spark-input"
            rows="1"
            :placeholder="
              lockedLens ? `Explore through ${lockedLens.name}...` : 'What do you want to explore?'
            "
            @keydown.enter.exact.prevent="handleGenerate()"
          />
          <button
            class="generate-btn"
            type="button"
            :disabled="!canGenerate || isGenerating"
            @click.stop="handleGenerate()"
          >
            <span v-if="isGenerating" class="btn-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </span>
            <span v-else>Diverge</span>
          </button>
        </div>
      </div>

      <section v-if="entries.length > 0 || isGenerating" class="session-list">
        <div v-if="starredCount > 0 && !isGenerating" class="filter-bar">
          <button
            class="filter-toggle"
            :class="{ active: showStarredOnly }"
            @click="toggleStarredFilter"
          >
            <Star :size="14" />
            <span>{{ showStarredOnly ? 'Show all' : `Starred (${starredCount})` }}</span>
          </button>
        </div>

        <div v-if="isGenerating" ref="loadingCard" class="loading-card">
          <div class="spark-kindling">
            <span class="kindle-core"></span>
            <span class="kindle-glow"></span>
          </div>
          <p v-if="activeLens || lockedLens" class="loading-lens">
            <span class="lens-label">Through the lens of</span>
            <span class="lens-name">{{ (activeLens || lockedLens)?.name }}</span>
          </p>
          <p v-else class="loading-text">Kindling sparks</p>
        </div>

        <div class="session-feed">
          <article
            v-for="(entry, entryIndex) in entries"
            v-show="!showStarredOnly || getSessionStarredCount(entry) > 0"
            :key="entry.id"
            class="session-entry"
            :class="{ latest: entryIndex === 0 && !showStarredOnly }"
          >
            <button class="session-header" @click="toggleSessionExpansion(entry.id)">
              <ChevronDown
                :size="16"
                class="session-toggle"
                :class="{ collapsed: collapsedSessions.has(entry.id) }"
              />
              <span class="session-prompt">{{ truncatePrompt(entry.prompt) }}</span>
              <span v-if="getSessionStarredCount(entry) > 0" class="session-starred-count">
                <Star :size="12" />
                {{ getSessionStarredCount(entry) }}
              </span>
              <span class="session-time">{{ formatRelative(entry.timestamp) }}</span>
            </button>

            <div v-show="!collapsedSessions.has(entry.id)" class="session-ideas">
              <div
                v-for="(idea, ideaIndex) in getFilteredIdeas(entry)"
                :key="`${entry.id}-${ideaIndex}`"
                class="idea-row"
                :class="{
                  'card-deal-animate': shouldAnimateCard(entry.id),
                  starred: isIdeaStarred(idea.text)
                }"
                :style="
                  getCardDealDelay(entry.id, ideaIndex)
                    ? { animationDelay: getCardDealDelay(entry.id, ideaIndex) }
                    : undefined
                "
              >
                <button
                  class="star-btn"
                  :class="{ active: isIdeaStarred(idea.text) }"
                  title="Star idea"
                  @click="toggleStarIdea(idea.text)"
                >
                  <Star :size="14" />
                </button>
                <p class="idea-text">{{ idea.text }}</p>
                <div class="idea-hover-actions">
                  <button class="hover-action" @click="navigateToBrew(idea.text)">Mix</button>
                  <button class="hover-action" @click="navigateToConsult(idea.text)">
                    Discuss
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
  </div>
</template>

<script setup lang="ts">
import { Check, ChevronDown, Star } from 'lucide-vue-next'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import DailyTarot from '~/components/DailyTarot.vue'
import { useParticles } from '~/composables/useParticles'
import { useReducedMotion } from '~/composables/useReducedMotion'
import { useSound } from '~/composables/useSound'

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

const STORAGE_KEY = 'spark-thread-journal'
const STARRED_KEY = 'spark-starred-ideas'
const COLLAPSED_KEY = 'spark-collapsed-sessions'
const LOCKED_LENS_KEY = 'spark-locked-lens'

const input = ref('')
const entries = ref<JournalEntry[]>([])
const starredIdeas = ref<Set<string>>(new Set())
const collapsedSessions = ref<Set<string>>(new Set())
const showStarredOnly = ref(false)
const isGenerating = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const lastPrompt = ref('')
const activeLens = ref<{ name: string; meaning: string } | null>(null)
const lockedLens = ref<{ name: string; meaning: string } | null>(null)
const resumingRunId = ref<string | null>(null)
const inputSection = ref<HTMLElement | null>(null)
const inputField = ref<HTMLTextAreaElement | null>(null)
const loadingCard = ref<HTMLElement | null>(null)
const toastRef = ref<HTMLElement | null>(null)

const INPUT_HEIGHT_LIMIT = 100

const router = useRouter()
const route = useRoute()
const prefersReducedMotion = useReducedMotion()
const { play: playSound } = useSound()
const { particles, spawnSmokeParticles } = useParticles()

const latestEntryId = ref<string | null>(null)

const canGenerate = computed(() => input.value.trim().length > 0)
const starredCount = computed(() => starredIdeas.value.size)
const historyPayload = computed(() =>
  entries.value.map(entry => ({
    prompt: entry.prompt,
    ideas: [
      ...entry.coreIdeas.map(idea => idea.text),
      ...entry.lenses.flatMap(lens => lens.ideas.map(idea => idea.text))
    ]
  }))
)

function getFilteredIdeas(entry: JournalEntry): FlatIdea[] {
  const all = getAllIdeas(entry)
  if (!showStarredOnly.value) return all
  return all.filter(idea => starredIdeas.value.has(idea.text))
}

function getSessionStarredCount(entry: JournalEntry): number {
  const all = getAllIdeas(entry)
  return all.filter(idea => starredIdeas.value.has(idea.text)).length
}

function toggleStarredFilter() {
  showStarredOnly.value = !showStarredOnly.value
}

function getCardDealDelay(entryId: string, index: number): string | undefined {
  if (prefersReducedMotion.value) return undefined
  if (entryId !== latestEntryId.value) return undefined
  return `${index * 80}ms`
}

function shouldAnimateCard(entryId: string): boolean {
  return !prefersReducedMotion.value && entryId === latestEntryId.value
}

interface FlatIdea {
  text: string
}

function getAllIdeas(entry: JournalEntry): FlatIdea[] {
  return entry.coreIdeas.map(idea => ({ text: idea.text }))
}

function truncatePrompt(prompt: string, maxLength = 80): string {
  if (prompt.length <= maxLength) return prompt
  return prompt.slice(0, maxLength) + '...'
}

function formatRelative(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function toggleSessionExpansion(entryId: string) {
  if (collapsedSessions.value.has(entryId)) {
    collapsedSessions.value.delete(entryId)
  } else {
    collapsedSessions.value.add(entryId)
  }
  collapsedSessions.value = new Set(collapsedSessions.value)
  saveCollapsedSessions()
}

function saveCollapsedSessions() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...collapsedSessions.value]))
}

function restoreCollapsedSessions() {
  if (typeof window === 'undefined') return
  const stored = window.localStorage.getItem(COLLAPSED_KEY)
  if (!stored) return
  try {
    const parsed = JSON.parse(stored) as string[]
    if (Array.isArray(parsed)) {
      collapsedSessions.value = new Set(parsed)
    }
  } catch {
    // ignore
  }
}

function isIdeaStarred(text: string): boolean {
  return starredIdeas.value.has(text)
}

function toggleStarIdea(text: string) {
  if (starredIdeas.value.has(text)) {
    starredIdeas.value.delete(text)
  } else {
    starredIdeas.value.add(text)
    playSound('chime')
  }
  starredIdeas.value = new Set(starredIdeas.value)
  saveStarredIdeas()
}

function saveStarredIdeas() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STARRED_KEY, JSON.stringify([...starredIdeas.value]))
}

function restoreStarredIdeas() {
  if (typeof window === 'undefined') return
  const stored = window.localStorage.getItem(STARRED_KEY)
  if (!stored) return
  try {
    const parsed = JSON.parse(stored) as string[]
    if (Array.isArray(parsed)) {
      starredIdeas.value = new Set(parsed)
    }
  } catch {
    // ignore
  }
}

function navigateToBrew(text: string) {
  router.push({ path: '/cauldron', query: { add: text } })
}

function navigateToConsult(text: string) {
  router.push({ path: '/oracle', query: { context: text } })
}

async function handleGenerate(customPrompt?: string, parentEntry?: JournalEntry) {
  const topic = (customPrompt ?? input.value).trim()
  if (!topic || isGenerating.value) return

  isGenerating.value = true

  await nextTick()
  loadingCard.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const currentLens = activeLens.value || lockedLens.value

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
        parentPrompt: parentEntry?.prompt,
        lens: currentLens ? { name: currentLens.name, meaning: currentLens.meaning } : undefined
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

    playSound('arrive')
    latestEntryId.value = entry.id
    entries.value = [entry, ...entries.value].slice(0, 6)
    lastPrompt.value = topic
    activeLens.value = null

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

function focusInput() {
  nextTick(() => {
    inputField.value?.focus()
  })
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

function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
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

onMounted(async () => {
  restoreThread()
  restoreStarredIdeas()
  restoreCollapsedSessions()
  restoreLockedLens()
  await nextTick()
  adjustInputHeight()
})

interface TarotCard {
  id: string
  name: string
  numeral: string
  archetype: string
  keywords: string[]
  meaning: string
  creativePrompt: string
}

function handleTarotCard(card: TarotCard) {
  activeLens.value = { name: card.name, meaning: card.meaning }
  const prompt = `${card.name}: ${card.meaning}`
  handleGenerate(prompt)
}

function handleLensLocked(lens: { name: string; meaning: string }) {
  lockedLens.value = lens
  saveLockedLens()
  playSound('whoosh')
  showToastMessage(`Lens locked: ${lens.name}`)
}

function handleLensUnlocked() {
  lockedLens.value = null
  saveLockedLens()
  playSound('whoosh')
  showToastMessage('Lens unlocked')
}

function saveLockedLens() {
  if (typeof window === 'undefined') return
  if (lockedLens.value) {
    window.localStorage.setItem(LOCKED_LENS_KEY, JSON.stringify(lockedLens.value))
  } else {
    window.localStorage.removeItem(LOCKED_LENS_KEY)
  }
}

function restoreLockedLens() {
  if (typeof window === 'undefined') return
  const stored = window.localStorage.getItem(LOCKED_LENS_KEY)
  if (!stored) return
  try {
    lockedLens.value = JSON.parse(stored)
  } catch {
    // ignore
  }
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
    hsla(185, 75%, 55%, 0.08) 0%,
    transparent 50%
  );
  pointer-events: none;
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
  align-items: flex-end;
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

.spark-input-section {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.spark-input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-ring);
}

.spark-input-wrapper.input-empty {
  animation: inputBreath 4s ease-in-out infinite;
}

.spark-input-wrapper.input-empty:focus-within {
  animation: none;
}

@keyframes inputBreath {
  0%,
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
  50% {
    box-shadow: 0 0 20px hsla(185, 75%, 55%, 0.15);
  }
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
  color: var(--color-text-secondary);
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

.btn-dots {
  display: flex;
  gap: 3px;
  align-items: center;
}

.btn-dots .dot {
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  animation: btnDotPulse 1s ease-in-out infinite;
}

.btn-dots .dot:nth-child(2) {
  animation-delay: 0.15s;
}

.btn-dots .dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes btnDotPulse {
  0%,
  80%,
  100% {
    opacity: 0.4;
  }
  40% {
    opacity: 1;
  }
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.filter-bar {
  display: flex;
  justify-content: flex-end;
  padding: 0 var(--space-2);
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.filter-toggle:hover {
  color: var(--color-text);
  background: hsla(185, 75%, 55%, 0.08);
}

.filter-toggle.active {
  color: var(--color-primary);
  border-color: hsla(185, 75%, 55%, 0.3);
  background: hsla(185, 75%, 55%, 0.08);
}

.loading-card {
  text-align: center;
  padding: var(--space-10) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.spark-kindling {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kindle-core {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: kindleCore 1.5s ease-in-out infinite;
}

.kindle-glow {
  position: absolute;
  width: 32px;
  height: 32px;
  background: radial-gradient(circle, var(--color-glow-spark) 0%, transparent 70%);
  border-radius: 50%;
  animation: kindleGlow 1.5s ease-in-out infinite;
}

@keyframes kindleCore {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

@keyframes kindleGlow {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.loading-text {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}

.loading-lens {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.lens-label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  letter-spacing: 0.02em;
}

.lens-name {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  color: var(--color-oracle);
  letter-spacing: 0.04em;
  text-shadow: 0 0 20px var(--color-glow-oracle);
}

.session-feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.session-entry {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.session-entry.latest {
  border-color: hsla(185, 75%, 55%, 0.3);
}

.session-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--duration-fast) var(--ease-out);
}

.session-header:hover {
  background: hsla(185, 75%, 55%, 0.03);
}

.session-toggle {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform var(--duration-fast) var(--ease-out);
}

.session-toggle.collapsed {
  transform: rotate(-90deg);
}

.session-prompt {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.session-starred-count {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-primary);
}

.session-time {
  flex-shrink: 0;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.session-ideas {
  padding: 0 var(--space-4) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.idea-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-sm);
  transition: background var(--duration-fast) var(--ease-out);
  position: relative;
}

.idea-row:hover {
  background: hsla(185, 75%, 55%, 0.05);
}

.idea-row.starred {
  background: hsla(185, 75%, 55%, 0.08);
}

.star-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: all var(--duration-fast) var(--ease-out);
}

.idea-row:hover .star-btn {
  opacity: 0.8;
}

.star-btn:hover {
  opacity: 1;
  color: var(--color-primary);
  transform: scale(1.1);
}

.star-btn.active {
  opacity: 1;
  color: var(--color-primary);
}

.idea-text {
  flex: 1;
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.7;
  letter-spacing: 0.01em;
}

.idea-hover-actions {
  display: flex;
  gap: var(--space-2);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.idea-row:hover .idea-hover-actions {
  opacity: 1;
}

.hover-action {
  padding: var(--space-1) var(--space-2);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-out);
}

.hover-action:hover {
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

@media (max-width: 640px) {
  .spark-page {
    padding: var(--space-4);
  }

  .idea-hover-actions {
    opacity: 1;
  }
}

@keyframes card-deal {
  0% {
    opacity: 0;
    transform: translateX(-8px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.idea-row.card-deal-animate {
  animation: card-deal 0.3s var(--ease-out) backwards;
}

@media (prefers-reduced-motion: reduce) {
  .idea-row.card-deal-animate {
    animation: none;
    opacity: 1;
  }

  .btn-dots .dot,
  .kindle-core,
  .kindle-glow {
    animation: none;
    opacity: 0.6;
  }

  .spark-input-wrapper.input-empty {
    animation: none;
  }
}
</style>
