<template>
  <div class="spark-page">
    <div class="spark-layout" :class="{ 'with-tray': showCollectionTray }">
      <header v-if="savedIdeas.length > 0" class="momentum-header">
        <div class="header-label">
          <h2>
            Your collection
            <span class="collection-count">{{ savedIdeas.length }}</span>
          </h2>
          <button class="tray-toggle" @click="showCollectionTray = !showCollectionTray">
            {{ showCollectionTray ? 'Hide tray' : 'Show tray' }}
          </button>
        </div>
        <div class="mini-corkboard">
          <div
            v-for="(idea, index) in savedIdeas.slice(0, 8)"
            :key="idea.id"
            class="mini-pin"
            :class="[`mini-pin-${index % 8}`, { 'mini-pin-cauldron': idea.isCauldronOutput }]"
            :title="idea.text"
            @click="scrollToFullCollection"
          >
            <div class="mini-tack" :class="{ 'mini-tack-cauldron': idea.isCauldronOutput }" />
            <div class="mini-pin-status" :data-status="idea.status" />
          </div>
          <button
            v-if="savedIdeas.length > 8"
            class="view-more-pins"
            @click="scrollToFullCollection"
          >
            +{{ savedIdeas.length - 8 }}
          </button>
        </div>
      </header>

      <div ref="inputSection" class="spark-input-wrapper" @click="focusInput">
        <div class="spark-input-area">
          <div v-if="input.length === 0" class="placeholder-container">
            <transition-group name="slide-up" tag="div" class="placeholder-wrapper">
              <span :key="currentPlaceholder" class="rotating-placeholder">
                {{ currentPlaceholder }}
              </span>
            </transition-group>
          </div>
          <textarea
            ref="inputField"
            v-model="input"
            class="spark-input"
            rows="1"
            @keydown.enter.exact.prevent="handleGenerate()"
          />
        </div>
        <div class="spark-input-actions" @click.stop>
          <button
            class="icon-button"
            type="button"
            :disabled="!canGenerate || isGenerating"
            :title="isGenerating ? 'Generating' : 'Generate'"
            @click="handleGenerate()"
          >
            <Lightbulb v-if="!isGenerating" :size="20" />
            <Loader v-else :size="20" class="spin" />
          </button>
        </div>
      </div>

      <section v-if="savedIdeas.length > 0" ref="ideasCollectionSection" class="ideas-collection">
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
            :class="{ 'cauldron-output': idea.isCauldronOutput, 'dragging': isDraggingIdea === idea.id }"
            draggable="true"
            @dragstart="(e) => handleIdeaDragStart(e, idea)"
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
            <div v-if="idea.isCauldronOutput" class="cauldron-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path
                  d="M8 12h8M12 8v8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Cauldron mix
            </div>
            <div class="idea-status" :data-status="idea.status">{{ idea.status }}</div>
            <p class="idea-text">{{ idea.text }}</p>
            <div class="idea-actions">
              <button class="action-btn" @click="handleExploreIdea(idea.text)">
                Generate more
              </button>
              <button
                v-if="idea.status === 'exploring' || idea.status === 'ready'"
                class="action-btn primary"
                @click="startBuilding(idea)"
              >
                Start building →
              </button>
              <button
                v-else-if="idea.status === 'building'"
                class="action-btn building"
                @click="$router.push(`/coach/${idea.id}`)"
              >
                Continue building
              </button>
            </div>
          </div>
        </transition-group>
        <div v-if="showAllIdeas && savedIdeas.length > 6" class="collection-footer">
          <button class="expand-btn" @click="showAllIdeas = false">Show less</button>
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
            <button class="selection-btn secondary" @click="clearSelection">
              Clear
            </button>
          </div>
        </div>
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

    <transition name="slide-tray">
      <aside v-if="showCollectionTray" class="collection-tray">
        <div class="tray-header">
          <h3>Collection</h3>
          <button class="tray-close" @click="showCollectionTray = false">
            <X :size="18" />
          </button>
        </div>
        <div class="tray-content">
          <div v-if="savedIdeas.length === 0" class="tray-empty">
            <BookmarkPlus :size="32" />
            <p>Save ideas to build your collection</p>
          </div>
          <div v-else class="tray-list">
            <div
              v-for="idea in savedIdeas"
              :key="idea.id"
              class="tray-item"
              :class="{ 'tray-item-cauldron': idea.isCauldronOutput, 'dragging': isDraggingIdea === idea.id }"
              draggable="true"
              @dragstart="(e) => handleIdeaDragStart(e, idea)"
              @dragend="handleIdeaDragEnd"
            >
              <div class="tray-item-status" :data-status="idea.status" />
              <div class="tray-item-content">
                <p class="tray-item-text">{{ idea.text }}</p>
                <div class="tray-item-actions">
                  <button
                    class="tray-action"
                    title="Explore"
                    @click="handleExploreIdea(idea.text)"
                  >
                    <Lightbulb :size="14" />
                  </button>
                  <button
                    v-if="idea.status !== 'building'"
                    class="tray-action primary"
                    title="Start building"
                    @click="startBuilding(idea)"
                  >
                    <ArrowRight :size="14" />
                  </button>
                  <button
                    v-else
                    class="tray-action building"
                    title="Continue"
                    @click="$router.push(`/coach/${idea.id}`)"
                  >
                    <ArrowRight :size="14" />
                  </button>
                  <button
                    class="tray-action danger"
                    title="Remove"
                    @click="handleDeleteIdea(idea.id)"
                  >
                    <X :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
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
import { Lightbulb, Loader, Check, BookmarkPlus, CornerDownRight, Split, X, ArrowRight, GripVertical } from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDragAndDrop } from '~/composables/useDragAndDrop'

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
  status: 'exploring' | 'ready' | 'building' | 'done'
  createdAt: string
  isCauldronOutput?: number
  cauldronSessionId?: string
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
const showCollectionTray = ref(false)
const selectedIdeas = ref<Map<string, { text: string; entry: JournalEntry }>>(new Map())
const inputSection = ref<HTMLElement | null>(null)
const inputField = ref<HTMLTextAreaElement | null>(null)
const ideasCollectionSection = ref<HTMLElement | null>(null)

