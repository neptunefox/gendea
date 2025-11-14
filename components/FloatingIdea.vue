<template>
  <div
    class="floating-idea"
    :class="{ dragging: isDragging, dissolving: isDissolving }"
    :style="{ ...positionStyle, zIndex: zIndex }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @mouseenter="bringToFront"
    @click="handleClick"
  >
    <div class="idea-content">
      {{ idea.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface FloatingIdea {
  id: string
  text: string
  source: 'saved' | 'spark'
}

interface Props {
  idea: FloatingIdea
  index: number
  existingPositions: Array<{ x: number; y: number; width: number; height: number }>
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
const position = ref({ x: 0, y: 0 })
const zIndex = ref(10 + props.index)
const dragStartTime = ref(0)

const positionStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`
}))

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

function checkOverlap(
  x: number,
  y: number,
  width: number,
  height: number,
  existing: Array<{ x: number; y: number; width: number; height: number }>
): boolean {
  const padding = 40

  for (const pos of existing) {
    if (
      x < pos.x + pos.width + padding &&
      x + width + padding > pos.x &&
      y < pos.y + pos.height + padding &&
      y + height + padding > pos.y
    ) {
      return true
    }
  }
  return false
}

function getRandomEdgePosition() {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const cardWidth = 250
  const cardHeight = 150

  const centerX = viewportWidth / 2
  const centerY = viewportHeight / 2
  const cauldronRadius = 350
  const minDistanceFromCauldron = cauldronRadius + 100

  const navHeight = 120
  const bottomInputHeight = 200
  const sideMargin = 30

  let x = 0
  let y = 0
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    const baseAngle = props.index * (360 / 10)
    const randomOffset = (Math.random() - 0.5) * 30
    const angle = (baseAngle + randomOffset) * (Math.PI / 180)
    const distance = minDistanceFromCauldron + props.index * 20 + Math.random() * 80

    x = centerX + Math.cos(angle) * distance - cardWidth / 2
    y = centerY + Math.sin(angle) * distance - cardHeight / 2

    x = Math.max(sideMargin, Math.min(x, viewportWidth - cardWidth - sideMargin))
    y = Math.max(navHeight, Math.min(y, viewportHeight - cardHeight - bottomInputHeight))

    const inputAreaTop = viewportHeight - bottomInputHeight
    const inputAreaBottom = viewportHeight
    const inputAreaLeft = centerX - 300
    const inputAreaRight = centerX + 300

    if (
      x + cardWidth > inputAreaLeft &&
      x < inputAreaRight &&
      y + cardHeight > inputAreaTop &&
      y < inputAreaBottom
    ) {
      attempts++
      continue
    }

    const finalDistanceFromCenter = Math.sqrt(
      Math.pow(x + cardWidth / 2 - centerX, 2) + Math.pow(y + cardHeight / 2 - centerY, 2)
    )

    if (finalDistanceFromCenter < minDistanceFromCauldron) {
      attempts++
      continue
    }

    if (!checkOverlap(x, y, cardWidth, cardHeight, props.existingPositions)) {
      return { x, y }
    }

    attempts++
  }

  const fallbackAngle = (props.index * (360 / 10) + 180) * (Math.PI / 180)
  const fallbackDistance = minDistanceFromCauldron + props.index * 30 + 100
  x = centerX + Math.cos(fallbackAngle) * fallbackDistance - cardWidth / 2
  y = centerY + Math.sin(fallbackAngle) * fallbackDistance - cardHeight / 2

  x = Math.max(sideMargin, Math.min(x, viewportWidth - cardWidth - sideMargin))
  y = Math.max(navHeight, Math.min(y, viewportHeight - cardHeight - bottomInputHeight))

  return { x, y }
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
  position.value = getRandomEdgePosition()
  emit('positionSet', { x: position.value.x, y: position.value.y, width: 250, height: 150 })
})
</script>

<style scoped>
.floating-idea {
  position: fixed;
  width: 220px;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%);
  border: 2px solid #f0e5e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.1);
  cursor: pointer;
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
