<template>
  <div class="cauldron-page">
    <div class="cauldron-layout">
      <div v-if="isLoading" class="loading-state">
        <Loader :size="32" class="spin" />
        <p>Loading cauldron...</p>
      </div>

      <template v-else>
        <div class="floating-ideas-container">
          <TransitionGroup name="idea-fade">
            <FloatingIdea
              v-for="(idea, index) in displayedIdeas"
              :key="idea.id"
              :ref="(el: any) => setIdeaRef(idea.id, el)"
              :idea="idea"
              :index="index"
              :existing-positions="Array.from(cardPositions.values())"
              @position-set="
                (pos: { x: number; y: number; width: number; height: number }) =>
                  cardPositions.set(idea.id, pos)
              "
              @drag-start="handleIdeaDragStart"
              @drag-end="handleIdeaDragEnd"
              @dissolved="handleIdeaDissolved"
              @bring-to-top="handleBringToTop"
            />
          </TransitionGroup>
        </div>

        <div class="cauldron-center">
          <CauldronPot
            ref="cauldronPotRef"
            :ingredients="ingredients"
            :is-mixing="isMixing"
            @drop="handleDrop"
          />

          <div v-if="!output" class="manual-input-wrapper">
            <input
              v-model="manualInput"
              type="text"
              placeholder="Add your own idea..."
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
        </div>

        <CauldronOutput :output="output" @save="handleSaveOutput" @reset="handleReset" />

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
import { Check, Loader, Plus } from 'lucide-vue-next'
import { ref, onMounted, watch, onUnmounted } from 'vue'

import CauldronOutput from '~/components/CauldronOutput.vue'
import CauldronPot from '~/components/CauldronPot.vue'
import FloatingIdea from '~/components/FloatingIdea.vue'

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
const ingredients = ref<CauldronIngredient[]>([])
const currentSession = ref<CauldronSession | null>(null)
const isMixing = ref(false)
const output = ref<string | null>(null)
const manualInput = ref('')
const isLoading = ref(true)
const showToast = ref(false)
const toastMessage = ref('')
const draggedIdea = ref<FloatingIdea | null>(null)
const ideaRefs = ref<Map<string, { dissolve: () => void; setZIndex: (z: number) => void }>>(
  new Map()
)
const cauldronPotRef = ref<{ triggerManualAddAnimation: () => void } | null>(null)
const cardPositions = ref<Map<string, { x: number; y: number; width: number; height: number }>>(
  new Map()
)
const topZIndex = ref(100)
let rotationInterval: NodeJS.Timeout | null = null

function setIdeaRef(
  ideaId: string,
  el: { dissolve: () => void; setZIndex: (z: number) => void } | null
) {
  if (el) {
    ideaRefs.value.set(ideaId, el)
  } else {
    ideaRefs.value.delete(ideaId)
  }
}

