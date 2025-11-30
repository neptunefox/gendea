<template>
  <div
    class="cauldron-pot"
    :class="{
      'drag-over': isDragOver,
      'manual-add': showManualAddEffect,
      mixing: isMixing,
      'has-ingredients': ingredients.length > 0
    }"
    @drop="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <div class="universe-interior">
      <div class="nebula-layer"></div>
      <div class="stars-layer">
        <div v-for="star in stars" :key="star.id" class="star" :style="star.style"></div>
      </div>
      <div v-if="isMixing || isDragOver" class="shooting-star"></div>
    </div>

    <div class="liquid-rim"></div>

    <div v-if="ingredients.length === 0" class="drop-hint">
      <span class="hint-text">drop ideas here</span>
      <svg class="hint-arrow" viewBox="0 0 100 60" fill="none">
        <path
          d="M8 10 C30 8, 50 20, 70 40 C80 52, 88 55, 92 52"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
        <path
          d="M85 58 L93 52 L86 46"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </svg>
    </div>

    <div class="pot-body">
      <div v-if="ingredients.length > 0 && ingredients.length < 3" class="ingredient-counter">
        {{ 3 - ingredients.length }} more
      </div>
      <div v-else-if="isMixing && streamingText" class="streaming-text">
        {{ streamingText }}
        <span class="cursor"></span>
      </div>
      <div v-else-if="ingredients.length >= 3 && isMixing" class="mixing-indicator"></div>

      <div v-if="ingredients.length > 0" class="ingredients-list">
        <div
          v-for="ingredient in ingredients.slice(-3)"
          :key="ingredient.id"
          class="ingredient-chip"
        >
          {{ ingredient.content.slice(0, 25) }}{{ ingredient.content.length > 25 ? '...' : '' }}
        </div>
        <div v-if="ingredients.length > 3" class="more-count">
          +{{ ingredients.length - 3 }} more
        </div>
      </div>
    </div>

    <div
      v-for="bubble in activeBubbles"
      :key="bubble.id"
      class="bubble"
      :style="bubble.style"
    ></div>

    <div v-if="isMixing" class="glow-effect"></div>

    <div
      v-for="bubble in mixingBubbles"
      :key="`mixing-${bubble.id}`"
      class="mixing-bubble"
      :style="bubble.style"
    ></div>

    <transition name="dissolve">
      <div v-if="showManualAddEffect" class="manual-add-particle"></div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface CauldronIngredient {
  id: string
  sessionId: string
  sourceType: string
  sourceId: string | null
  content: string
  addedAt: string
  order: number
}

interface Props {
  ingredients: CauldronIngredient[]
  isMixing: boolean
  streamingText?: string
}

const props = defineProps<Props>()

const streamingText = computed(() => {
  if (!props.streamingText) return ''
  const maxLen = 80
  if (props.streamingText.length <= maxLen) return props.streamingText
  return '...' + props.streamingText.slice(-maxLen)
})

const emit = defineEmits<{
  drop: [event: DragEvent]
}>()

const isDragOver = ref(false)
const showManualAddEffect = ref(false)
const activeBubbles = ref<Array<{ id: number; style: Record<string, string> }>>([])
const mixingBubbles = ref<Array<{ id: number; style: Record<string, string> }>>([])
let bubbleIdCounter = 0
let mixingBubbleInterval: NodeJS.Timeout | null = null

const stars = ref<Array<{ id: number; style: Record<string, string> }>>([])

function generateStars() {
  const starCount = 35
  stars.value = Array.from({ length: starCount }, (_, i) => ({
    id: i,
    style: {
      width: `${Math.random() * 3 + 1}px`,
      height: `${Math.random() * 3 + 1}px`,
      top: `${Math.random() * 70 + 15}%`,
      left: `${Math.random() * 70 + 15}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${Math.random() * 2 + 1}s`
    }
  }))
}

generateStars()

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
  triggerDropBubbles()
  emit('drop', event)
}

function triggerManualAddAnimation() {
  showManualAddEffect.value = true
  triggerDropBubbles()
  setTimeout(() => {
    showManualAddEffect.value = false
  }, 800)
}

