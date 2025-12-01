<template>
  <div v-if="visible" class="seal-animation" :class="{ 'reduced-motion': reducedMotion }" :style="{ '--seal-color': color }">
    <div class="seal-stamp">
      <svg viewBox="0 0 48 48" class="seal-icon">
        <circle cx="24" cy="24" r="20" fill="currentColor" />
        <path
          d="M24 12l2.5 7.5H34l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5z"
          fill="var(--color-bg)"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

const props = withDefaults(defineProps<{
  color?: string
  active?: boolean
}>(), {
  color: '#d4a574',
  active: false
})

const emit = defineEmits<{
  complete: []
}>()

const visible = ref(false)
const reducedMotion = useReducedMotion()

function triggerAnimation() {
  visible.value = true
  const duration = reducedMotion.value ? 200 : 600
  setTimeout(() => {
    visible.value = false
    emit('complete')
  }, duration)
}

watch(() => props.active, (newVal) => {
  if (newVal) {
    triggerAnimation()
  }
})

onMounted(() => {
  if (props.active) {
    triggerAnimation()
  }
})
</script>

<style scoped>
.seal-animation {
  position: absolute;
  top: 50%;
  right: var(--space-4);
  transform: translateY(-50%);
  pointer-events: none;
}

.seal-stamp {
  width: 32px;
  height: 32px;
  color: var(--seal-color);
  animation: stamp-down var(--duration-seal, 600ms) var(--ease-out) forwards;
}

.seal-icon {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

@keyframes stamp-down {
  0% {
    transform: scale(1.5) rotate(-15deg);
    opacity: 0;
  }
  40% {
    transform: scale(1.0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(0.95) rotate(0deg);
    opacity: 1;
  }
  60% {
    transform: scale(1.05) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(1.0) rotate(0deg);
    opacity: 1;
  }
}

.seal-animation.reduced-motion .seal-stamp {
  animation: stamp-fade 200ms var(--ease-out) forwards;
}

@keyframes stamp-fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
