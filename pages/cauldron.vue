<template>
  <div class="cauldron-page" @click="handleBackgroundClick">
    <FlowGuidanceBanner
      :visible="showGuidance && !output && ingredients.length === 0"
      message="Combine scattered ideas to find unexpected connections"
      hint="Drop or type 3+ ideas. The cauldron will blend them into something new."
      variant="cauldron"
      @dismiss="dismissGuidance"
    />

    <div class="cauldron-layout">
      <div v-if="isLoading" class="loading-state">
        <Loader :size="32" class="spin" />
        <p>Loading cauldron...</p>
      </div>

      <template v-else>
        <div class="floating-ideas-container" :class="{ 'is-dragging': !!draggedIdea }">
          <TransitionGroup name="idea-fade">
            <FloatingIdea
              v-for="(idea, index) in displayedIdeas"
              :key="idea.id"
              :ref="(el: any) => setIdeaRef(idea.id, el)"
              :idea="idea"
              :index="index"
              :total-cards="displayedIdeas.length"
              :duration="15000"
              :is-selected="selectedIdeaId === idea.id"
              @drag-start="handleIdeaDragStart"
              @drag-end="handleIdeaDragEnd"
              @dissolved="handleIdeaDissolved"
              @dropped="handleIdeaDropped"
              @expired="handleIdeaExpired"
              @select="handleIdeaSelect"
              @throw="handleIdeaThrow"
            />
          </TransitionGroup>
        </div>

        <div class="cauldron-center">
          <CauldronPot
            ref="cauldronPotRef"
            :ingredients="ingredients"
            :is-mixing="isMixing && !output"
            :streaming-text="streamingText"
            @drop="handleDrop"
          />

          <CauldronOutput
            v-if="output"
            :output="output"
            @save="handleSaveOutput"
            @ask-oracle="handleAskOracle"
            @reset="handleReset"
          />

          <div class="manual-input-wrapper">
            <input
              v-model="manualInput"
              type="text"
              :placeholder="output ? 'Add another idea to remix...' : 'Add your own idea...'"
              class="manual-input"
              @keydown.enter="handleManualSubmit"
            />
            <button
              class="submit-manual-btn"
              :disabled="!manualInput.trim()"
              @click="handleManualSubmit"
            >
              <Plus :size="20" />
            </button>
          </div>

          <p :class="['hint-text', { pulse: remixHintPulse }]">
            <Sparkles :size="14" />
            <span v-if="output">Drop ideas or type above to remix your result</span>
            <span v-else-if="isMixing">Keep adding ideas to refine</span>
            <span v-else-if="ingredients.length > 0"
              >{{ 3 - ingredients.length }} more
              {{ ingredients.length === 2 ? 'idea' : 'ideas' }} to start mixing</span
            >
            <span v-else>Drop or type ideas to begin</span>
          </p>
        </div>

        <button v-if="ingredients.length > 0 && !output" class="reset-btn" @click="handleReset">
          Reset cauldron
        </button>
      </template>
    </div>

    <transition name="toast">
      <div v-if="showToast" class="toast">
        <Check :size="20" />
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { Check, Loader, Plus, Sparkles } from 'lucide-vue-next'
import { ref, onMounted, watch } from 'vue'

import CauldronOutput from '~/components/CauldronOutput.vue'
import CauldronPot from '~/components/CauldronPot.vue'
import FloatingIdea from '~/components/FloatingIdea.vue'
import FlowGuidanceBanner from '~/components/FlowGuidanceBanner.vue'

interface FloatingIdea {
  id: string
  text: string
  source: 'saved' | 'spark'
}

interface CauldronIngredient {
  id: string
  sessionId: string
  sourceType: string
  sourceId: string | null
  content: string
  addedAt: string
  order: number
}

interface CauldronSession {
  id: string
  userId: string
  createdAt: string
  ingredientIds: string[]
  outputIdeaId: string | null
  outputText: string | null
  patterns: string | null
}

const USER_ID = 'default-user'

const floatingIdeas = ref<FloatingIdea[]>([])
const displayedIdeas = ref<FloatingIdea[]>([])
const recentlyDisplayedIds = ref<Set<string>>(new Set())
const selectedIdeaId = ref<string | null>(null)
const ingredients = ref<CauldronIngredient[]>([])
const currentSession = ref<CauldronSession | null>(null)
const isMixing = ref(false)
const output = ref<string | null>(null)
const streamingText = ref('')
const manualInput = ref('')
const isLoading = ref(true)
const showToast = ref(false)
const toastMessage = ref('')
const remixHintPulse = ref(false)
const draggedIdea = ref<FloatingIdea | null>(null)
const showGuidance = ref(true)