function handleBringToTop(ideaId: string) {
  const ideaRef = ideaRefs.value.get(ideaId)
  if (ideaRef && typeof ideaRef.setZIndex === 'function') {
    topZIndex.value += 1
    ideaRef.setZIndex(topZIndex.value)
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
  const displayCount = Math.min(8, floatingIdeas.value.length)
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

function rotateIdea() {
  if (displayedIdeas.value.length === 0) return

  const randomIndex = Math.floor(Math.random() * displayedIdeas.value.length)
  const oldIdea = displayedIdeas.value[randomIndex]
  const newIdea = getNextIdea()

  if (newIdea) {
    cardPositions.value.delete(oldIdea.id)
    recentlyDisplayedIds.value.delete(oldIdea.id)
    recentlyDisplayedIds.value.add(newIdea.id)
    displayedIdeas.value[randomIndex] = newIdea
  }
}

function startAutoRotation() {
  if (rotationInterval) return

  rotationInterval = setInterval(
    () => {
      rotateIdea()
    },
    15000 + Math.random() * 5000
  )
}

function stopAutoRotation() {
  if (rotationInterval) {
    clearInterval(rotationInterval)
    rotationInterval = null
  }
}

function handleIdeaDragStart(idea: FloatingIdea) {
  draggedIdea.value = idea
}

function handleIdeaDragEnd() {
  draggedIdea.value = null
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
  const index = displayedIdeas.value.findIndex(i => i.id === idea.id)

  if (index !== -1) {
    cardPositions.value.delete(idea.id)
    const newIdea = getNextIdea()
    if (newIdea) {
      recentlyDisplayedIds.value.delete(displayedIdeas.value[index].id)
      recentlyDisplayedIds.value.add(newIdea.id)
      displayedIdeas.value[index] = newIdea
    }
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

function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2200)
}

watch(
  () => ingredients.value.length,
  async (newCount, oldCount) => {
    if (newCount >= 3 && !isMixing.value && !output.value && currentSession.value) {
      isMixing.value = true
      try {
        const { output: mixedOutput } = await $fetch<{ output: string }>('/api/cauldron/mix', {
          method: 'POST',
          body: { sessionId: currentSession.value.id }
        })
        output.value = mixedOutput
      } catch (error) {
        console.error('Failed to mix:', error)
        showToastMessage('Failed to mix ideas')
      } finally {
        isMixing.value = false
      }
    }

    if (newCount > 3 && oldCount && oldCount >= 3 && !isMixing.value && currentSession.value) {
      isMixing.value = true
      try {
        const { output: mixedOutput } = await $fetch<{ output: string }>('/api/cauldron/mix', {
          method: 'POST',
          body: { sessionId: currentSession.value.id }
        })
        output.value = mixedOutput
      } catch (error) {
        console.error('Failed to remix:', error)
        showToastMessage('Failed to remix ideas')
      } finally {
        isMixing.value = false
      }
    }
  }
)

onMounted(async () => {
  await loadSession()
  await loadFloatingIdeas()
  startAutoRotation()
})

onUnmounted(() => {
  stopAutoRotation()
})
</script>

<style scoped>
.cauldron-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f0 0%, #fef8f5 100%);
  padding: 2rem 1.5rem 4rem;
}

.cauldron-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  min-height: 80vh;
}

.loading-state {
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

.floating-ideas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 50;
}

.idea-fade-enter-active {
  transition: opacity 0.8s ease;
}

.idea-fade-leave-active {
  transition: opacity 0.5s ease;
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
  gap: 2rem;
  padding: 2rem;
  position: relative;
  z-index: 2;
}

.manual-input-wrapper {
  display: flex;
  gap: 0;
  background: white;
  border: 2px solid #f0e5e0;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  width: 100%;
  max-width: 500px;
}

.manual-input-wrapper:focus-within {
  border-color: #d4756f;
  box-shadow: 0 4px 20px rgba(212, 117, 111, 0.15);
}

.manual-input {
  flex: 1;
  padding: 1rem 1.25rem;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  background: transparent;
  color: #40312b;
}

.manual-input::placeholder {
  color: #b8a89d;
}

.manual-input:focus {
  outline: none;
}

.submit-manual-btn {
  padding: 0.75rem 1rem;
  background: transparent;
  color: #d4756f;
  border: none;
  border-radius: 0 14px 14px 0;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-manual-btn:hover:not(:disabled) {
  background: rgba(212, 117, 111, 0.12);
  transform: translateY(-1px);
}

.submit-manual-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.reset-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.875rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #f0e5e0;
  border-radius: 12px;
  color: #8a7566;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.1);
}

.reset-btn:hover {
  background: white;
  border-color: #d4756f;
  color: #d4756f;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(212, 117, 111, 0.2);
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

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 768px) {
  .cauldron-page {
    padding: 1rem;
  }

  .reset-btn {
    bottom: 1rem;
    right: 1rem;
  }

  .toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>
