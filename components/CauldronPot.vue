<template>
  <div
    class="cauldron-pot"
    :class="{
      'drag-over': isDragOver,
      bubbling: ingredients.length === 0,
      'manual-add': showManualAddEffect,
      mixing: isMixing
    }"
    @drop="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <div class="pot-body">
      <div v-if="ingredients.length < 3" class="ingredient-counter">
        {{ 3 - ingredients.length }} more {{ ingredients.length === 2 ? 'idea' : 'ideas' }} needed
      </div>
      <div v-else-if="isMixing" class="mixing-indicator">
        <Loader :size="24" class="spin" />
        <span>Mixing...</span>
      </div>
      <div v-else class="ingredients-list">
        <div
          v-for="(ingredient, index) in ingredients"
          :key="ingredient.id"
          class="ingredient-item"
        >
          {{ index + 1 }}. {{ ingredient.content.slice(0, 40)
          }}{{ ingredient.content.length > 40 ? '...' : '' }}
        </div>
      </div>
    </div>

    <div v-if="ingredients.length === 0" class="bubble bubble-1"></div>
    <div v-if="ingredients.length === 0" class="bubble bubble-2"></div>
    <div v-if="ingredients.length === 0" class="bubble bubble-3"></div>

    <div v-if="isMixing" class="mixing-particles">
      <div v-for="i in 12" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <div v-if="isMixing" class="glow-effect"></div>

    <transition name="dissolve">
      <div v-if="showManualAddEffect" class="manual-add-particle"></div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { Loader } from 'lucide-vue-next'
import { ref } from 'vue'

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

defineProps<Props>()

const emit = defineEmits<{
  drop: [event: DragEvent]
}>()

const isDragOver = ref(false)
const showManualAddEffect = ref(false)

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
  emit('drop', event)
}

function triggerManualAddAnimation() {
  showManualAddEffect.value = true
  setTimeout(() => {
    showManualAddEffect.value = false
  }, 800)
}

function getParticleStyle(index: number) {
  const angle = (index / 12) * 360
  const radius = 40 + Math.random() * 20
  return {
    '--angle': `${angle}deg`,
    '--radius': `${radius}%`,
    '--delay': `${index * 0.1}s`,
    '--duration': `${2 + Math.random()}s`
  }
}

defineExpose({
  triggerManualAddAnimation
})
</script>

<style scoped>
.cauldron-pot {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #d4756f 0%, #c26660 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(212, 117, 111, 0.3);
  position: relative;
  transition: all 0.3s ease;
}

.cauldron-pot.drag-over {
  transform: scale(1.05);
  box-shadow: 0 12px 48px rgba(212, 117, 111, 0.5);
}

.cauldron-pot.mixing {
  animation: color-shift 3s ease-in-out infinite;
  box-shadow:
    0 0 40px rgba(212, 117, 111, 0.6),
    0 0 80px rgba(212, 117, 111, 0.4);
}

@keyframes color-shift {
  0%,
  100% {
    background: linear-gradient(135deg, #d4756f 0%, #c26660 100%);
  }
  25% {
    background: linear-gradient(135deg, #e08a7f 0%, #d4756f 100%);
  }
  50% {
    background: linear-gradient(135deg, #c26660 0%, #b85850 100%);
  }
  75% {
    background: linear-gradient(135deg, #d4756f 0%, #e08a7f 100%);
  }
}

.pot-body {
  width: 85%;
  height: 85%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: white;
  text-align: center;
  position: relative;
  z-index: 2;
}

.ingredient-counter {
  font-size: 1.5rem;
  font-weight: 700;
}

.mixing-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
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

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
}

.ingredient-item {
  font-size: 0.9375rem;
  text-align: left;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.bubble {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.cauldron-pot.bubbling .bubble {
  animation: bubble-rise 3s ease-in-out infinite;
}

.bubble-1 {
  width: 20px;
  height: 20px;
  bottom: 20%;
  left: 30%;
  animation-delay: 0s;
}

.bubble-2 {
  width: 15px;
  height: 15px;
  bottom: 25%;
  left: 55%;
  animation-delay: 1s;
}

.bubble-3 {
  width: 18px;
  height: 18px;
  bottom: 22%;
  left: 70%;
  animation-delay: 2s;
}

@keyframes bubble-rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-100px) scale(0.5);
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

.mixing-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.3) 100%);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: swirl var(--duration, 2s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

@keyframes swirl {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) translateX(calc(var(--radius, 40%) * 1px))
      rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) translateX(calc(var(--radius, 40%) * 1px))
      rotate(-360deg);
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
    rgba(255, 255, 255, 0.2) 0%,
    rgba(212, 117, 111, 0.1) 50%,
    transparent 70%
  );
  animation: pulse-glow 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@media (max-width: 768px) {
  .cauldron-pot {
    max-width: 350px;
  }

  .ingredient-counter {
    font-size: 1.25rem;
  }

  .mixing-indicator {
    font-size: 1rem;
  }
}
</style>
