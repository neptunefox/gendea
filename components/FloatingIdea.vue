<template>
  <div
    class="floating-idea"
    :class="{ dragging: isDragging }"
    :style="positionStyle"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
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
}

const props = defineProps<Props>()
const emit = defineEmits<{
  dragStart: [idea: FloatingIdea]
  dragEnd: []
}>()

const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })

const positionStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`
}))

function getRandomEdgePosition() {
  const edge = Math.floor(Math.random() * 4)
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const margin = 100

  switch (edge) {
    case 0:
      return { x: Math.random() * (viewportWidth - 300), y: margin }
    case 1:
      return { x: viewportWidth - 250 - margin, y: Math.random() * (viewportHeight - 200) }
    case 2:
      return { x: Math.random() * (viewportWidth - 300), y: viewportHeight - 150 - margin }
    case 3:
      return { x: margin, y: Math.random() * (viewportHeight - 200) }
    default:
      return { x: margin, y: margin }
  }
}

function handleDragStart(event: DragEvent) {
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(props.idea))
  }
  emit('dragStart', props.idea)
}

function handleDragEnd() {
  isDragging.value = false
  emit('dragEnd')
}

onMounted(() => {
  position.value = getRandomEdgePosition()
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: grab;
  user-select: none;
  z-index: 10;
  transition: all 0.3s ease;
  animation:
    drift 8s ease-in-out infinite,
    gentle-rotate 12s ease-in-out infinite;
}

.floating-idea:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: #d4756f;
}

.floating-idea.dragging {
  opacity: 0.5;
  cursor: grabbing;
  animation: none;
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
    transform: translate(15px, -10px);
  }
  50% {
    transform: translate(-10px, 15px);
  }
  75% {
    transform: translate(10px, 10px);
  }
}

@keyframes gentle-rotate {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(2deg);
  }
}

.floating-idea:nth-child(2n) {
  animation:
    drift-alt 10s ease-in-out infinite,
    gentle-rotate-alt 14s ease-in-out infinite;
}

.floating-idea:nth-child(3n) {
  animation:
    drift-slow 12s ease-in-out infinite,
    gentle-rotate 16s ease-in-out infinite;
}

.floating-idea:nth-child(4n) {
  animation:
    drift 9s ease-in-out infinite reverse,
    gentle-rotate-alt 13s ease-in-out infinite;
}

.floating-idea:nth-child(5n) {
  animation:
    drift-alt 11s ease-in-out infinite reverse,
    gentle-rotate 15s ease-in-out infinite;
}

@keyframes drift-alt {
  0%,
  100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-12px, 15px);
  }
  50% {
    transform: translate(18px, -8px);
  }
  75% {
    transform: translate(-8px, -12px);
  }
}

@keyframes drift-slow {
  0%,
  100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(10px, 12px);
  }
  66% {
    transform: translate(-15px, -10px);
  }
}

@keyframes gentle-rotate-alt {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-2deg);
  }
}
</style>
