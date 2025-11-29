<template>
  <div class="spark-page">
    <div class="spark-layout">
      <div ref="inputSection" class="spark-input-wrapper" @click="focusInput">
        <textarea
          ref="inputField"
          v-model="input"
          class="spark-input"
          rows="1"
          placeholder="What do you want to explore?"
          @keydown.enter.exact.prevent="handleGenerate()"
        />
        <button
          class="generate-btn"
          type="button"
          :disabled="!canGenerate || isGenerating"
          @click.stop="handleGenerate()"
        >
          <Loader v-if="isGenerating" :size="18" class="spin" />
          <span v-else>Generate</span>
        </button>
      </div>

      <section v-if="savedIdeas.length > 0" class="ideas-collection">
        <button class="collection-header" @click="ideasCollapsed = !ideasCollapsed">
          <h2 class="collection-title">Your ideas</h2>
          <span class="collection-count">{{ savedIdeas.length }}</span>
          <ChevronDown :size="18" class="collapse-icon" :class="{ collapsed: ideasCollapsed }" />
        </button>
        <div v-show="!ideasCollapsed" class="collection-content">
          <transition-group name="idea-list" tag="div" class="ideas-grid">
            <div
              v-for="idea in showAllIdeas ? savedIdeas : savedIdeas.slice(0, 6)"
              :key="idea.id"
              class="idea-card"
              :class="{ dragging: isDraggingIdea === idea.id }"
              draggable="true"
              @dragstart="e => handleIdeaDragStart(e, idea)"
              @dragend="handleIdeaDragEnd"
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
              <p class="idea-text">{{ idea.text }}</p>
              <div class="idea-actions">
                <button class="action-btn" @click="handleExploreIdea(idea.text)">
                  Generate more
                </button>
                <button class="action-btn oracle-btn" @click="navigateToOracle(idea.id)">
                  <HelpCircle :size="16" />
                  Ask Oracle
                </button>
              </div>
            </div>
          </transition-group>
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
              Branch all
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
                :class="{ selected: selectedIdeas.has(`${entry.id}-${ideaIndex}`) }"
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
                    title="Branch and explore"
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
import { Loader, Check, BookmarkPlus, CornerDownRight, Split, HelpCircle, ChevronDown } from 'lucide-vue-next'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

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

const INPUT_HEIGHT_LIMIT = 100

const router = useRouter()
const route = useRoute()

const isDraggingIdea = ref<string | null>(null)
const generationCount = ref(0)

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
  setTimeout(() => {
    showToast.value = false
  }, 2200)
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

onMounted(async () => {
  restoreThread()
  fetchSavedIdeas()
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
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  cursor: text;
  transition: border-color var(--duration-fast) var(--ease-out),
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
  max-height: 120px;
  line-height: 1.5;
  overflow-y: hidden;
  outline: none;
  color: var(--color-text);
}

.spark-input::placeholder {
  color: var(--color-text-tertiary);
}

.generate-btn {
  flex-shrink: 0;
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
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
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
  transition: transform var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
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

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.idea-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  padding-top: var(--space-3);
  transition: all var(--duration-fast) var(--ease-out);
  position: relative;
  cursor: grab;
}

.idea-card:hover {
  border-color: var(--color-border-strong);
}

.idea-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.unpin-btn {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all var(--duration-fast) var(--ease-out);
  color: var(--color-text-tertiary);
}

.idea-card:hover .unpin-btn {
  opacity: 1;
}

.unpin-btn:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}



.idea-text {
  margin: 0 0 var(--space-3) 0;
  padding-right: var(--space-6);
  color: var(--color-text);
  line-height: 1.5;
  font-size: var(--text-base);
}

.idea-actions {
  display: flex;
  gap: var(--space-2);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.idea-card:hover .idea-actions {
  opacity: 1;
}

.action-btn {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.action-btn:hover {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.action-btn.oracle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
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
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
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
  background: rgba(0, 0, 0, 0.02);
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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-3);
}

.idea-pill {
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: all var(--duration-fast) var(--ease-out);
  position: relative;
  cursor: pointer;
}

.idea-pill.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
}

.idea-pill:hover {
  box-shadow: var(--shadow-sm);
}

.pill-checkbox {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
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
  color: white;
}

.idea-pill p {
  margin: 0;
  line-height: 1.5;
  padding-left: calc(18px + var(--space-3));
  font-size: var(--text-base);
  color: var(--color-text);
}

.pill-actions {
  display: flex;
  gap: var(--space-2);
  padding-left: calc(18px + var(--space-3));
}

.icon-action-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  color: var(--color-text-secondary);
  cursor: pointer;
  min-width: 36px;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}

.icon-action-btn:hover {
  background: var(--color-primary-subtle);
  border-color: var(--color-primary);
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

.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
</style>
