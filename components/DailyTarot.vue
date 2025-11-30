<template>
  <div class="daily-tarot">
    <button v-if="!isOpen && !hasReading" class="tarot-trigger" @click="openReading">
      <div class="trigger-card">
        <div class="card-back-pattern"></div>
      </div>
      <span class="trigger-text">Draw today's card</span>
    </button>

    <div v-else-if="hasReading && !isOpen" class="tarot-summary" @click="isOpen = true">
      <div class="summary-card">
        <span class="card-numeral">{{ chosenCard?.numeral }}</span>
      </div>
      <div class="summary-content">
        <span class="summary-name">{{ chosenCard?.name }}</span>
        <span class="summary-hint">Tap to view</span>
      </div>
    </div>

    <transition name="tarot-modal">
      <div v-if="isOpen" class="tarot-overlay" @click.self="closeReading">
        <div class="tarot-container">
          <button class="close-btn" @click="closeReading">
            <X :size="20" />
          </button>

          <div v-if="phase === 'choosing'" class="choosing-phase">
            <p class="phase-title">Choose your card</p>
            <p class="phase-subtitle">Trust your intuition</p>
            <div class="card-spread">
              <button
                v-for="(card, index) in cardOptions"
                :key="card.id"
                class="tarot-card face-down"
                :class="{
                  hovering: hoveringCard === card.id,
                  selecting: selectingCard === card.id
                }"
                :style="{ '--card-index': index }"
                @mouseenter="hoveringCard = card.id"
                @mouseleave="hoveringCard = null"
                @click="selectCard(card.id)"
              >
                <div class="card-inner">
                  <div class="card-back">
                    <div class="back-border"></div>
                    <div class="back-pattern"></div>
                    <div class="back-sigil">✦</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div v-else-if="phase === 'generating'" class="generating-phase">
            <div class="card-spread single">
              <div class="tarot-card generating">
                <div class="card-inner">
                  <div class="card-back">
                    <div class="back-border"></div>
                    <div class="back-pattern"></div>
                    <div class="back-sigil">✦</div>
                    <div class="glow-overlay"></div>
                  </div>
                </div>
              </div>
            </div>
            <p class="generating-text">Channeling insight...</p>
          </div>

          <div v-else-if="phase === 'revealed'" class="revealed-phase">
            <div class="revealed-card">
              <div class="card-face">
                <span class="card-numeral-large">{{ chosenCard?.numeral }}</span>
                <h2 class="card-name">{{ chosenCard?.name }}</h2>
                <p class="card-archetype">{{ chosenCard?.archetype }}</p>
                <div class="card-divider">
                  <span class="divider-line"></span>
                  <span class="divider-symbol">◆</span>
                  <span class="divider-line"></span>
                </div>
                <p class="card-interpretation">{{ interpretation }}</p>
              </div>
            </div>

            <div class="spark-prompt-section">
              <p class="prompt-label">Today's spark</p>
              <p class="prompt-text">{{ sparkPrompt }}</p>
              <button class="use-prompt-btn" @click="useAsInput">
                Use this spark
                <ArrowRight :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { X, ArrowRight } from 'lucide-vue-next'

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
  usePrompt: [prompt: string]
}>()

const isOpen = ref(false)
const phase = ref<'choosing' | 'generating' | 'revealed'>('choosing')
const cardOptions = ref<TarotCard[]>([])
const chosenCard = ref<TarotCard | null>(null)
const interpretation = ref('')
const sparkPrompt = ref('')
const readingId = ref<string | null>(null)
const hoveringCard = ref<string | null>(null)
const selectingCard = ref<string | null>(null)

const hasReading = computed(() => !!chosenCard.value)

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
      chosenCard: TarotCard | null
      interpretation: string | null
      sparkPrompt: string | null
      readingId: string
    }>('/api/tarot/reading', {
      query: { visitorId }
    })

    readingId.value = response.readingId
    cardOptions.value = response.cardOptions

    if (response.status === 'complete' && response.chosenCard) {
      chosenCard.value = response.chosenCard
      interpretation.value = response.interpretation || ''
      sparkPrompt.value = response.sparkPrompt || ''
      phase.value = 'revealed'
    }
  } catch (error) {
    console.error('Failed to fetch tarot reading:', error)
  }
}