function triggerDropBubbles() {
  const bubbleCount = Math.floor(Math.random() * 4) + 2
  const newBubbles = []

  for (let i = 0; i < bubbleCount; i++) {
    const size = Math.floor(Math.random() * 10) + 14
    const bottom = Math.floor(Math.random() * 10) + 28
    const left = Math.floor(Math.random() * 60) + 20
    const delay = Math.random() * 0.2

    newBubbles.push({
      id: bubbleIdCounter++,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        bottom: `${bottom}%`,
        left: `${left}%`,
        animationDelay: `${delay}s`
      }
    })
  }

  activeBubbles.value = newBubbles

  setTimeout(() => {
    activeBubbles.value = []
  }, 2000)
}

function createMixingBubble() {
  const size = Math.floor(Math.random() * 8) + 10
  const bottom = Math.floor(Math.random() * 15) + 25
  const left = Math.floor(Math.random() * 50) + 25

  mixingBubbles.value.push({
    id: bubbleIdCounter++,
    style: {
      width: `${size}px`,
      height: `${size}px`,
      bottom: `${bottom}%`,
      left: `${left}%`
    }
  })

  setTimeout(() => {
    mixingBubbles.value.shift()
  }, 2000)
}

watch(
  () => props.isMixing,
  mixing => {
    if (mixing) {
      mixingBubbles.value = []
      mixingBubbleInterval = setInterval(createMixingBubble, 600)
    } else {
      if (mixingBubbleInterval) {
        clearInterval(mixingBubbleInterval)
        mixingBubbleInterval = null
      }
      mixingBubbles.value = []
    }
  }
)

defineExpose({
  triggerManualAddAnimation
})
</script>

<style scoped>
.cauldron-pot {
  width: 320px;
  height: 160px;
  background: linear-gradient(180deg, #5a4a6a 0%, #3d3050 60%, #2a2040 100%);
  border-radius: 50% / 30% 30% 70% 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 16px 40px rgba(149, 117, 205, 0.35),
    inset 0 -20px 30px rgba(0, 0, 0, 0.3),
    inset 0 8px 12px rgba(255, 255, 255, 0.05);
  position: relative;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  flex-shrink: 0;
}

.drop-hint {
  position: absolute;
  top: -55px;
  left: -115px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: none;
  animation: hint-bob 3s ease-in-out infinite;
}

.hint-text {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-primary);
  white-space: nowrap;
  padding-left: 4px;
}

.hint-arrow {
  width: 100px;
  height: 60px;
  color: var(--color-primary);
  opacity: 0.6;
  margin-top: -8px;
}

@keyframes hint-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.cauldron-pot.drag-over .drop-hint,
.cauldron-pot.has-ingredients .drop-hint {
  display: none;
}

.cauldron-pot.drag-over {
  transform: scale(1.03);
  box-shadow:
    0 16px 36px rgba(149, 117, 205, 0.4),
    inset 0 -20px 30px rgba(0, 0, 0, 0.3),
    inset 0 8px 12px rgba(255, 255, 255, 0.05),
    0 0 0 4px var(--color-glow-purple);
}

.cauldron-pot.mixing {
  animation: simmer 2s ease-in-out infinite;
}

@keyframes simmer {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01);
  }
}

.universe-interior {
  position: absolute;
  top: 12px;
  left: 18%;
  right: 18%;
  height: 70%;
  border-radius: 50% / 40% 40% 60% 60%;
  overflow: hidden;
  z-index: 1;
}

.nebula-layer {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(147, 51, 234, 0.6) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(236, 72, 153, 0.5) 0%, transparent 45%),
    radial-gradient(ellipse at 50% 30%, rgba(59, 130, 246, 0.5) 0%, transparent 40%),
    radial-gradient(ellipse at 60% 70%, rgba(16, 185, 129, 0.4) 0%, transparent 35%),
    linear-gradient(180deg, #0f0a1e 0%, #1a0a2e 50%, #0d1b2a 100%);
  animation: nebula-shift 8s ease-in-out infinite;
}

.cauldron-pot.mixing .nebula-layer {
  animation: nebula-shift 3s ease-in-out infinite;
}

@keyframes nebula-shift {
  0%,
  100% {
    filter: hue-rotate(0deg) brightness(1);
  }
  50% {
    filter: hue-rotate(20deg) brightness(1.2);
  }
}

.stars-layer {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.6);
  animation: twinkle var(--duration, 2s) ease-in-out infinite;
  animation-duration: inherit;
}

