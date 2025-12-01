<template>
  <svg
    v-if="visible && lines.length > 0"
    class="constellation-lines"
    :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`"
  >
    <defs>
      <linearGradient id="constellation-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(212, 165, 116, 0)" />
        <stop offset="50%" stop-color="rgba(212, 165, 116, 0.4)" />
        <stop offset="100%" stop-color="rgba(212, 165, 116, 0)" />
      </linearGradient>
    </defs>
    <line
      v-for="(line, index) in lines"
      :key="index"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
      class="constellation-line"
      :class="{ highlighted: isLineHighlighted(line) }"
      stroke="url(#constellation-gradient)"
    />
  </svg>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Line {
  x1: number
  y1: number
  x2: number
  y2: number
  fromIndex: number
  toIndex: number
}

const props = defineProps<{
  cardRefs: HTMLElement[]
  visible: boolean
  highlightedCardIndex?: number | null
}>()

const lines = ref<Line[]>([])
const dimensions = ref({ width: 0, height: 0 })
let resizeObserver: ResizeObserver | null = null
let containerElement: HTMLElement | null = null

function getCardCenter(card: HTMLElement): { x: number; y: number } | null {
  if (!containerElement) return null
  const cardRect = card.getBoundingClientRect()
  const containerRect = containerElement.getBoundingClientRect()
  return {
    x: cardRect.left - containerRect.left + cardRect.width / 2,
    y: cardRect.top - containerRect.top + cardRect.height / 2
  }
}

function calculateLines() {
  if (!props.cardRefs || props.cardRefs.length < 2) {
    lines.value = []
    return
  }

  const cards = props.cardRefs.filter(Boolean)
  if (cards.length < 2) {
    lines.value = []
    return
  }

  containerElement = cards[0]?.parentElement
  if (!containerElement) {
    lines.value = []
    return
  }

  const containerRect = containerElement.getBoundingClientRect()
  dimensions.value = { width: containerRect.width, height: containerRect.height }

  const centers = cards.map(card => getCardCenter(card)).filter(Boolean) as { x: number; y: number }[]
  if (centers.length < 2) {
    lines.value = []
    return
  }

  const newLines: Line[] = []
  const connected = new Set<string>()

  for (let i = 0; i < centers.length; i++) {
    const distances: { index: number; dist: number }[] = []
    
    for (let j = 0; j < centers.length; j++) {
      if (i === j) continue
      const dx = centers[j].x - centers[i].x
      const dy = centers[j].y - centers[i].y
      distances.push({ index: j, dist: Math.sqrt(dx * dx + dy * dy) })
    }

    distances.sort((a, b) => a.dist - b.dist)
    const neighbors = distances.slice(0, 2)

    for (const neighbor of neighbors) {
      const key = [Math.min(i, neighbor.index), Math.max(i, neighbor.index)].join('-')
      if (connected.has(key)) continue
      connected.add(key)

      newLines.push({
        x1: centers[i].x,
        y1: centers[i].y,
        x2: centers[neighbor.index].x,
        y2: centers[neighbor.index].y,
        fromIndex: i,
        toIndex: neighbor.index
      })
    }
  }

  lines.value = newLines
}

const isLineHighlighted = computed(() => (line: Line) => {
  if (props.highlightedCardIndex == null) return false
  return line.fromIndex === props.highlightedCardIndex || line.toIndex === props.highlightedCardIndex
})

function setupObserver() {
  if (!props.cardRefs || props.cardRefs.length === 0) return

  const cards = props.cardRefs.filter(Boolean)
  if (cards.length === 0) return

  containerElement = cards[0]?.parentElement
  if (!containerElement) return

  resizeObserver = new ResizeObserver(() => {
    calculateLines()
  })

  resizeObserver.observe(containerElement)
  cards.forEach(card => {
    if (card) resizeObserver?.observe(card)
  })
}

function cleanupObserver() {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}

function handleResize() {
  calculateLines()
}

watch(
  () => props.cardRefs,
  async () => {
    cleanupObserver()
    await nextTick()
    setupObserver()
    calculateLines()
  },
  { deep: true }
)

watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      nextTick(() => calculateLines())
    }
  }
)

onMounted(() => {
  window.addEventListener('resize', handleResize)
  nextTick(() => {
    setupObserver()
    calculateLines()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cleanupObserver()
})
</script>

<style scoped>
.constellation-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.constellation-line {
  stroke-width: 1;
  opacity: 0.15;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.constellation-line.highlighted {
  opacity: 0.4;
}
</style>