const GUIDANCE_DISMISSED_KEY = 'cauldron-guidance-dismissed'
const ideaRefs = ref<
  Map<string, { dissolve: () => void; resetTimer: (duration?: number) => void }>
>(new Map())
const cauldronPotRef = ref<{ triggerManualAddAnimation: () => void } | null>(null)

function setIdeaRef(
  ideaId: string,
  el: { dissolve: () => void; resetTimer: (duration?: number) => void } | null
) {
  if (el) {
    ideaRefs.value.set(ideaId, el)
  } else {
    ideaRefs.value.delete(ideaId)
  }
}

async function loadSession() {
  try {
    const { session, ingredients: sessionIngredients } = await $fetch<{
      session: CauldronSession | null
      ingredients: CauldronIngredient[]
    }>('/api/cauldron/session', {
      query: { userId: USER_ID }
    })

    if (session) {
      currentSession.value = session
      ingredients.value = sessionIngredients
      output.value = session.outputText || null
    } else {
      await createNewSession()
    }
  } catch (error) {
    console.error('Failed to load session:', error)
    showToastMessage('Failed to load session')
  } finally {
    isLoading.value = false
  }
}

async function createNewSession() {
  try {
    const { session } = await $fetch<{ session: CauldronSession }>('/api/cauldron/session', {
      method: 'POST',
      body: { userId: USER_ID }
    })
    currentSession.value = session
    ingredients.value = []
  } catch (error) {
    console.error('Failed to create session:', error)
    showToastMessage('Failed to create session')
  }
}

async function loadFloatingIdeas() {
  try {
    const { ideas } = await $fetch<{ ideas: FloatingIdea[] }>('/api/cauldron/floating-ideas')

    const uniqueIdeas = ideas.filter(
      (idea, index, self) => index === self.findIndex(i => i.id === idea.id || i.text === idea.text)
    )

    floatingIdeas.value = uniqueIdeas
    initializeDisplayedIdeas()
  } catch (error) {
    console.error('Failed to load floating ideas:', error)
  }
}

function initializeDisplayedIdeas() {
  const displayCount = Math.min(5, floatingIdeas.value.length)
  const shuffled = [...floatingIdeas.value].sort(() => Math.random() - 0.5)
  displayedIdeas.value = shuffled.slice(0, displayCount)
  displayedIdeas.value.forEach(idea => recentlyDisplayedIds.value.add(idea.id))
}

function getNextIdea(): FloatingIdea | null {
  const currentlyDisplayedIds = new Set(displayedIdeas.value.map(i => i.id))

  let available = floatingIdeas.value.filter(
    idea => !recentlyDisplayedIds.value.has(idea.id) && !currentlyDisplayedIds.has(idea.id)
  )

  if (available.length === 0) {
    recentlyDisplayedIds.value.clear()
    displayedIdeas.value.forEach(idea => recentlyDisplayedIds.value.add(idea.id))

    available = floatingIdeas.value.filter(idea => !currentlyDisplayedIds.has(idea.id))

    if (available.length === 0) {
      return null
    }
  }

  const randomIndex = Math.floor(Math.random() * available.length)
  return available[randomIndex]
}

function handleIdeaSelect(idea: FloatingIdea) {
  selectedIdeaId.value = idea.id
}

function handleBackgroundClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.floating-idea')) {
    selectedIdeaId.value = null
  }
}

function handleIdeaDragStart(idea: FloatingIdea) {
  draggedIdea.value = idea
}

function handleIdeaDragEnd() {
  draggedIdea.value = null
}

async function handleIdeaDropped(idea: FloatingIdea, _event: { clientX: number; clientY: number }) {
  if (!currentSession.value) return

  const ideaRef = ideaRefs.value.get(idea.id)
  if (ideaRef && typeof ideaRef.dissolve === 'function') {
    ideaRef.dissolve()
  }

  if (
    cauldronPotRef.value &&
    typeof cauldronPotRef.value.triggerManualAddAnimation === 'function'
  ) {
    cauldronPotRef.value.triggerManualAddAnimation()
  }

  try {
    await $fetch('/api/cauldron/add-ingredient', {
      method: 'POST',
      body: {
        sessionId: currentSession.value.id,
        sourceType: idea.source,
        sourceId: idea.id,
        content: idea.text
      }
    })

    await loadSession()
    showToastMessage('Idea added to cauldron')
  } catch (error) {
    console.error('Failed to add ingredient:', error)
    showToastMessage('Failed to add idea')
  }
}

