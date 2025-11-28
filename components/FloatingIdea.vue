<template>
  <div
    class="floating-idea"
    :class="{ dragging: isDragging, dissolving: isDissolving, repositioning: isRepositioning }"
    :style="{ ...positionStyle, zIndex: zIndex }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @mousedown="handleMouseDown"
    @mouseenter="bringToFront"
    @click="handleClick"
  >
    <div class="idea-content">
      {{ idea.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { generateSafePosition, type CardBounds } from '~/utils/floating-position'

interface FloatingIdea {
  id: string
  text: string
  source: 'saved' | 'spark'
}

interface Props {
  idea: FloatingIdea
  index: number
  existingPositions: CardBounds[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  dragStart: [idea: FloatingIdea]
  dragEnd: []
  dissolved: [idea: FloatingIdea]
  positionSet: [position: { x: number; y: number; width: number; height: number }]
  bringToTop: [ideaId: string]
}>()

const isDragging = ref(false)
const isDissolving = ref(false)
const position = ref({ x: 0, y: 0, side: 'left' as 'left' | 'right' })
const zIndex = ref(10 + props.index)
const dragStartTime = ref(0)
const isRepositioning = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const positionStyle = computed(() => {
  if (position.value.side === 'right') {
    return {
      right: `${position.value.x}px`,
      top: `${position.value.y}px`,
      left: 'auto'
    }
  }
  return {
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    right: 'auto'
  }
})

function bringToFront() {
  zIndex.value = 100
}

function handleClick(event: MouseEvent) {
  const timeSinceDragStart = Date.now() - dragStartTime.value
  if (timeSinceDragStart < 200 && isDragging.value) {
    event.preventDefault()
    return
  }
  emit('bringToTop', props.idea.id)
}

function setZIndex(newZIndex: number) {
  zIndex.value = newZIndex
}

function handleDragStart(event: DragEvent) {
  isDragging.value = true
  dragStartTime.value = Date.now()
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(props.idea))
  }
  emit('dragStart', props.idea)
}

function handleDragEnd() {
  setTimeout(() => {
    isDragging.value = false
  }, 100)
  emit('dragEnd')
}

function handleMouseDown(event: MouseEvent) {
  if (event.button !== 0) return
  
  isRepositioning.value = true
  zIndex.value = 200
  
  dragOffset.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y
  }
  
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(event: MouseEvent) {
  if (!isRepositioning.value) return
  
  const newX = event.clientX - dragOffset.value.x
  const newY = event.clientY - dragOffset.value.y
  
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const cardWidth = 220
  const cardHeight = 100
  
  position.value = {
    x: Math.max(0, Math.min(newX, viewportWidth - cardWidth)),
    y: Math.max(0, Math.min(newY, viewportHeight - cardHeight)),
    side: 'left'
  }
}

function handleMouseUp() {
  if (!isRepositioning.value) return
  
  isRepositioning.value = false
  
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  
  emit('positionSet', { x: position.value.x, y: position.value.y, width: 220, height: 100 })
}

function dissolve() {
  isDissolving.value = true
  setTimeout(() => {
    emit('dissolved', props.idea)
  }, 600)
}

defineExpose({
  dissolve,
  setZIndex
})

onMounted(() => {
  const viewport = { width: window.innerWidth, height: window.innerHeight }
  const pos = generateSafePosition(viewport, props.existingPositions, { cardIndex: props.index })
  position.value = { x: pos.x, y: pos.y, side: pos.side }
  emit('positionSet', { x: pos.x, y: pos.y, width: 220, height: 100 })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.floating-idea {
  position: absolute;
  width: 220px;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%);
  border: 2px solid #f0e5e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.1);
  cursor: grab;
  user-select: none;
  pointer-events: auto;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
  animation:
    drift 10s ease-in-out infinite,
    gentle-rotate 15s ease-in-out infinite;
  will-change: transform;
}

.floating-idea:hover {
  box-shadow: 0 6px 16px rgba(212, 117, 111, 0.2);
  border-color: #d4756f;
  transform: translateY(-2px);
  animation-play-state: paused;
}

.floating-idea.dragging {
  opacity: 0.5;
  cursor: grabbing;
  animation: none;
}

.floating-idea.repositioning {
  cursor: grabbing;
  transform: scale(1.03);
  box-shadow: 0 12px 28px rgba(212, 117, 111, 0.25);
  animation: none;
}

.floating-idea:active:not(.dragging):not(.dissolving) {
  transform: scale(0.98);
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
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #40312b;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

@keyframes drift {
  0%,
  100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(10px, -8px);
  }
  50% {
    transform: translate(-8px, 12px);
  }
  75% {
    transform: translate(8px, 8px);
  }
}

@keyframes gentle-rotate {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(1.5deg);
  }
}

.floating-idea:nth-child(2n) {
  animation:
    drift-alt 12s ease-in-out infinite,
    gentle-rotate-alt 16s ease-in-out infinite;
}

.floating-idea:nth-child(3n) {
  animation:
    drift-slow 14s ease-in-out infinite,
    gentle-rotate 18s ease-in-out infinite;
}

.floating-idea:nth-child(4n) {
  animation:
    drift 11s ease-in-out infinite reverse,
    gentle-rotate-alt 15s ease-in-out infinite;
}

.floating-idea:nth-child(5n) {
  animation:
    drift-alt 13s ease-in-out infinite reverse,
    gentle-rotate 17s ease-in-out infinite;
}

@keyframes drift-alt {
  0%,
  100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-10px, 12px);
  }
  50% {
    transform: translate(14px, -6px);
  }
  75% {
    transform: translate(-6px, -10px);
  }
}

@keyframes drift-slow {
  0%,
  100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(8px, 10px);
  }
  66% {
    transform: translate(-12px, -8px);
  }
}

@keyframes gentle-rotate-alt {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-1.5deg);
  }
}
</style>