async function openReading() {
  isOpen.value = true
  if (cardOptions.value.length === 0) {
    await fetchReading()
  }
}

function closeReading() {
  isOpen.value = false
}

async function selectCard(cardId: string) {
  if (phase.value !== 'choosing' || !readingId.value) return

  selectingCard.value = cardId
  phase.value = 'generating'

  try {
    const response = await $fetch<{
      card: TarotCard
      interpretation: string
      sparkPrompt: string
    }>('/api/tarot/choose', {
      method: 'POST',
      body: {
        readingId: readingId.value,
        cardId,
        visitorId: getVisitorId()
      }
    })

    chosenCard.value = response.card
    interpretation.value = response.interpretation
    sparkPrompt.value = response.sparkPrompt
    phase.value = 'revealed'
  } catch (error) {
    console.error('Failed to choose card:', error)
    phase.value = 'choosing'
  } finally {
    selectingCard.value = null
  }
}

function useAsInput() {
  emit('usePrompt', sparkPrompt.value)
  closeReading()
}

onMounted(() => {
  fetchReading()
})
</script>

<style scoped>
.daily-tarot {
  width: 100%;
  display: flex;
  justify-content: center;
}

.tarot-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: 1px solid rgba(212, 165, 116, 0.2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s var(--ease-out);
}

.tarot-trigger:hover {
  border-color: rgba(212, 165, 116, 0.4);
  background: rgba(212, 165, 116, 0.05);
}

.trigger-card {
  width: 28px;
  height: 40px;
  border-radius: 3px;
  background: linear-gradient(135deg, rgba(42, 36, 32, 0.95) 0%, rgba(26, 22, 20, 0.98) 100%);
  border: 1px solid rgba(212, 165, 116, 0.3);
  position: relative;
  overflow: hidden;
}

.card-back-pattern {
  position: absolute;
  inset: 3px;
  border: 1px solid rgba(212, 165, 116, 0.2);
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(212, 165, 116, 0.05) 2px,
    rgba(212, 165, 116, 0.05) 4px
  );
}

.trigger-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-family: var(--font-heading);
  letter-spacing: 0.02em;
}

.tarot-summary {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: rgba(212, 165, 116, 0.05);
  border: 1px solid rgba(212, 165, 116, 0.25);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s var(--ease-out);
}

.tarot-summary:hover {
  border-color: rgba(212, 165, 116, 0.4);
  background: rgba(212, 165, 116, 0.1);
}

.summary-card {
  width: 28px;
  height: 40px;
  border-radius: 3px;
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.15) 0%, rgba(26, 22, 20, 0.95) 100%);
  border: 1px solid rgba(212, 165, 116, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-card .card-numeral {
  font-family: var(--font-heading);
  font-size: 10px;
  color: var(--color-primary);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-name {
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: var(--font-heading);
}

.summary-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.tarot-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 8, 6, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--space-4);
}

.tarot-container {
  position: relative;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-8);
  background: linear-gradient(135deg, rgba(35, 30, 25, 0.98) 0%, rgba(28, 24, 20, 0.99) 100%);
  border: 2px solid rgba(212, 165, 116, 0.25);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
}

.close-btn {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: var(--space-2);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text);
}

.phase-title {
  text-align: center;
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-text);
  margin: 0 0 var(--space-2);
}

.phase-subtitle {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin: 0 0 var(--space-8);
}

.card-spread {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  perspective: 1000px;
}

.card-spread.single {
  justify-content: center;
}

.tarot-card {
  width: 140px;
  height: 200px;
  border: none;
  background: transparent;
  cursor: pointer;
  perspective: 1000px;
  transition: transform 0.4s var(--ease-out);
  animation: cardDeal 0.6s var(--ease-out) backwards;
  animation-delay: calc(var(--card-index) * 0.15s);
}