async function handleIdeaThrow(idea: FloatingIdea) {
  await handleIdeaDropped(idea, { clientX: 0, clientY: 0 })
}

async function handleDrop(_event: DragEvent) {
  if (!draggedIdea.value || !currentSession.value) return

  const droppedIdea = draggedIdea.value
  const ideaRef = ideaRefs.value.get(droppedIdea.id)

  if (ideaRef && typeof ideaRef.dissolve === 'function') {
    ideaRef.dissolve()
  }

  try {
    await $fetch('/api/cauldron/add-ingredient', {
      method: 'POST',
      body: {
        sessionId: currentSession.value.id,
        sourceType: droppedIdea.source,
        sourceId: droppedIdea.id,
        content: droppedIdea.text
      }
    })

    await loadSession()
    showToastMessage('Idea added to cauldron')
  } catch (error) {
    console.error('Failed to add ingredient:', error)
    showToastMessage('Failed to add idea')
  } finally {
    draggedIdea.value = null
  }
}

function handleIdeaDissolved(idea: FloatingIdea) {
  if (selectedIdeaId.value === idea.id) {
    selectedIdeaId.value = null
  }

  const index = displayedIdeas.value.findIndex(i => i.id === idea.id)

  if (index !== -1) {
    const newIdea = getNextIdea()
    if (newIdea) {
      recentlyDisplayedIds.value.delete(displayedIdeas.value[index].id)
      recentlyDisplayedIds.value.add(newIdea.id)
      displayedIdeas.value[index] = newIdea
    }
  }
}

function handleIdeaExpired(idea: FloatingIdea) {
  if (selectedIdeaId.value === idea.id) {
    selectedIdeaId.value = null
  }

  const index = displayedIdeas.value.findIndex(i => i.id === idea.id)
  if (index === -1) return

  const newIdea = getNextIdea()
  if (newIdea) {
    recentlyDisplayedIds.value.delete(idea.id)
    recentlyDisplayedIds.value.add(newIdea.id)
    displayedIdeas.value[index] = newIdea
  }
}

async function handleManualSubmit() {
  const text = manualInput.value.trim()
  if (!text || !currentSession.value) return

  if (
    cauldronPotRef.value &&
    typeof cauldronPotRef.value.triggerManualAddAnimation === 'function'
  ) {
    cauldronPotRef.value.triggerManualAddAnimation()
  }

  try {
    await $fetch('/api/cauldron/add-ingredient', {
      method: 'POST',
      body: {
        sessionId: currentSession.value.id,
        sourceType: 'user',
        sourceId: null,
        content: text
      }
    })

    await loadSession()
    manualInput.value = ''
    showToastMessage('Idea added to cauldron')
  } catch (error) {
    console.error('Failed to add ingredient:', error)
    showToastMessage('Failed to add idea')
  }
}

async function handleReset() {
  if (!currentSession.value) return

  try {
    await $fetch('/api/cauldron/reset', {
      method: 'POST',
      body: { sessionId: currentSession.value.id }
    })

    output.value = null
    isMixing.value = false
    await createNewSession()
    showToastMessage('Cauldron reset')
  } catch (error) {
    console.error('Failed to reset:', error)
    showToastMessage('Failed to reset')
  }
}

async function handleSaveOutput() {
  if (!output.value || !currentSession.value) return

  try {
    await $fetch('/api/saved-ideas', {
      method: 'POST',
      body: {
        text: output.value,
        source: 'cauldron',
        status: 'exploring',
        isCauldronOutput: true,
        cauldronSessionId: currentSession.value.id
      }
    })

    showToastMessage('Saved to your collection')
    await handleReset()
  } catch (error) {
    console.error('Failed to save output:', error)
    showToastMessage('Failed to save')
  }
}

async function handleAskOracle() {
  if (!output.value || !currentSession.value) return

  try {
    const { idea } = await $fetch<{ idea: { id: string } }>('/api/saved-ideas', {
      method: 'POST',
      body: {
        text: output.value,
        source: 'cauldron',
        status: 'exploring',
        isCauldronOutput: true,
        cauldronSessionId: currentSession.value.id
      }
    })

    await handleReset()
    await navigateTo(`/oracle?idea=${idea.id}`)
  } catch (error) {
    console.error('Failed to save and navigate to Oracle:', error)
    showToastMessage('Failed to ask Oracle')
  }
}

