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

import { generateShelfPosition } from '~/utils/floating-position'

interface FloatingIdea {
  id: string
  text: string
  source: 'saved' | 'spark'
}

interface Props {
  idea: FloatingIdea
  index: number
  duration?: number
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  duration: 15000,
  isSelected: false
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
const isLeftSide = computed(() => props.index < 3)
const computedZIndex = computed(() => {
  if (isDragging.value) return 200
  if (props.isSelected) return 100
  return zIndex.value
})

const SELECTED_WIDTH = 280
const DEFAULT_WIDTH = 200

const positionStyle = computed(() => {
  let leftPos = position.value.x
  if (props.isSelected && isLeftSide.value) {
    leftPos = position.value.x - (SELECTED_WIDTH - DEFAULT_WIDTH)
  }
  return {
    left: `${leftPos}px`,
    top: `${position.value.y}px`,
    zIndex: computedZIndex.value,
    transition: isDragging.value
      ? 'none'
      : 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, width 0.2s ease, left 0.2s ease'
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
  position.value = generateShelfPosition(viewport, props.index)
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
  position: absolute;
  width: 200px;
  padding: var(--space-4);
  background: linear-gradient(160deg, var(--color-surface) 0%, var(--color-surface-raised) 100%);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(232, 228, 224, 0.04);
  cursor: grab;
  user-select: none;
  pointer-events: auto;
  transition:
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out),
    opacity var(--duration-normal) var(--ease-out);
}

.floating-idea::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid var(--color-border);
  border-radius: calc(var(--radius-md) - 2px);
  pointer-events: none;
  opacity: 0.4;
}

.timer-ring {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  z-index: 2;
}

.floating-idea:hover {
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.4),
    0 0 15px var(--color-glow-amber);
  border-color: var(--color-primary);
  transform: translateY(-3px);
}

.floating-idea.dragging {
  cursor: grabbing;
  transform: scale(1.05) rotate(2deg);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 20px var(--color-glow-amber);
  border-color: var(--color-primary);
}

.floating-idea.selected {
  width: 280px;
  border-color: var(--color-primary);
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.4),
    0 0 20px var(--color-glow-amber);
  transform: scale(1.02);
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
  font-size: var(--text-sm);
  line-height: 1.45;
  color: var(--color-text);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  padding-right: var(--space-4);
}
</style>