const INPUT_HEIGHT_LIMIT = 100

const router = useRouter()
const route = useRoute()
const { onDragStartSavedIdea, onDragEnd } = useDragAndDrop()

const isDraggingIdea = ref<string | null>(null)

const placeholders = [
  'What do you want to explore?',
  'An idea you want to develop...',
  'A problem you want to solve...',
  'Something you are curious about...',
  'A project you are thinking about...',
  'A skill you want to learn...',
  'A challenge you are facing...'
]
const currentPlaceholder = ref(placeholders[0])
let placeholderIndex = 0
let rotationInterval: ReturnType<typeof setInterval> | null = null

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
  onDragStartSavedIdea(event, {
    id: idea.id,
    text: idea.text,
    isCauldronOutput: !!idea.isCauldronOutput
  })
}

function handleIdeaDragEnd() {
  isDraggingIdea.value = null
  onDragEnd()
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

function scrollToFullCollection() {
  ideasCollectionSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

function startPlaceholderRotation() {
  rotationInterval = setInterval(() => {
    if (input.value.trim().length > 0) return

    placeholderIndex = (placeholderIndex + 1) % placeholders.length
    currentPlaceholder.value = placeholders[placeholderIndex]
  }, 3500)
}

function stopPlaceholderRotation() {
  if (rotationInterval) {
    clearInterval(rotationInterval)
    rotationInterval = null
  }
}

onMounted(async () => {
  restoreThread()
  fetchSavedIdeas()
  await nextTick()
  adjustInputHeight()
  startPlaceholderRotation()
})

onUnmounted(() => {
  stopPlaceholderRotation()
})

async function fetchSavedIdeas() {
  try {
    const response = await $fetch<{ ideas: SavedIdea[] }>('/api/saved-ideas')
    savedIdeas.value = response.ideas.sort((a, b) => {
      if (a.isCauldronOutput && !b.isCauldronOutput) return -1
      if (!a.isCauldronOutput && b.isCauldronOutput) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
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
    showToastMessage('Thread restored from History')
  } catch (error) {
    console.error('Failed to resume thread', error)
    showToastMessage('Could not load saved run')
  } finally {
    clearQueryParam('resume')
    resumingRunId.value = null
  }
}

async function startBuilding(idea: SavedIdea) {
  try {
    await $fetch(`/api/saved-ideas/${idea.id}`, {
      method: 'PATCH',
      body: { status: 'building' }
    })

    const index = savedIdeas.value.findIndex(i => i.id === idea.id)
    if (index !== -1) {
      savedIdeas.value[index].status = 'building'
    }

    await router.push(`/coach/${idea.id}`)
  } catch (error) {
    console.error('Failed to start building:', error)
    showToastMessage('Failed to start building')
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
  background: linear-gradient(135deg, #fff5f0 0%, #fef8f5 100%);
  padding: 2rem 1.5rem 4rem;
}

.spark-layout {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  transition: max-width 0.3s ease;
}

.spark-layout.with-tray {
  max-width: 800px;
  margin-right: 340px;
}

.momentum-header {
  background: linear-gradient(135deg, #fefaf5 0%, #fef5f0 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0e5e0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-label h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #40312b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.collection-count {
  font-size: 1rem;
  color: #d4756f;
  font-weight: 700;
  background: rgba(212, 117, 111, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.tray-toggle {
  border: 1px solid rgba(212, 117, 111, 0.3);
  background: white;
  color: #d4756f;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tray-toggle:hover {
  background: rgba(212, 117, 111, 0.1);
  border-color: #d4756f;
}

.mini-corkboard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
  padding: 0.5rem;
}

.mini-pin {
  aspect-ratio: 1;
  background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%);
  border: 1px solid #f0e5e0;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.mini-pin.mini-pin-cauldron {
  background: linear-gradient(135deg, #fff9f0 0%, #ffe8e0 100%);
  border: 2px solid #d4756f;
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.2), 0 0 20px rgba(212, 117, 111, 0.1);
}

.mini-tack {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #d4756f;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(212, 117, 111, 0.4);
  z-index: 2;
}

.mini-tack.mini-tack-cauldron {
  width: 14px;
  height: 14px;
  top: -7px;
  background: linear-gradient(135deg, #d4756f 0%, #e08a7f 100%);
  box-shadow: 0 2px 8px rgba(212, 117, 111, 0.6), 0 0 12px rgba(212, 117, 111, 0.3);
}

.mini-pin-status {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fde7ff;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mini-pin-status[data-status='ready'] { background: #fff0da; }
.mini-pin-status[data-status='building'] { background: #e9f8ec; }
.mini-pin-status[data-status='done'] { background: #e9edff; }

.mini-pin-0 { transform: rotate(-2deg); }
.mini-pin-1 { transform: rotate(1.5deg); }
.mini-pin-2 { transform: rotate(-1deg); }
.mini-pin-3 { transform: rotate(2deg); }
.mini-pin-4 { transform: rotate(-1.5deg); }
.mini-pin-5 { transform: rotate(1deg); }
.mini-pin-6 { transform: rotate(-2.5deg); }
.mini-pin-7 { transform: rotate(1.8deg); }

.mini-pin:hover {
  transform: translateY(-4px) rotate(-2deg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  z-index: 1;
}

.view-more-pins {
  aspect-ratio: 1;
  background: rgba(212, 117, 111, 0.1);
  border: 2px dashed rgba(212, 117, 111, 0.3);
  border-radius: 8px;
  color: #d4756f;
  font-weight: 700;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-more-pins:hover {
  background: rgba(212, 117, 111, 0.15);
  border-color: rgba(212, 117, 111, 0.5);
  transform: translateY(-2px);
}

.spark-input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  background: white;
  border: 1px solid #f0e5e0;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 1rem 1.25rem 0.75rem;
  cursor: text;
  min-height: 80px;
}

.spark-input-area {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.placeholder-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  pointer-events: none;
  color: #a0a0a0;
  font-size: 1.0625rem;
  height: 26px;
  overflow: hidden;
}

.placeholder-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.rotating-placeholder {
  position: absolute;
  white-space: nowrap;
  left: 0;
  top: 0;
}

.slide-up-enter-active { transition: all 0.5s ease-out; }
.slide-up-leave-active { transition: all 0.5s ease-in; position: absolute; }
.slide-up-enter-from { opacity: 0; transform: translateY(26px); }
.slide-up-leave-to { opacity: 0; transform: translateY(-26px); }

.spark-input-wrapper:focus-within {
  border-color: #d4756f;
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.1);
}

.spark-input {
  width: 100%;
  border: none;
  padding: 0;
  font-size: 1.0625rem;
  resize: none;
  background: transparent;
  font-family: inherit;
  min-height: 26px;
  max-height: 100px;
  line-height: 1.5;
  overflow-y: hidden;
  outline: none;
}

.spark-input-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
  margin-top: -0.25rem;
  align-self: flex-end;
}

.icon-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #d4756f;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(212, 117, 111, 0.3);
}

.icon-button:hover:not(:disabled) {
  background: #c26660;
  transform: scale(1.08);
}

.icon-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
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

.idea-card.cauldron-output {
  background: linear-gradient(135deg, #fff9f0 0%, #ffe8e0 100%);
  border: 2px solid #d4756f;
  box-shadow: 0 8px 20px rgba(212, 117, 111, 0.2);
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

.idea-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.idea-card.dragging {
  opacity: 0.5;
  transform: scale(0.98);
  cursor: grabbing;
}

.idea-card {
  cursor: grab;
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
}

.idea-card:hover .unpin-btn { opacity: 1; }
.unpin-btn:hover { background: #fff; color: #d4756f; transform: scale(1.1); }

.cauldron-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background: linear-gradient(135deg, rgba(212, 117, 111, 0.15), rgba(224, 138, 127, 0.15));
  border: 1px solid rgba(212, 117, 111, 0.3);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #c26660;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
}

.idea-status[data-status='ready'] { background: #fff0da; color: #9b7455; }
.idea-status[data-status='building'] { background: #e9f8ec; color: #4a7c59; }
.idea-status[data-status='done'] { background: #e9edff; color: #5a6b9b; }

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

.action-btn:hover { background: #c26660; transform: translateY(-1px); }

.action-btn.primary {
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  box-shadow: 0 2px 8px rgba(246, 113, 118, 0.25);
}

.action-btn.building {
  background: linear-gradient(135deg, #ffd89b, #19547b);
  box-shadow: 0 2px 8px rgba(25, 84, 123, 0.25);
}

.collection-footer {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0e5e0;
}

.recent-runs {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0e5e0;
}

.runs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #40312b;
  margin: 0;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.selection-count {
  font-size: 0.875rem;
  color: #8a7566;
  font-weight: 600;
}

.selection-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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

.selection-btn:hover { background: #c26660; }
.selection-btn.secondary { background: transparent; color: #8a7566; border: 1px solid #e5e5e5; }
.selection-btn.secondary:hover { background: #f5f5f5; }

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

.journal-entry.latest { background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%); }
.journal-entry.branched { border: 1px solid rgba(212, 117, 111, 0.3); }

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

.branch-indicator svg { flex-shrink: 0; color: #d4756f; }
.branch-indicator span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.entry-prompt-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.entry-prompt {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #40312b;
  line-height: 1.4;
}

.expand-prompt-btn {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: #d4756f;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0;
}

.expand-prompt-btn:hover { color: #c26660; text-decoration: underline; }

.entry-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.new-badge {
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  cursor: pointer;
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

.idea-pill.selected {
  border-color: #d4756f;
  background: linear-gradient(135deg, #fff5f0 0%, #ffe8e0 100%);
  box-shadow: 0 4px 16px rgba(212, 117, 111, 0.2);
}

.idea-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.pill-checkbox {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  width: 20px;
  height: 20px;
  border: 2px solid #d4756f;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #d4756f;
}

.idea-pill.selected .pill-checkbox {
  background: #d4756f;
  color: white;
}

.idea-pill p {
  margin: 0;
  line-height: 1.4;
  padding-left: 1.75rem;
}

.pill-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-left: 1.75rem;
}

.icon-action-btn {
  background: rgba(212, 117, 111, 0.08);
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: #d4756f;
  cursor: pointer;
  min-width: 40px;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.icon-action-btn::after {
  content: attr(title);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(40, 31, 27, 0.95);
  color: white;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.icon-action-btn:hover::after { opacity: 1; }
.icon-action-btn:hover { background: rgba(212, 117, 111, 0.15); color: #c26660; transform: translateY(-1px); }

.collection-tray {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  background: white;
  border-left: 1px solid #f0e5e0;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.tray-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0e5e0;
  background: linear-gradient(135deg, #fefaf5 0%, #fef5f0 100%);
}

.tray-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #40312b;
}

.tray-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #8a7566;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.tray-close:hover { background: rgba(212, 117, 111, 0.1); color: #d4756f; }

.tray-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.tray-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #8a7566;
  text-align: center;
  gap: 0.75rem;
}

.tray-empty p { margin: 0; font-size: 0.9375rem; }

.tray-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tray-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem;
  background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%);
  border: 1px solid #f0e5e0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.tray-item:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }

.tray-item {
  cursor: grab;
}

.tray-item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.tray-item.tray-item-cauldron {
  background: linear-gradient(135deg, #fff9f0 0%, #ffe8e0 100%);
  border-color: rgba(212, 117, 111, 0.3);
}

.tray-item-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fde7ff;
  flex-shrink: 0;
  margin-top: 4px;
}

.tray-item-status[data-status='ready'] { background: #fff0da; }
.tray-item-status[data-status='building'] { background: #e9f8ec; }
.tray-item-status[data-status='done'] { background: #e9edff; }

.tray-item-content {
  flex: 1;
  min-width: 0;
}

.tray-item-text {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #40312b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tray-item-actions {
  display: flex;
  gap: 0.35rem;
}

.tray-action {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(212, 117, 111, 0.08);
  color: #d4756f;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.tray-action:hover { background: rgba(212, 117, 111, 0.15); }
.tray-action.primary { background: #d4756f; color: white; }
.tray-action.primary:hover { background: #c26660; }
.tray-action.building { background: linear-gradient(135deg, #ffd89b, #19547b); color: white; }
.tray-action.danger:hover { background: rgba(220, 53, 69, 0.15); color: #dc3545; }

.slide-tray-enter-active, .slide-tray-leave-active { transition: transform 0.3s ease; }
.slide-tray-enter-from, .slide-tray-leave-to { transform: translateX(100%); }

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

.toast svg { color: #4a7c59; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-10px); }

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

.floating-input-btn:hover { transform: scale(1.1); box-shadow: 0 12px 32px rgba(212, 117, 111, 0.5); }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.idea-list-enter-active { transition: all 0.3s ease-out; }
.idea-list-leave-active { transition: all 0.3s ease-in; }
.idea-list-enter-from { opacity: 0; transform: translateY(20px); }
.idea-list-leave-to { opacity: 0; transform: translateY(-20px); }
.idea-list-move { transition: transform 0.3s ease; }

@media (max-width: 900px) {
  .spark-layout.with-tray { max-width: 100%; margin-right: 0; }
  .collection-tray { width: 100%; }
}

@media (max-width: 640px) {
  .spark-page { padding: 1rem 1rem 3rem; }
  .ideas-grid { grid-template-columns: 1fr; }
  .idea-deck { grid-template-columns: 1fr; }
  .runs-header { flex-direction: column; align-items: flex-start; }
  .selection-actions { width: 100%; justify-content: space-between; }
}
</style>