function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2200)
}

function triggerRemixHintPulse() {
  remixHintPulse.value = true
  setTimeout(() => {
    remixHintPulse.value = false
  }, 600)
}

function dismissGuidance() {
  showGuidance.value = false
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(GUIDANCE_DISMISSED_KEY, 'true')
  }
}

function checkGuidanceDismissed() {
  if (typeof window !== 'undefined') {
    const dismissed = window.localStorage.getItem(GUIDANCE_DISMISSED_KEY)
    if (dismissed) {
      showGuidance.value = false
    }
  }
}

async function streamMix(sessionId: string, isRemix = false) {
  isMixing.value = true
  streamingText.value = ''

  try {
    const response = await fetch('/api/cauldron/mix-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    })

    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader()
    if (!reader) throw new Error('No reader')

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const lines = value.split('\n').filter(line => line.startsWith('data: '))
      for (const line of lines) {
        const data = JSON.parse(line.slice(6))
        if (data.token) {
          streamingText.value += data.token
        }
        if (data.done) {
          output.value = data.output
        }
        if (data.error) {
          showToastMessage('Failed to mix ideas')
        }
      }
    }
  } catch (error) {
    console.error('Failed to mix:', error)
    showToastMessage('Failed to mix ideas')
  } finally {
    isMixing.value = false
    streamingText.value = ''
  }
}

watch(
  () => ingredients.value.length,
  async (newCount, oldCount) => {
    if (newCount >= 3 && !isMixing.value && !output.value && currentSession.value) {
      await streamMix(currentSession.value.id)
    }

    if (newCount > 3 && oldCount && oldCount >= 3 && !isMixing.value && currentSession.value) {
      triggerRemixHintPulse()
      await streamMix(currentSession.value.id, true)
    }
  }
)

onMounted(async () => {
  checkGuidanceDismissed()
  await loadSession()
  await loadFloatingIdeas()
})
</script>

<style scoped>
.cauldron-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 0;
  position: relative;
  overflow-x: hidden;
}

.cauldron-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse 50% 50% at 50% 60%,
    rgba(149, 117, 205, 0.04) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.cauldron-page > :deep(.flow-guidance-banner) {
  position: fixed;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  max-width: 500px;
}

.cauldron-layout {
  max-width: 100%;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.floating-ideas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.floating-ideas-container.is-dragging {
  z-index: 100;
}

.idea-fade-enter-active {
  transition: opacity 0.8s var(--ease-out);
}

.idea-fade-leave-active {
  transition: opacity 0.5s var(--ease-out);
}

.idea-fade-enter-from {
  opacity: 0;
}

.idea-fade-leave-to {
  opacity: 0;
}

.cauldron-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-6);
  position: relative;
  z-index: 20;
  min-width: 420px;
  pointer-events: none;
}

.cauldron-center > * {
  pointer-events: auto;
}

.manual-input-wrapper {
  display: flex;
  gap: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-fast) var(--ease-out);
  width: 380px;
}

.manual-input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.manual-input {
  flex: 1;
  padding: var(--space-4) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  background: transparent;
  color: var(--color-text);
}

.manual-input::placeholder {
  color: var(--color-text-tertiary);
}

.manual-input:focus {
  outline: none;
}

.submit-manual-btn {
  padding: var(--space-3) var(--space-4);
  background: transparent;
  color: var(--color-primary);
  border: none;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-manual-btn:hover:not(:disabled) {
  background: var(--color-primary-subtle);
}

.submit-manual-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.remix-hint-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 380px;
}

.remix-input-wrapper {
  display: flex;
  gap: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-fast) var(--ease-out);
  width: 100%;
}

.remix-input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.hint-text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-primary);
  font-size: var(--text-sm);
  opacity: 0.7;
  margin: 0;
  cursor: default;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.hint-text.pulse {
  animation: remix-pulse 0.6s ease-out;
}

@keyframes remix-pulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
}

.reset-btn {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  padding: var(--space-3) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  box-shadow: var(--shadow-md);
}

.reset-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: var(--shadow-lg);
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

@media (max-width: 768px) {
  .cauldron-page {
    padding: var(--space-4);
  }

  .reset-btn {
    bottom: var(--space-4);
    right: var(--space-4);
  }

  .toast {
    top: var(--space-4);
    right: var(--space-4);
    left: var(--space-4);
  }
}
</style>
