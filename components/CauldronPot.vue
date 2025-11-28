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
    <div class="liquid-rim"></div>

    <div class="pot-body">
      <div v-if="ingredients.length === 0" class="ingredient-counter empty">Drop ideas here</div>
      <div v-else-if="ingredients.length < 3" class="ingredient-counter">
        {{ 3 - ingredients.length }} more {{ ingredients.length === 2 ? 'idea' : 'ideas' }} needed
      </div>
      <div v-else-if="isMixing" class="mixing-indicator"></div>

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
import { ref, watch } from 'vue'

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
}

const props = defineProps<Props>()

const emit = defineEmits<{
  drop: [event: DragEvent]
}>()

const isDragOver = ref(false)
const showManualAddEffect = ref(false)
const activeBubbles = ref<Array<{ id: number; style: Record<string, string> }>>([])
const mixingBubbles = ref<Array<{ id: number; style: Record<string, string> }>>([])
let bubbleIdCounter = 0
let mixingBubbleInterval: NodeJS.Timeout | null = null

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
  width: 280px;
  height: 140px;
  background: linear-gradient(180deg, #c9625c 0%, #9e4540 60%, #7a3530 100%);
  border-radius: 50% / 30% 30% 70% 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 12px 28px rgba(122, 53, 48, 0.4),
    inset 0 -20px 30px rgba(0, 0, 0, 0.2),
    inset 0 8px 12px rgba(255, 255, 255, 0.1);
  position: relative;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  flex-shrink: 0;
}


.cauldron-pot.drag-over {
  transform: scale(1.03);
  box-shadow:
    0 16px 36px rgba(122, 53, 48, 0.5),
    inset 0 -20px 30px rgba(0, 0, 0, 0.2),
    inset 0 8px 12px rgba(255, 255, 255, 0.1),
    0 0 0 4px rgba(212, 117, 111, 0.25);
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

.liquid-rim {
  position: absolute;
  top: 14px;
  left: 20%;
  right: 20%;
  height: 16px;
  background: linear-gradient(180deg, rgba(255, 190, 170, 0.75) 0%, rgba(200, 120, 100, 0.2) 100%);
  border-radius: 50%;
  z-index: 5;
}

.cauldron-pot.has-ingredients .liquid-rim {
  height: 22px;
  top: 10px;
  left: 18%;
  right: 18%;
  background: linear-gradient(180deg, rgba(255, 200, 180, 0.8) 0%, rgba(210, 130, 110, 0.3) 100%);
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
  font-size: 0.9375rem;
  font-weight: 600;
  opacity: 0.95;
}

.ingredient-counter.empty {
  opacity: 0.8;
}

.mixing-indicator {
  width: 100%;
  height: 100%;
}

.ingredients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
  max-width: 260px;
}

.ingredient-chip {
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-count {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  opacity: 0.9;
}

.bubble {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
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
  background: rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
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
    rgba(255, 255, 255, 0.08) 0%,
    rgba(212, 117, 111, 0.05) 50%,
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
    width: 240px;
    height: 120px;
  }

  .ingredient-counter {
    font-size: 0.875rem;
  }
}
</style>
