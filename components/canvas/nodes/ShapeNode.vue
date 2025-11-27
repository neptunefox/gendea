<template>
  <div
    class="shape-node"
    :class="[shapeClass, { selected: props.selected }, animationClass]"
    :style="shapeStyle"
  >
    <Handle id="top" type="target" :position="Position.Top" class="handle handle-top" />
    <Handle id="right" type="source" :position="Position.Right" class="handle handle-right" />
    <Handle id="bottom" type="source" :position="Position.Bottom" class="handle handle-bottom" />
    <Handle id="left" type="target" :position="Position.Left" class="handle handle-left" />

    <div class="shape-content">
      <span v-if="props.data.label" class="shape-label">{{ props.data.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { computed, inject } from 'vue'

const props = defineProps<NodeProps>()

type ShapeType = 'rectangle' | 'circle' | 'arrow'

const shapeType = computed<ShapeType>(() => props.data.shape || 'rectangle')

const shapeClass = computed(() => `shape-${shapeType.value}`)

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyleFromComposable = computed(
  () => canvasAnimations?.getNodeAnimationStyle(props.id) || {}
)

const shapeStyle = computed(() => ({
  backgroundColor: props.data.fill || '#f0e5e0',
  borderColor: props.data.stroke || '#d4756f',
  width: props.data.width ? `${props.data.width}px` : undefined,
  height: props.data.height ? `${props.data.height}px` : undefined,
  ...animationStyleFromComposable.value
}))
</script>

<style scoped>
.shape-node {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  transition: box-shadow 0.15s ease;
  will-change: transform, opacity;
}

.shape-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.shape-node.node-appearing {
  animation: nodeAppear 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.shape-node.node-deleting {
  animation: nodeDelete 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.shape-node.node-staggered {
  animation: nodeStagger 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes nodeAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes nodeDelete {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes nodeStagger {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.shape-node.selected {
  outline: 2px solid #d4756f;
  outline-offset: 2px;
}

.shape-rectangle {
  min-width: 120px;
  min-height: 60px;
  border-radius: 8px;
  padding: 0.75rem;
}

.shape-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.shape-arrow {
  width: 60px;
  height: 40px;
  background: transparent !important;
  border: none !important;
  position: relative;
}

.shape-arrow::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 4px;
  background: #d4756f;
}

.shape-arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border: 8px solid transparent;
  border-left: 12px solid #d4756f;
}

.shape-content {
  text-align: center;
}

.shape-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #40312b;
}

.handle {
  width: 8px !important;
  height: 8px !important;
  background: #d4756f !important;
  border: 2px solid white !important;
  border-radius: 50% !important;
  opacity: 0;
  transition: all 0.2s ease;
  cursor: crosshair;
}

.handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.shape-node:hover .handle {
  opacity: 1;
}

.handle:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.25);
}

:deep(.vue-flow__handle-connecting),
:deep(.vue-flow__handle-valid) {
  opacity: 1 !important;
  background: #66bb6a !important;
  box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.3) !important;
  transform: scale(1.2) !important;
}
</style>
