<script setup lang="ts">
import { computed, watch, ref, nextTick } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

interface Props {
  text: string
  isActive: boolean
}

const props = defineProps<Props>()
const reducedMotion = useReducedMotion()
const containerRef = ref<HTMLElement | null>(null)

const words = computed(() => {
  if (!props.text) return []
  return props.text.split(/(\s+)/).filter(w => w.length > 0)
})

const visibleWordCount = ref(0)
const isVisible = ref(false)
const isFadingOut = ref(false)

function scrollToBottom() {
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  })
}

watch(() => props.text, (newText, oldText) => {
  if (!oldText && newText) {
    isVisible.value = true
    isFadingOut.value = false
  }
  
  const newWords = newText ? newText.split(/(\s+)/).filter(w => w.length > 0) : []
  if (newWords.length > visibleWordCount.value) {
    animateNewWords(visibleWordCount.value, newWords.length)
  }
}, { immediate: true })

watch(() => props.isActive, (active) => {
  if (!active && props.text) {
    isFadingOut.value = true
    setTimeout(() => {
      isVisible.value = false
      visibleWordCount.value = 0
      isFadingOut.value = false
    }, 800)
  }
})

function animateNewWords(from: number, to: number) {
  if (reducedMotion.value) {
    visibleWordCount.value = to
    scrollToBottom()
    return
  }
  
  const delay = 50
  for (let i = from; i < to; i++) {
    setTimeout(() => {
      visibleWordCount.value = i + 1
      scrollToBottom()
    }, (i - from) * delay)
  }
}
</script>


<template>
  <Transition name="fade">
    <div
      v-if="isVisible && words.length > 0"
      ref="containerRef"
      class="streaming-text-display"
      :class="{ 'is-fading-out': isFadingOut }"
    >
      <span
        v-for="(word, index) in words"
        :key="index"
        class="word"
        :class="{ 'is-visible': index < visibleWordCount }"
      >{{ word }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.streaming-text-display {
  position: absolute;
  bottom: 85%;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-3) var(--space-4);
  background: hsla(180, 60%, 10%, 0.85);
  border: 1px solid hsla(170, 80%, 50%, 0.4);
  border-radius: var(--radius-lg);
  color: hsla(170, 80%, 70%, 1);
  font-size: var(--text-sm);
  width: 220px;
  max-height: calc(1.4em * 5 + var(--space-3) * 2);
  overflow-y: auto;
  overflow-x: hidden;
  text-align: center;
  text-shadow: 0 0 8px hsla(170, 80%, 50%, 0.6);
  box-shadow: 0 0 20px hsla(170, 80%, 50%, 0.2);
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 100%);
  transition: opacity 0.8s var(--ease-out);
  scrollbar-width: none;
}

.streaming-text-display::-webkit-scrollbar {
  display: none;
}

.streaming-text-display.is-fading-out {
  opacity: 0;
}

.word {
  opacity: 0;
  transition: opacity 0.15s var(--ease-out);
}

.word.is-visible {
  opacity: 1;
}

.fade-enter-active {
  transition: opacity 0.3s var(--ease-out);
}

.fade-leave-active {
  transition: opacity 0.8s var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .word {
    opacity: 1;
    transition: none;
  }
  
  .streaming-text-display {
    transition: none;
  }
}
</style>
