<template>
  <transition name="ghost-fade">
    <div v-if="visible" class="ghost-ingredients">
      <div
        v-for="ghost in ghosts"
        :key="ghost.id"
        class="ghost-shape"
        :class="{ 'no-motion': reducedMotion }"
        :style="ghost.style"
      >
        <span class="ghost-text">{{ ghost.text }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

interface Props {
  visible: boolean
}

defineProps<Props>()

const reducedMotion = useReducedMotion()

const ghosts = computed(() => [
  {
    id: 1,
    text: 'idea',
    style: {
      top: '25%',
      left: '20%',
      animationDelay: '0s'
    }
  },
  {
    id: 2,
    text: 'spark',
    style: {
      top: '35%',
      left: '55%',
      animationDelay: '0.8s'
    }
  },
  {
    id: 3,
    text: 'thought',
    style: {
      top: '50%',
      left: '35%',
      animationDelay: '1.6s'
    }
  }
])
</script>

<style scoped>
.ghost-ingredients {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.ghost-shape {
  position: absolute;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  animation: ghost-bob 3s ease-in-out infinite;
}

.ghost-shape.no-motion {
  animation: none;
}

.ghost-text {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.25);
  font-style: italic;
}

@keyframes ghost-bob {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-6px);
    opacity: 0.8;
  }
}

.ghost-fade-enter-active {
  transition: opacity 0.3s ease;
}

.ghost-fade-leave-active {
  transition: opacity 0.3s ease;
}

.ghost-fade-enter-from,
.ghost-fade-leave-to {
  opacity: 0;
}
</style>
