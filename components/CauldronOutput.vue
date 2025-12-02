<template>
  <transition name="emerge" @after-enter="handleEmergenceComplete">
    <div v-if="show" class="cauldron-output">
      <div class="steam-container">
        <div v-for="i in 6" :key="i" class="steam" :style="getSteamStyle(i)"></div>
      </div>

      <div class="output-card" :class="{ crystallizing: isCrystallizing }">
        <div class="card-content">
          <h3 class="output-title">Converged</h3>
          <p class="output-text" :class="{ 'shimmer-text': isCrystallizing }">{{ output }}</p>
          <div class="output-actions">
            <button class="action-btn save" @click="$emit('save')">
              <BookmarkPlus :size="18" />
              Save
            </button>
            <button class="action-btn oracle" @click="$emit('askOracle')">
              <HelpCircle :size="18" />
              Dialogue
            </button>
            <button class="action-btn secondary" @click="$emit('reset')">
              <RotateCcw :size="18" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { HelpCircle, BookmarkPlus, RotateCcw } from 'lucide-vue-next'
import { ref, watch } from 'vue'

import { useReducedMotion } from '~/composables/useReducedMotion'

interface Props {
  output: string | null
  isFinalized?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFinalized: true
})

const emit = defineEmits<{
  save: []
  askOracle: []
  reset: []
  crystallized: []
}>()

const show = ref(false)
const isCrystallizing = ref(false)
const reducedMotion = useReducedMotion()

watch(
  () => props.output,
  newOutput => {
    if (newOutput) {
      show.value = true
    } else {
      show.value = false
      isCrystallizing.value = false
    }
  },
  { immediate: true }
)

function handleEmergenceComplete() {
  if (!reducedMotion.value) {
    isCrystallizing.value = true
    setTimeout(() => {
      isCrystallizing.value = false
      emit('crystallized')
    }, 400)
  } else {
    emit('crystallized')
  }
}

function getSteamStyle(index: number) {
  const offset = (index - 1) * 15
  return {
    '--offset': `${offset - 30}px`,
    '--delay': `${index * 0.1}s`,
    '--duration': `${2 + Math.random() * 0.5}s`
  }
}
</script>

<style scoped>
.cauldron-output {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  z-index: 10;
}

.steam-container {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 80px;
  pointer-events: none;
  z-index: 1;
}

.steam {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 30px;
  height: 30px;
  background: radial-gradient(
    circle,
    hsla(140, 60%, 45%, 0.6) 0%,
    var(--color-glow-cauldron) 50%,
    transparent 100%
  );
  border-radius: 50%;
  transform: translateX(var(--offset, 0));
  animation: steam-rise var(--duration, 2s) ease-out infinite;
  animation-delay: var(--delay, 0s);
}

@keyframes steam-rise {
  0% {
    transform: translateX(var(--offset, 0)) translateY(0) scale(0.7);
    opacity: 0;
    filter: blur(2px);
  }
  25% {
    opacity: 0.7;
    filter: blur(3px);
  }
  100% {
    transform: translateX(var(--offset, 0)) translateY(-90px) scale(1.8);
    opacity: 0;
    filter: blur(5px);
  }
}

.output-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-cauldron);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  max-width: 480px;
  width: 100%;
  box-shadow:
    0 0 30px var(--color-glow-cauldron),
    var(--shadow-xl);
  z-index: 2;
}

.card-content {
  position: relative;
  z-index: 1;
}

.output-title {
  margin: 0 0 var(--space-3) 0;
  color: var(--color-cauldron);
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 500;
  text-align: center;
}

.output-text {
  color: var(--color-text);
  font-size: var(--text-base);
  line-height: 1.6;
  margin: 0 0 var(--space-5) 0;
  text-align: center;
}

.output-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: var(--space-2) var(--space-5);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.action-btn.save {
  background: var(--color-cauldron-subtle);
  color: var(--color-cauldron);
  border: 1px solid var(--color-cauldron);
}

.action-btn.save:hover {
  background: var(--color-cauldron);
  color: white;
}

.action-btn.oracle {
  background: var(--color-surface-raised);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
}

.action-btn.oracle:hover {
  background: var(--color-oracle-subtle);
  border-color: var(--color-oracle);
  color: var(--color-oracle);
}

.action-btn.secondary {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
}

.action-btn.secondary:hover {
  background: var(--color-primary-ring);
  border-color: var(--color-primary);
}

.emerge-enter-active {
  animation: emerge 1.2s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.emerge-leave-active {
  animation: fade-out var(--duration-slow) var(--ease-out);
}

@keyframes emerge {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.85);
    filter: blur(4px);
  }
  50% {
    opacity: 0.7;
    filter: blur(1px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0px);
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes crystallize-glow {
  0% {
    box-shadow:
      0 0 30px var(--color-glow-cauldron),
      var(--shadow-xl);
  }
  50% {
    box-shadow:
      0 0 50px var(--color-glow-cauldron),
      0 0 80px hsla(140, 60%, 45%, 0.4),
      var(--shadow-xl);
  }
  100% {
    box-shadow:
      0 0 30px var(--color-glow-cauldron),
      var(--shadow-xl);
  }
}

.output-card.crystallizing {
  animation: crystallize-glow 400ms ease-out;
}

.shimmer-text {
  background: linear-gradient(
    90deg,
    var(--color-text) 0%,
    var(--color-text) 40%,
    hsla(140, 60%, 45%, 0.8) 50%,
    var(--color-text) 60%,
    var(--color-text) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 400ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .output-card.crystallizing {
    animation: none;
  }

  .shimmer-text {
    animation: none;
    background: none;
    -webkit-background-clip: unset;
    background-clip: unset;
    -webkit-text-fill-color: unset;
    color: var(--color-text);
  }
}

@media (max-width: 768px) {
  .cauldron-output {
    padding: var(--space-4);
  }

  .output-card {
    padding: var(--space-8) var(--space-6);
  }

  .output-title {
    font-size: var(--text-lg);
  }

  .output-text {
    font-size: var(--text-base);
  }

  .output-actions {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
