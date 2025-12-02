<script setup lang="ts">
interface Props {
  variant: 'spark' | 'cauldron' | 'oracle'
  symbolCount?: number
  opacity?: number
}

const props = withDefaults(defineProps<Props>(), {
  symbolCount: 12,
  opacity: 0.02
})

const reducedMotion = useReducedMotion()

const SYMBOL_SETS = {
  spark: ['✦', '◇', '⟡', '✧', '⊛', '❋'],
  cauldron: ['☿', '⚗', '∞', '◎', '⊕', '☽'],
  oracle: ['★', '☆', '✶', '⊹', '◐', '☾']
}

interface Rune {
  id: number
  symbol: string
  x: number
  y: number
  size: number
  duration: number
  delay: number
  direction: 'left' | 'right' | 'up' | 'down'
}

const runes = ref<Rune[]>([])
const runeRefs = ref<HTMLElement[]>([])

function getRandomSymbol(): string {
  const symbols = SYMBOL_SETS[props.variant]
  return symbols[Math.floor(Math.random() * symbols.length)]
}

function getRandomDirection(): 'left' | 'right' | 'up' | 'down' {
  const directions: ('left' | 'right' | 'up' | 'down')[] = ['left', 'right', 'up', 'down']
  return directions[Math.floor(Math.random() * directions.length)]
}

function createRune(id: number): Rune {
  return {
    id,
    symbol: getRandomSymbol(),
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 16 + Math.random() * 16,
    duration: 20 + Math.random() * 20,
    delay: Math.random() * -20,
    direction: getRandomDirection()
  }
}

function initRunes() {
  runes.value = Array.from({ length: props.symbolCount }, (_, i) => createRune(i))
}

function repositionRune(rune: Rune) {
  switch (rune.direction) {
    case 'left':
      rune.x = 100 + Math.random() * 10
      rune.y = Math.random() * 100
      break
    case 'right':
      rune.x = -10 - Math.random() * 10
      rune.y = Math.random() * 100
      break
    case 'up':
      rune.x = Math.random() * 100
      rune.y = 100 + Math.random() * 10
      break
    case 'down':
      rune.x = Math.random() * 100
      rune.y = -10 - Math.random() * 10
      break
  }
  rune.symbol = getRandomSymbol()
  rune.duration = 20 + Math.random() * 20
}

let observer: IntersectionObserver | null = null

function setupObserver() {
  if (reducedMotion.value || !import.meta.client) return

  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          const index = runeRefs.value.indexOf(entry.target as HTMLElement)
          if (index !== -1 && runes.value[index]) {
            repositionRune(runes.value[index])
          }
        }
      })
    },
    { rootMargin: '50px' }
  )

  runeRefs.value.forEach(el => {
    if (el) observer?.observe(el)
  })
}

function cleanupObserver() {
  observer?.disconnect()
  observer = null
}

onMounted(() => {
  initRunes()
  nextTick(() => {
    setupObserver()
  })
})

onUnmounted(() => {
  cleanupObserver()
})

watch(reducedMotion, isReduced => {
  if (isReduced) {
    cleanupObserver()
  } else {
    setupObserver()
  }
})

function setRuneRef(el: HTMLElement | null, index: number) {
  if (el) {
    runeRefs.value[index] = el
  }
}
</script>

<template>
  <div class="background-runes" :style="{ '--rune-opacity': opacity }">
    <span
      v-for="(rune, index) in runes"
      :key="rune.id"
      :ref="el => setRuneRef(el as HTMLElement, index)"
      class="rune"
      :class="[`rune--${rune.direction}`, { 'rune--paused': reducedMotion }]"
      :style="{
        left: `${rune.x}%`,
        top: `${rune.y}%`,
        fontSize: `${rune.size}px`,
        animationDuration: `${rune.duration}s`,
        animationDelay: `${rune.delay}s`
      }"
    >
      {{ rune.symbol }}
    </span>
  </div>
</template>

<style scoped>
.background-runes {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.rune {
  position: absolute;
  opacity: var(--rune-opacity, 0.02);
  color: var(--color-text);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.rune--paused {
  animation: none !important;
}

.rune--left {
  animation-name: drift-left;
}

.rune--right {
  animation-name: drift-right;
}

.rune--up {
  animation-name: drift-up;
}

.rune--down {
  animation-name: drift-down;
}

@keyframes drift-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-120vw);
  }
}

@keyframes drift-right {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(120vw);
  }
}

@keyframes drift-up {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-120vh);
  }
}

@keyframes drift-down {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(120vh);
  }
}
</style>
