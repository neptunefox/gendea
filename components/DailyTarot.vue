<template>
  <div class="daily-tarot">
    <div v-if="lockedLens" class="locked-lens">
      <div class="lens-info">
        <span class="lens-icon">✦</span>
        <span class="lens-name">{{ lockedLens.name }}</span>
      </div>
      <button type="button" class="unlock-btn" title="Unlock lens" @click="unlockLens">
        <X :size="14" />
      </button>
    </div>

    <template v-else-if="!hasDrawnToday">
      <div v-if="isLoading" class="tarot-loading">
        <div class="loading-dot"></div>
      </div>

      <div v-else-if="!revealedCard && cardOptions.length > 0" class="card-selection">
        <div class="card-spread" :class="{ fading: selectingCard, 'show-labels': selectingCard }">
          <div
            v-for="(card, index) in cardOptions"
            :key="card.id"
            class="card-slot"
            :class="{
              selected: selectingCard === card.id,
              'not-selected': selectingCard && selectingCard !== card.id
            }"
            :style="{ '--card-index': index }"
          >
            <button
              type="button"
              class="pick-card"
              :class="{
                selected: selectingCard === card.id,
                'not-selected': selectingCard && selectingCard !== card.id
              }"
              :disabled="!!selectingCard"
              @click="selectCard(card.id)"
            >
              <span class="card-sigil">✦</span>
            </button>
            <span v-if="selectingCard && selectingCard !== card.id" class="card-label">{{
              card.name
            }}</span>
          </div>
        </div>
        <p v-if="!selectingCard" class="draw-hint">Draw today's lens</p>
        <div v-else class="card-revealing">
          <p class="card-title">{{ selectedCardData?.name }}</p>
          <div class="reveal-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>

      <div v-else-if="revealedCard" class="card-revealed">
        <div class="card-spread revealed-spread">
          <div
            v-for="(card, index) in cardOptions"
            :key="card.id"
            class="revealed-card-slot"
            :class="{ chosen: card.id === revealedCard.id, unchosen: card.id !== revealedCard.id }"
            :style="{ '--card-index': index }"
          >
            <div
              class="pick-card"
              :class="{
                chosen: card.id === revealedCard.id,
                unchosen: card.id !== revealedCard.id
              }"
            >
              <span class="card-sigil">✦</span>
            </div>
            <span class="card-label">{{ card.name }}</span>
          </div>
        </div>
        <p class="card-name">{{ revealedCard.name }}</p>
        <p class="card-meaning">{{ revealedCard.meaning }}</p>
        <div class="lens-actions">
          <button
            type="button"
            class="use-lens-btn"
            :class="{ used: hasUsedOnce }"
            :disabled="hasUsedOnce"
            @click="useOnce"
          >
            {{ hasUsedOnce ? 'Used' : 'Use once' }}
          </button>
          <button type="button" class="lock-lens-btn" @click="lockLens">
            <Lock :size="12" />
            Lock lens
          </button>
        </div>
        <p class="next-draw">Next draw in {{ timeUntilNextDraw }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Lock, X } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'

import { useSound } from '~/composables/useSound'

interface TarotCard {
  id: string
  name: string
  numeral: string
  archetype: string
  keywords: string[]
  meaning: string
  creativePrompt: string
}

interface LockedLens {
  name: string
  meaning: string
}

interface Props {
  lockedLens?: LockedLens | null
}

withDefaults(defineProps<Props>(), {
  lockedLens: null
})

const emit = defineEmits<{
  'card-selected': [card: TarotCard]
  'lens-locked': [lens: LockedLens]
  'lens-unlocked': []
}>()

const { play: playSound } = useSound()

const cardOptions = ref<TarotCard[]>([])
const readingId = ref<string | null>(null)
const selectingCard = ref<string | null>(null)
const revealedCard = ref<TarotCard | null>(null)
const isLoading = ref(true)
const hasDrawnToday = ref(false)
const hasUsedOnce = ref(false)

const selectedCardData = computed(() => {
  if (!selectingCard.value) return null
  return cardOptions.value.find(c => c.id === selectingCard.value) || null
})

const timeUntilNextDraw = computed(() => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const diff = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
})

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'anonymous'
  let id = localStorage.getItem('gendea-visitor-id')
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    localStorage.setItem('gendea-visitor-id', id)
  }
  return id
}

const USED_ONCE_KEY = 'tarot-used-once'

function getUsedOnceState(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(USED_ONCE_KEY)
  if (!stored) return false
  const { date, used } = JSON.parse(stored)
  const today = new Date().toISOString().split('T')[0]
  return date === today && used
}

function setUsedOnceState() {
  if (typeof window === 'undefined') return
  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem(USED_ONCE_KEY, JSON.stringify({ date: today, used: true }))
}

async function fetchReading() {
  try {
    const visitorId = getVisitorId()
    const response = await $fetch<{
      status: 'pending' | 'complete'
      cardOptions: TarotCard[]
      chosenCard: TarotCard | null
      readingId: string
    }>('/api/tarot/reading', {
      query: { visitorId }
    })

    if (response.status === 'pending') {
      readingId.value = response.readingId
      cardOptions.value = response.cardOptions
    } else if (response.chosenCard) {
      cardOptions.value = response.cardOptions
      revealedCard.value = response.chosenCard
      hasUsedOnce.value = getUsedOnceState()
    }
  } catch (error) {
    console.error('Failed to fetch tarot reading:', error)
  } finally {
    isLoading.value = false
  }
}