@keyframes cardDeal {
  from {
    opacity: 0;
    transform: translateY(-30px) rotateX(20deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

.tarot-card.hovering {
  transform: translateY(-12px) scale(1.05);
}

.tarot-card.selecting {
  transform: scale(1.1);
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}

.card-back {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(42, 36, 32, 0.95) 0%, rgba(26, 22, 20, 0.98) 100%);
  border: 2px solid rgba(212, 165, 116, 0.35);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.back-border {
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(212, 165, 116, 0.25);
}

.back-pattern {
  position: absolute;
  inset: 12px;
  background:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 4px,
      rgba(212, 165, 116, 0.04) 4px,
      rgba(212, 165, 116, 0.04) 8px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 4px,
      rgba(212, 165, 116, 0.04) 4px,
      rgba(212, 165, 116, 0.04) 8px
    );
}

.back-sigil {
  font-size: 24px;
  color: var(--color-primary);
  opacity: 0.5;
  z-index: 1;
}

.tarot-card.generating .card-back {
  overflow: hidden;
}

.tarot-card.generating .card-back::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(212, 165, 116, 0.4) 45%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(212, 165, 116, 0.4) 55%,
    transparent 60%
  );
  transform: translateX(-100%);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.glow-overlay {
  display: none;
}

.generating-text {
  text-align: center;
  margin-top: var(--space-6);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  animation: textFade 2s ease-in-out infinite;
}

@keyframes textFade {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.revealed-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  animation: revealFade 0.8s var(--ease-out);
}

@keyframes revealFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.revealed-card {
  width: 260px;
}

.card-face {
  background: linear-gradient(180deg, rgba(42, 36, 32, 0.95) 0%, rgba(26, 22, 20, 0.98) 100%);
  border: 2px solid rgba(212, 165, 116, 0.4);
  border-radius: 8px;
  padding: var(--space-6);
  text-align: center;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(212, 165, 116, 0.15);
}

.card-numeral-large {
  font-family: var(--font-heading);
  font-size: 2rem;
  color: var(--color-primary);
  opacity: 0.7;
}

.card-name {
  margin: var(--space-2) 0;
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--color-text);
}

.card-archetype {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  font-style: italic;
}

.card-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin: var(--space-4) 0;
}

.card-divider .divider-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.4), transparent);
}

.card-divider .divider-symbol {
  color: var(--color-primary);
  font-size: 8px;
  opacity: 0.6;
}

.card-interpretation {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.spark-prompt-section {
  width: 100%;
  padding: var(--space-5);
  background: rgba(212, 165, 116, 0.05);
  border: 1px solid rgba(212, 165, 116, 0.2);
  border-radius: var(--radius-md);
  text-align: center;
}

.prompt-label {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-text-tertiary);
}

.prompt-text {
  margin: 0 0 var(--space-4);
  font-size: var(--text-base);
  color: var(--color-text);
  line-height: 1.6;
}

.use-prompt-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: transparent;
  border: 1.5px solid rgba(212, 165, 116, 0.4);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.3s var(--ease-out);
}

.use-prompt-btn:hover {
  background: rgba(212, 165, 116, 0.1);
  border-color: var(--color-primary);
  box-shadow: 0 0 20px rgba(212, 165, 116, 0.2);
}

.tarot-modal-enter-active {
  animation: modalIn 0.4s var(--ease-out);
}

.tarot-modal-leave-active {
  animation: modalOut 0.3s var(--ease-out);
}

@keyframes modalIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (max-width: 640px) {
  .tarot-container {
    padding: var(--space-6);
  }

  .card-spread {
    gap: var(--space-3);
  }

  .tarot-card {
    width: 90px;
    height: 135px;
  }

  .revealed-card {
    width: 160px;
  }

  .card-face {
    padding: var(--space-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tarot-card,
  .tarot-card.generating .card-back,
  .tarot-card.generating .back-sigil,
  .glow-overlay,
  .generating-text,
  .revealed-phase {
    animation: none;
  }

  .tarot-card.hovering {
    transform: scale(1.02);
  }
}
</style>
