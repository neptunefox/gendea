<template>
  <div
    ref="ideaRef"
    class="floating-idea"
    :class="{
      dragging: isDragging,
      dissolving: isDissolving,
      urgent: isUrgent,
      selected: isSelected,
      frozen: isFrozen
    }"
    :style="positionStyle"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
    @dblclick="handleDoubleClick"
  >
    <div class="timer-ring" :class="{ frozen: isFrozen }" :style="timerRingStyle" />
    <div class="idea-content">
      {{ idea.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

import { generateArcPosition, type ArcPosition } from '~/utils/floating-position'

interface FloatingIdea {
  id: string
  text: string
  source: 'saved' | 'spark'
}

interface Props {
  idea: FloatingIdea
  index: number
  totalCards: number
  duration?: number
  isSelected?: boolean
  cauldronCenter?: { x: number; y: number }
}

const props = withDefaults(defineProps<Props>(), {
  duration: 15000,
  isSelected: false,
  cauldronCenter: undefined
})
const emit = defineEmits<{
  dragStart: [idea: FloatingIdea]
  dragEnd: []
  dissolved: [idea: FloatingIdea]
  dropped: [idea: FloatingIdea, event: { clientX: number; clientY: number }]
  expired: [idea: FloatingIdea]
  select: [idea: FloatingIdea]
  throw: [idea: FloatingIdea]
}>()

const ideaRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isDissolving = ref(false)
const position = ref({ x: 0, y: 0 })
const arcPosition = ref<ArcPosition | null>(null)
const originalPosition = ref({ x: 0, y: 0 })
const zIndex = ref(10 + props.index)
const dragOffset = ref({ x: 0, y: 0 })
const hasDragged = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const DRAG_THRESHOLD = 5

const timeRemaining = ref(props.duration)
const URGENT_THRESHOLD = 5000
let timerInterval: NodeJS.Timeout | null = null

const isUrgent = computed(() => timeRemaining.value <= URGENT_THRESHOLD)
const timerProgress = computed(() => timeRemaining.value / props.duration)
const isFrozen = computed(() => props.isSelected || isDragging.value)
const timerRingStyle = computed(() => {
  const activeColor = isFrozen.value ? '#7eb8c9' : isUrgent.value ? '#c27a74' : '#d4a574'
  const bgColor = '#242120'
  const deg = timerProgress.value * 360
  return {
    background: `conic-gradient(${activeColor} ${deg}deg, ${bgColor} ${deg}deg)`
  }
})

const isSelected = computed(() => props.isSelected)
const computedZIndex = computed(() => {
  if (isDragging.value) return 200
  if (props.isSelected) return 100
  return zIndex.value
})

const positionStyle = computed(() => {
  const rotation = isDragging.value ? 0 : (arcPosition.value?.rotation ?? 0)
  const scale = arcPosition.value?.scale ?? 1
  
  return {
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    zIndex: computedZIndex.value,
    transform: isDragging.value 
      ? 'scale(1.02) rotate(1deg)' 
      : `rotate(${rotation}deg) scale(${scale})`,
    transition: isDragging.value
      ? 'none'
      : 'transform 0.3s ease, box-shadow 0.2s ease, border-color 0.2s ease, width 0.2s ease, left 0.3s ease, top 0.3s ease'
  }
})

function setZIndex(newZIndex: number) {
  zIndex.value = newZIndex
}

function startTimer() {
  if (timerInterval) return
  timerInterval = setInterval(() => {
    if (isDragging.value || props.isSelected) return
    timeRemaining.value -= 100
    if (timeRemaining.value <= 0) {
      stopTimer()
      emit('expired', props.idea)
    }
  }, 100)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function resetTimer(newDuration?: number) {
  timeRemaining.value = newDuration ?? props.duration
}

function handleMouseDown(event: MouseEvent) {
  event.preventDefault()
  startDrag(event.clientX, event.clientY)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleTouchStart(event: TouchEvent) {
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  startDrag(touch.clientX, touch.clientY)
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

function startDrag(clientX: number, clientY: number) {
  isDragging.value = true
  hasDragged.value = false
  dragStartPos.value = { x: clientX, y: clientY }
  zIndex.value = 200
  originalPosition.value = { ...position.value }
  dragOffset.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y
  }
  emit('dragStart', props.idea)
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value) return
  updatePosition(event.clientX, event.clientY)
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value || event.touches.length !== 1) return
  event.preventDefault()
  const touch = event.touches[0]
  updatePosition(touch.clientX, touch.clientY)
}

function updatePosition(clientX: number, clientY: number) {
  const dx = Math.abs(clientX - dragStartPos.value.x)
  const dy = Math.abs(clientY - dragStartPos.value.y)
  if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
    hasDragged.value = true
  }
  position.value = {
    x: clientX - dragOffset.value.x,
    y: clientY - dragOffset.value.y
  }
}

function handleMouseUp(event: MouseEvent) {
  endDrag(event.clientX, event.clientY)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

function handleTouchEnd(event: TouchEvent) {
  const touch = event.changedTouches[0]
  endDrag(touch.clientX, touch.clientY)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

function endDrag(clientX: number, clientY: number) {
  if (!isDragging.value) return

  const wasClick = !hasDragged.value

  if (ideaRef.value) {
    ideaRef.value.style.pointerEvents = 'none'
    ideaRef.value.style.visibility = 'hidden'
  }

  const dropTarget = document.elementFromPoint(clientX, clientY)
  const cauldronPot = dropTarget?.closest('.cauldron-pot')

  if (ideaRef.value) {
    ideaRef.value.style.pointerEvents = ''
    ideaRef.value.style.visibility = ''
  }

  isDragging.value = false
  zIndex.value = 10 + props.index

  if (cauldronPot) {
    emit('dropped', props.idea, { clientX, clientY })
  } else {
    position.value = { ...originalPosition.value }
    if (wasClick) {
      emit('select', props.idea)
    }
  }

  emit('dragEnd')
}

function handleDoubleClick(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  emit('throw', props.idea)
}

function dissolve() {
  isDissolving.value = true
  setTimeout(() => {
    emit('dissolved', props.idea)
  }, 600)
}

function cleanup() {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

function updatePositionForViewport() {
  if (isDragging.value) return
  const viewport = { width: window.innerWidth, height: window.innerHeight }
  const arc = generateArcPosition(viewport, props.index, props.totalCards)
  arcPosition.value = arc
  position.value = { x: arc.x, y: arc.y }
  originalPosition.value = { ...position.value }
}

function handleResize() {
  updatePositionForViewport()
}

defineExpose({
  dissolve,
  setZIndex,
  resetTimer
})

watch(
  () => props.idea.id,
  () => {
    resetTimer()
  }
)

watch(
  () => props.totalCards,
  () => {
    updatePositionForViewport()
  }
)

onMounted(() => {
  updatePositionForViewport()
  const staggerOffset = props.index * 2000
  timeRemaining.value = props.duration + staggerOffset
  startTimer()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  cleanup()
  stopTimer()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.floating-idea {
  --parchment-bg: #f4e4bc;
  --parchment-bg-dark: #e8d4a8;
  --parchment-border: #c9b896;
  --parchment-text: #3d3225;
  --parchment-shadow: rgba(61, 50, 37, 0.3);

  position: absolute;
  width: 220px;
  padding: var(--space-4);
  background: 
    linear-gradient(135deg, 
      var(--parchment-bg) 0%, 
      var(--parchment-bg-dark) 50%, 
      var(--parchment-bg) 100%
    );
  border: none;
  box-shadow: 
    0 2px 8px var(--parchment-shadow),
    inset 0 0 20px rgba(201, 184, 150, 0.3);
  cursor: grab;
  user-select: none;
  pointer-events: auto;
  opacity: 0.85;
  clip-path: polygon(
    0% 2%, 3% 0%, 8% 1%, 15% 0%, 22% 2%, 30% 0%, 38% 1%, 45% 0%, 52% 2%, 60% 0%, 68% 1%, 75% 0%, 82% 2%, 90% 0%, 95% 1%, 100% 0%,
    100% 3%, 99% 10%, 100% 18%, 99% 25%, 100% 33%, 99% 40%, 100% 48%, 99% 55%, 100% 63%, 99% 70%, 100% 78%, 99% 85%, 100% 92%, 99% 100%,
    97% 100%, 90% 99%, 82% 100%, 75% 98%, 68% 100%, 60% 99%, 52% 100%, 45% 98%, 38% 100%, 30% 99%, 22% 100%, 15% 98%, 8% 100%, 3% 99%, 0% 100%,
    0% 97%, 1% 90%, 0% 82%, 1% 75%, 0% 68%, 1% 60%, 0% 52%, 1% 45%, 0% 38%, 1% 30%, 0% 22%, 1% 15%, 0% 8%, 1% 3%
  );
  transition:
    box-shadow var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out),
    opacity var(--duration-normal) var(--ease-out);
}

.floating-idea::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E");
  opacity: 0.08;
  pointer-events: none;
  mix-blend-mode: multiply;
}

.timer-ring {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  z-index: 2;
  opacity: 0.7;
}

.floating-idea:hover:not(.dragging) {
  opacity: 1;
  box-shadow: 
    0 6px 20px var(--parchment-shadow),
    inset 0 0 20px rgba(201, 184, 150, 0.4);
}

.floating-idea.dragging {
  cursor: grabbing;
  opacity: 1;
  box-shadow:
    0 12px 32px var(--parchment-shadow),
    0 0 16px var(--color-glow-purple),
    inset 0 0 20px rgba(201, 184, 150, 0.4);
}

.floating-idea.selected {
  width: 260px;
  opacity: 1;
  box-shadow: 
    0 6px 20px var(--parchment-shadow),
    0 0 8px var(--color-glow-amber),
    inset 0 0 20px rgba(201, 184, 150, 0.4);
}

.floating-idea.selected .idea-content {
  -webkit-line-clamp: unset;
  line-clamp: unset;
}

.floating-idea.dissolving {
  animation: dissolve 0.6s ease-out forwards;
  pointer-events: none;
}

@keyframes dissolve {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8) translateY(-20px);
  }
  100% {
    opacity: 0;
    transform: scale(0.3) translateY(-40px);
  }
}

.idea-content {
  position: relative;
  font-family: 'Satoshi', Georgia, serif;
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.6;
  color: var(--parchment-text);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  padding-right: var(--space-3);
  letter-spacing: 0.01em;
}
</style>
