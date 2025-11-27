<template>
  <div
    class="shape-node"
    :class="[shapeClass, { selected: props.selected }]"
    :style="shapeStyle"
  >
    <Handle v-if="shapeType !== 'arrow'" type="target" :position="Position.Top" />
    <Handle v-if="shapeType === 'arrow'" type="target" :position="Position.Left" />
    
    <div class="shape-content">
      <span v-if="props.data.label" class="shape-label">{{ props.data.label }}</span>
    </div>

    <Handle v-if="shapeType !== 'arrow'" type="source" :position="Position.Bottom" />
    <Handle v-if="shapeType === 'arrow'" type="source" :position="Position.Right" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()

type ShapeType = 'rectangle' | 'circle' | 'arrow'

const shapeType = computed<ShapeType>(() => props.data.shape || 'rectangle')

const shapeClass = computed(() => `shape-${shapeType.value}`)

const shapeStyle = computed(() => ({
  backgroundColor: props.data.fill || '#f0e5e0',
  borderColor: props.data.stroke || '#d4756f',
  width: props.data.width ? `${props.data.width}px` : undefined,
  height: props.data.height ? `${props.data.height}px` : undefined
}))
</script>

<style scoped>
.shape-node {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.shape-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
</style>
