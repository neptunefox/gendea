<template>
  <div v-if="!hasDrawnToday" class="daily-tarot">
    <div v-if="isLoading" class="tarot-loading">
      <div class="loading-dot"></div>
    </div>

    <div v-else-if="!revealedCard && cardOptions.length > 0" class="card-selection">
      <div class="card-spread" :class="{ fading: selectingCard }">
        <button
          v-for="(card, index) in cardOptions"
          :key="card.id"
          class="pick-card"
          :class="{ selected: selectingCard === card.id, 'not-selected': selectingCard && selectingCard !== card.id }"
          :style="{ '--card-index': index }"
          :disabled="!!selectingCard"
          @click="selectCard(card.id)"
        >
          <span class="card-sigil">✦</span>
        </button>
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
      <p class="card-name">{{ revealedCard.name }}</p>
      <p class="card-meaning">{{ revealedCard.meaning }}</p>
      <button class="use-lens-btn" @click="confirmCard">Explore through this lens</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface TarotCard {
  id: string
  name: string
  numeral: string
  archetype: string
  keywords: string[]
  meaning: string
  creativePrompt: string
}

const emit = defineEmits<{
  'card-selected': [card: TarotCard]
}>()

const cardOptions = ref<TarotCard[]>([])
const readingId = ref<string | null>(null)
const selectingCard = ref<string | null>(null)
const revealedCard = ref<TarotCard | null>(null)
const isLoading = ref(true)
const hasDrawnToday = ref(false)

const selectedCardData = computed(() => {
  if (!selectingCard.value) return null
  return cardOptions.value.find(c => c.id === selectingCard.value) || null
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

async function fetchReading() {
  try {
    const visitorId = getVisitorId()
    const response = await $fetch<{
      status: 'pending' | 'complete'
      cardOptions: TarotCard[]
      readingId: string
    }>('/api/tarot/reading', {
      query: { visitorId }
    })

    if (response.status === 'pending') {
      readingId.value = response.readingId
      cardOptions.value = response.cardOptions
    } else {
      hasDrawnToday.value = true
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

function confirmCard() {
  if (revealedCard.value) {
    emit('card-selected', revealedCard.value)
  }
}

onMounted(() => {
  fetchReading()
})
</script>

<style scoped>
.daily-tarot {
  width: 100%;
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
  font-size: var(--text-sm);
  color: var(--color-oracle);
  letter-spacing: 0.02em;
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
  font-size: var(--text-sm);
  color: var(--color-oracle);
  letter-spacing: 0.02em;
}

.card-meaning {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.use-lens-btn {
  margin-top: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px solid hsla(200, 70%, 72%, 0.3);
  border-radius: var(--radius-sm);
  color: var(--color-oracle);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
}

.use-lens-btn:hover {
  background: hsla(200, 70%, 72%, 0.1);
  border-color: hsla(200, 70%, 72%, 0.5);
}

@media (prefers-reduced-motion: reduce) {
  .pick-card,
  .loading-dot,
  .reveal-dots .dot,
  .card-revealing,
  .card-revealed {
    animation: none;
  }

  .pick-card:hover {
    transform: none;
  }
}
</style>
