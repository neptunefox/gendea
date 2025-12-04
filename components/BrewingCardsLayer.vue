<script setup lang="ts">
import { computed } from 'vue'
import { truncateText, calculateCardPositions } from '~/utils/brewing-cards'
import type { BrewingCardDisplay } from '~/types/cauldron'

interface CauldronIngredient {
  id: string
  content: string
}

interface Props {
  ingredients: CauldronIngredient[]
  isMixing: boolean
  streamingText: string
}

const props = defineProps<Props>()

const brewingCards = computed<BrewingCardDisplay[]>(() => {
  const positions = calculateCardPositions(props.ingredients.length)
  return props.ingredients.map((ingredient, index) => ({
    id: ingredient.id,
    content: ingredient.content,
    displayText: truncateText(ingredient.content),
    position: positions[index] || { x: 0, y: 50, rotation: 0, scale: 1 },
    isNew: false
  }))
})
</script>

<template>
  <div class="brewing-cards-layer">
    <div class="cards-container">
      <TransitionGroup name="card">
        <div
          v-for="card in brewingCards"
          :key="card.id"
          class="brewing-card-wrapper"
          :style="{
            '--card-x': `${card.position.x}%`,
            '--card-y': `${card.position.y}%`,
            '--card-rotation': `${card.position.rotation}deg`,
            '--card-scale': card.position.scale,
          }"
        >
          <div class="brewing-card" :class="{ 'is-mixing': isMixing }">
            {{ card.displayText }}
          </div>
        </div>
      </TransitionGroup>
    </div>

    <div v-if="streamingText" class="streaming-text">
      {{ streamingText }}
    </div>
  </div>
</template>

<style scoped>
.brewing-cards-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 200px;
  pointer-events: none;
  z-index: 10;
}

.cards-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.brewing-card-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translate(var(--card-x), var(--card-y)) rotate(var(--card-rotation)) scale(var(--card-scale));
}

.brewing-card {
  padding: var(--space-2) var(--space-3);
  background: hsla(180, 60%, 15%, 0.9);
  border: 1px solid hsla(170, 80%, 50%, 0.5);
  border-radius: var(--radius-md);
  color: hsla(170, 80%, 70%, 1);
  font-size: var(--text-xs);
  max-width: 120px;
  text-align: center;
  box-shadow: 0 0 12px hsla(170, 80%, 50%, 0.3);
  animation: bob 3s ease-in-out infinite;
}

.brewing-card.is-mixing {
  animation: bob-intense 1.5s ease-in-out infinite;
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes bob-intense {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.streaming-text {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: var(--space-0);
  padding: var(--space-3) var(--space-4);
  background: hsla(180, 60%, 10%, 0.85);
  border: 1px solid hsla(170, 80%, 50%, 0.4);
  border-radius: var(--radius-lg);
  color: hsla(170, 80%, 70%, 1);
  font-size: var(--text-sm);
  width: 220px;
  max-height: 100px;
  overflow: hidden;
  text-align: center;
  text-shadow: 0 0 8px hsla(170, 80%, 50%, 0.6);
  box-shadow: 0 0 20px hsla(170, 80%, 50%, 0.2);
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.card-enter-active {
  transition: all 0.5s var(--ease-out);
}

.card-leave-active {
  transition: all 0.4s var(--ease-out);
}

.card-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) translate(var(--card-x), var(--card-y)) scale(0.5);
}

.card-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) translate(var(--card-x), var(--card-y)) scale(0.3);
}

@media (prefers-reduced-motion: reduce) {
  .brewing-card,
  .brewing-card.is-mixing {
    animation: none;
  }
}
</style>