.star:nth-child(3n) {
  background: #fef3c7;
  box-shadow: 0 0 4px 1px rgba(254, 243, 199, 0.7);
}

.star:nth-child(5n) {
  background: #c4b5fd;
  box-shadow: 0 0 4px 1px rgba(196, 181, 253, 0.7);
}

.star:nth-child(7n) {
  background: #a5f3fc;
  box-shadow: 0 0 4px 1px rgba(165, 243, 252, 0.7);
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

.shooting-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  top: 30%;
  left: 20%;
  box-shadow:
    0 0 6px 2px rgba(255, 255, 255, 0.8),
    -20px 0 15px 1px rgba(255, 255, 255, 0.4),
    -40px 0 20px 0px rgba(255, 255, 255, 0.2);
  animation: shoot 2s ease-in-out infinite;
}

@keyframes shoot {
  0% {
    transform: translateX(0) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translateX(80px) translateY(40px);
    opacity: 0;
  }
}

.liquid-rim {
  position: absolute;
  top: 14px;
  left: 20%;
  right: 20%;
  height: 16px;
  background: linear-gradient(180deg, rgba(200, 160, 220, 0.7) 0%, rgba(100, 60, 120, 0.3) 100%);
  border-radius: 50%;
  z-index: 5;
}

.cauldron-pot.has-ingredients .liquid-rim {
  height: 22px;
  top: 10px;
  left: 18%;
  right: 18%;
  background: linear-gradient(180deg, rgba(220, 180, 240, 0.8) 0%, rgba(120, 80, 160, 0.4) 100%);
}

.pot-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  color: white;
  text-align: center;
  position: relative;
  z-index: 2;
  padding-top: 10px;
}

.ingredient-counter {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.mixing-indicator {
  width: 100%;
  height: 100%;
}

.streaming-text {
  font-size: var(--text-xs);
  line-height: 1.4;
  max-width: 240px;
  max-height: 60px;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0.95;
  text-align: center;
  word-wrap: break-word;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: rgba(255, 255, 255, 0.9);
  margin-left: 2px;
  animation: blink 0.6s infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.ingredients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
  max-width: 260px;
}

.ingredient-chip {
  font-size: var(--text-xs);
  padding: 0.125rem var(--space-2);
  background: rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-md);
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-count {
  font-size: var(--text-xs);
  padding: 0.125rem var(--space-1);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  opacity: 0.9;
}

.bubble {
  position: absolute;
  background: radial-gradient(circle at 30% 30%, rgba(196, 181, 253, 0.6), rgba(147, 51, 234, 0.3));
  border-radius: 50%;
  pointer-events: none;
  z-index: 6;
  animation: bubble-rise 1.5s ease-out forwards;
}

@keyframes bubble-rise {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  60% {
    opacity: 0.5;
    transform: translateY(-80px) scale(0.9);
  }
  100% {
    transform: translateY(-120px) scale(0.4);
    opacity: 0;
  }
}

.mixing-bubble {
  position: absolute;
  background: radial-gradient(circle at 30% 30%, rgba(165, 243, 252, 0.5), rgba(59, 130, 246, 0.3));
  border-radius: 50%;
  pointer-events: none;
  z-index: 6;
  animation: mixing-bubble-rise 2s ease-out forwards;
}

@keyframes mixing-bubble-rise {
  0% {
    transform: translateY(0) scale(0.6);
    opacity: 0;
  }
  15% {
    opacity: 0.5;
  }
  70% {
    opacity: 0.4;
    transform: translateY(-60px) scale(0.9);
  }
  100% {
    transform: translateY(-90px) scale(0.5);
    opacity: 0;
  }
}

.cauldron-pot.manual-add {
  animation: pulse 0.4s ease-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

.manual-add-particle {
  position: absolute;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(212, 117, 111, 0.4) 100%);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 3;
}

.dissolve-enter-active {
  animation: dissolve-in 0.8s ease-out;
}

@keyframes dissolve-in {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.glow-effect {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(147, 51, 234, 0.15) 0%,
    rgba(236, 72, 153, 0.1) 50%,
    transparent 70%
  );
  animation: gentle-glow 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes gentle-glow {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .cauldron-pot {
    width: 280px;
    height: 140px;
  }

  .ingredient-counter {
    font-size: 0.875rem;
  }
}
</style>