async function selectCard(cardId: string) {
  if (selectingCard.value || revealedCard.value || !readingId.value) return

  const card = cardOptions.value.find(c => c.id === cardId)
  if (!card) return

  playSound('cardFlip')
  selectingCard.value = cardId

  try {
    await $fetch('/api/tarot/choose', {
      method: 'POST',
      body: {
        readingId: readingId.value,
        cardId,
        visitorId: getVisitorId()
      }
    })

    revealedCard.value = card
  } catch (error) {
    console.error('Failed to choose card:', error)
  } finally {
    selectingCard.value = null
  }
}

function useOnce() {
  if (revealedCard.value && !hasUsedOnce.value) {
    hasUsedOnce.value = true
    setUsedOnceState()
    emit('card-selected', revealedCard.value)
  }
}

function lockLens() {
  if (revealedCard.value) {
    emit('lens-locked', { name: revealedCard.value.name, meaning: revealedCard.value.meaning })
  }
}

function unlockLens() {
  emit('lens-unlocked')
}

onMounted(() => {
  fetchReading()
})
</script>

<style scoped>
.daily-tarot {
  width: 100%;
  margin-bottom: var(--space-3);
}

.locked-lens {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: hsla(200, 70%, 72%, 0.08);
  border: 1px solid hsla(200, 70%, 72%, 0.2);
  border-radius: var(--radius-md);
  animation: lensAppear 0.3s var(--ease-out);
}

@keyframes lensAppear {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lens-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.lens-icon {
  font-size: 10px;
  color: var(--color-oracle);
  opacity: 0.7;
}

.lens-name {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  color: var(--color-oracle);
  letter-spacing: 0.02em;
}

.unlock-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s var(--ease-out);
}

.unlock-btn:hover {
  color: var(--color-text);
  background: hsla(200, 70%, 72%, 0.1);
}

.tarot-loading {
  padding: var(--space-2) 0;
}

.loading-dot {
  width: 5px;
  height: 5px;
  background: var(--color-text-secondary);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

.card-selection {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.card-spread {
  display: flex;
  gap: var(--space-3);
}

.card-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.card-slot.not-selected {
  opacity: 0.5;
}

.card-slot.not-selected .card-label {
  color: var(--color-text-tertiary);
}

.card-slot.selected .card-label {
  color: var(--color-oracle);
}

.pick-card {
  width: 40px;
  height: 56px;
  background: linear-gradient(180deg, hsl(220, 18%, 12%) 0%, hsl(220, 20%, 8%) 100%);
  border: 1px solid hsla(200, 70%, 72%, 0.25);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s var(--ease-out);
  animation: cardAppear 0.4s var(--ease-out) backwards;
  animation-delay: calc(var(--card-index) * 0.1s);
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pick-card:hover {
  border-color: hsla(200, 70%, 72%, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.pick-card.selected {
  transform: scale(1.05);
  border-color: var(--color-oracle);
}

.pick-card.not-selected {
  opacity: 0.3;
  transform: scale(0.95);
}

.pick-card:disabled {
  cursor: default;
}

.revealed-spread {
  margin-bottom: var(--space-3);
}

.revealed-spread .pick-card {
  cursor: default;
  animation: none;
}

.revealed-card-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.revealed-card-slot.chosen .card-label {
  color: var(--color-oracle);
}

.revealed-card-slot.unchosen .pick-card {
  opacity: 0.5;
}

.card-label {
  font-size: 9px;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 60px;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.revealed-card-slot.unchosen .card-label {
  color: var(--color-text-tertiary);
}

.pick-card.chosen {
  border-color: var(--color-oracle);
  box-shadow: 0 0 12px var(--color-glow-oracle);
}

.pick-card.unchosen {
  border-style: dashed;
}

.next-draw {
  margin: var(--space-2) 0 0;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  letter-spacing: 0.02em;
}

.card-sigil {
  font-size: 12px;
  color: var(--color-oracle);
  opacity: 0.7;
}

.draw-hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}

.card-revealing {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  animation: revealFadeIn 0.3s var(--ease-out);
}

@keyframes revealFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.reveal-dots {
  display: flex;
  gap: 6px;
}

.reveal-dots .dot {
  width: 5px;
  height: 5px;
  background: var(--color-oracle);
  border-radius: 50%;
  animation: revealPulse 1.2s ease-in-out infinite;
}

.reveal-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.reveal-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes revealPulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.card-revealing .card-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  color: var(--color-oracle);
  letter-spacing: 0.04em;
  text-shadow: 0 0 20px var(--color-glow-oracle);
}

.card-revealed {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  animation: revealFadeIn 0.3s var(--ease-out);
}

.card-name {
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  color: var(--color-oracle);
  letter-spacing: 0.04em;
  text-shadow: 0 0 20px var(--color-glow-oracle);
}

.card-meaning {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.lens-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.use-lens-btn,
.lock-lens-btn {
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px solid hsla(200, 70%, 72%, 0.3);
  border-radius: var(--radius-sm);
  color: var(--color-oracle);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.use-lens-btn:hover:not(:disabled),
.lock-lens-btn:hover {
  background: hsla(200, 70%, 72%, 0.1);
  border-color: hsla(200, 70%, 72%, 0.5);
}

.use-lens-btn.used {
  opacity: 0.5;
  cursor: default;
  border-style: dashed;
}

.lock-lens-btn {
  border-color: hsla(200, 70%, 72%, 0.5);
  background: hsla(200, 70%, 72%, 0.08);
}

@media (prefers-reduced-motion: reduce) {
  .pick-card,
  .loading-dot,
  .reveal-dots .dot,
  .card-revealing,
  .card-revealed,
  .locked-lens {
    animation: none;
  }

  .pick-card:hover {
    transform: none;
  }
}
</style>
