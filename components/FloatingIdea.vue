<template>
  <div
    ref="ideaRef"
    class="floating-idea"
    :class="{ dragging: isDragging, dissolving: isDissolving, urgent: isUrgent }"
    :style="positionStyle"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    <div class="timer-ring" :style="timerRingStyle" />
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
}

const props = withDefaults(defineProps<Props>(), {
  duration: 15000
})
const emit = defineEmits<{
  dragStart: [idea: FloatingIdea]
  dragEnd: []
  dissolved: [idea: FloatingIdea]
  dropped: [idea: FloatingIdea, event: { clientX: number; clientY: number }]
  expired: [idea: FloatingIdea]
}>()

const ideaRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isDissolving = ref(false)
const position = ref({ x: 0, y: 0 })
const originalPosition = ref({ x: 0, y: 0 })
const zIndex = ref(10 + props.index)
const dragOffset = ref({ x: 0, y: 0 })

const timeRemaining = ref(props.duration)
const URGENT_THRESHOLD = 5000
let timerInterval: NodeJS.Timeout | null = null

const isUrgent = computed(() => timeRemaining.value <= URGENT_THRESHOLD)
const timerProgress = computed(() => timeRemaining.value / props.duration)
const timerRingStyle = computed(() => ({
  background: `conic-gradient(
    ${isUrgent.value ? '#d4756f' : '#e8ddd8'} ${timerProgress.value * 360}deg,
    transparent ${timerProgress.value * 360}deg
  )`
}))

const positionStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: zIndex.value,
  transition: isDragging.value ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
}))

function setZIndex(newZIndex: number) {
  zIndex.value = newZIndex
}

function startTimer() {
  if (timerInterval) return
  timerInterval = setInterval(() => {
    if (isDragging.value) return
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
  }
  
  emit('dragEnd')
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

defineExpose({
  dissolve,
  setZIndex,
  resetTimer
})

watch(() => props.idea.id, () => {
  resetTimer()
})

onMounted(() => {
  const viewport = { width: window.innerWidth, height: window.innerHeight }
  position.value = generateShelfPosition(viewport, props.index)
  originalPosition.value = { ...position.value }
  const staggerOffset = props.index * 2000
  timeRemaining.value = props.duration + staggerOffset
  startTimer()
})

onUnmounted(() => {
  cleanup()
  stopTimer()
})
</script>

<style scoped>
.floating-idea {
  position: absolute;
  width: 200px;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%);
  border: 2px solid #f0e5e0;
  border-radius: 10px;
  box-shadow:
    0 2px 8px rgba(212, 117, 111, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04);
  cursor: grab;
  user-select: none;
  pointer-events: auto;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.timer-ring {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.floating-idea:hover .timer-ring {
  opacity: 0.8;
}

.floating-idea.urgent .timer-ring {
  opacity: 1;
  animation: pulse-urgent 1s ease-in-out infinite;
}

@keyframes pulse-urgent {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.floating-idea:hover {
  box-shadow:
    0 4px 12px rgba(212, 117, 111, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #d4756f;
  transform: translateY(-2px);
}

.floating-idea.dragging {
  cursor: grabbing;
  transform: scale(1.05);
  box-shadow:
    0 8px 24px rgba(212, 117, 111, 0.25),
    0 12px 32px rgba(0, 0, 0, 0.15);
  border-color: #d4756f;
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
  font-size: 0.875rem;
  line-height: 1.45;
  color: #40312b;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
