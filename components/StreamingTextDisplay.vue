<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

interface Props {
  text: string
  isActive: boolean
}

const props = defineProps<Props>()
const reducedMotion = useReducedMotion()

const words = computed(() => {
  if (!props.text) return []
  return props.text.split(/(\s+)/).filter(w => w.length > 0)
})

const visibleWordCount = ref(0)
const isVisible = ref(false)
const isFadingOut = ref(false)

watch(
  () => props.text,
  (newText, oldText) => {
    if (!oldText && newText) {
      isVisible.value = true
      isFadingOut.value = false
    }

    const newWords = newText ? newText.split(/(\s+)/).filter(w => w.length > 0) : []
    if (newWords.length > visibleWordCount.value) {
      animateNewWords(visibleWordCount.value, newWords.length)
    }
  },
  { immediate: true }
)

watch(
  () => props.isActive,
  (active) => {
    if (!active && props.text) {
      isFadingOut.value = true
      setTimeout(() => {
        isVisible.value = false
        visibleWordCount.value = 0
        isFadingOut.value = false
      }, 1500)
    }
  }
)

function animateNewWords(from: number, to: number) {
  if (reducedMotion.value) {
    visibleWordCount.value = to
    return
  }

  const delay = 50
  for (let i = from; i < to; i++) {
    setTimeout(() => {
      visibleWordCount.value = i + 1
    }, (i - from) * delay)
  }
}
</script>

<template>
  <Transition name="vapor">
    <div
      v-if="isVisible && words.length > 0"
      class="streaming-text-display"
      :class="{ 'is-fading-out': isFadingOut }"
    >
      <span
        v-for="(word, index) in words"
        :key="index"
        class="word"
        :class="{ 'is-visible': index < visibleWordCount }"
        :style="{ '--word-index': index }"
      >{{ word }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.streaming-text-display {
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  gap: 0.15em;
  color: hsla(40, 100%, 80%, 0.9);
  font-size: var(--text-sm);
  font-weight: 500;
  width: 200px;
  max-height: 100px;
  overflow: hidden;
  text-align: center;
  text-shadow:
    0 0 12px hsla(40, 100%, 65%, 0.7),
    0 0 24px hsla(30, 100%, 55%, 0.4);
  line-height: 1.4;
  mix-blend-mode: screen;
  animation: vapor-float 3s ease-in-out infinite;
}

@keyframes vapor-float {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-3px);
  }
}

.streaming-text-display.is-fading-out {
  animation: vapor-dissipate 1.5s ease-out forwards;
}

@keyframes vapor-dissipate {
  0% {
    opacity: 1;
    filter: blur(0);
    transform: translate(-50%, -50%) translateY(0);
  }
  100% {
    opacity: 0;
    filter: blur(6px);
    transform: translate(-50%, -50%) translateY(-20px);
  }
}

.word {
  opacity: 0;
  transform: translateY(6px);
  filter: blur(2px);
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out,
    filter 0.3s ease-out;
}

.word.is-visible {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.vapor-enter-active {
  transition:
    opacity 0.5s ease-out,
    filter 0.5s ease-out;
}

.vapor-leave-active {
  transition:
    opacity 1s ease-out,
    filter 1s ease-out,
    transform 1s ease-out;
}

.vapor-enter-from {
  opacity: 0;
  filter: blur(8px);
}

.vapor-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: translate(-50%, -50%) translateY(-25px);
}

@media (prefers-reduced-motion: reduce) {
  .word {
    opacity: 1;
    transform: none;
    filter: none;
    transition: none;
    animation: none;
  }

  .streaming-text-display {
    animation: none;
  }

  .streaming-text-display.is-fading-out {
    animation: none;
    opacity: 0;
  }
}
</style>
