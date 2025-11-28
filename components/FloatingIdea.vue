<template>
  <div
    class="floating-idea"
    :class="{ dragging: isDragging, dissolving: isDissolving }"
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

import { generateShelfPosition } from '~/utils/floating-position'

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
  dissolved: [idea: FloatingIdea]
}>()

const isDragging = ref(false)
const isDissolving = ref(false)
const position = ref({ x: 0, y: 0 })
const zIndex = ref(10 + props.index)

const positionStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: zIndex.value
}))

function setZIndex(newZIndex: number) {
  zIndex.value = newZIndex
}

function handleDragStart(event: DragEvent) {
  isDragging.value = true
  zIndex.value = 200
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(props.idea))
  }
  emit('dragStart', props.idea)
}

function handleDragEnd() {
  isDragging.value = false
  zIndex.value = 10 + props.index
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
  const viewport = { width: window.innerWidth, height: window.innerHeight }
  position.value = generateShelfPosition(viewport, props.index)
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

.floating-idea:hover {
  box-shadow:
    0 4px 12px rgba(212, 117, 111, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #d4756f;
  transform: translateY(-2px);
}

.floating-idea.dragging {
  opacity: 0.5;
  cursor: grabbing;
  transform: scale(0.95);
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
