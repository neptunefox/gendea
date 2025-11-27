<template>
  <g>
    <path
      :id="id"
      :d="path"
      :style="edgeStyle"
      class="vue-flow__edge-path"
      :marker-end="markerEnd"
    />
    
    <path
      :d="path"
      class="vue-flow__edge-interaction"
      fill="none"
      stroke="transparent"
      stroke-width="20"
      @mouseenter="showLabel = true"
      @mouseleave="showLabel = false"
      @click="handleEdgeClick"
    />

    <foreignObject
      v-if="showLabel && label"
      :x="labelX - labelWidth / 2"
      :y="labelY - labelHeight / 2"
      :width="labelWidth"
      :height="labelHeight"
      class="edge-label-wrapper"
    >
      <div class="edge-label">
        {{ label }}
      </div>
    </foreignObject>

    <foreignObject
      v-if="isEditing"
      :x="labelX - 100"
      :y="labelY - 60"
      width="200"
      height="120"
      class="edge-editor-wrapper"
    >
      <div class="edge-editor" @click.stop>
        <select v-model="editType" class="edge-type-select">
          <option value="leads-to">Leads to</option>
          <option value="requires">Requires</option>
          <option value="blocks">Blocks</option>
          <option value="relates-to">Relates to</option>
        </select>
        <input
          v-model="editLabel"
          type="text"
          class="edge-label-input"
          placeholder="Label (optional)"
        />
        <div class="edge-editor-actions">
          <button @click="saveEdit" class="save-btn">Save</button>
          <button @click="cancelEdit" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </foreignObject>
  </g>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { EdgeProps, getBezierPath } from '@vue-flow/core'
import { EDGE_STYLES, type EdgeRelationshipType } from '~/types/canvas'

const props = defineProps<EdgeProps>()

const showLabel = ref(false)
const isEditing = ref(false)
const editType = ref<EdgeRelationshipType>((props.type as EdgeRelationshipType) || 'relates-to')
const editLabel = ref(props.label || '')

const labelWidth = 120
const labelHeight = 32

const edgeType = computed<EdgeRelationshipType>(() => (props.type as EdgeRelationshipType) || 'relates-to')

const edgeStyle = computed(() => {
  const style = EDGE_STYLES[edgeType.value] || EDGE_STYLES['relates-to']
  return {
    stroke: style.stroke,
    strokeWidth: `${style.strokeWidth}px`,
    strokeDasharray: style.strokeDasharray,
    fill: 'none'
  }
})

const markerEnd = computed(() => {
  return `url(#arrow-${edgeType.value})`
})

const [path, labelX, labelY] = getBezierPath({
  sourceX: props.sourceX,
  sourceY: props.sourceY,
  sourcePosition: props.sourcePosition,
  targetX: props.targetX,
  targetY: props.targetY,
  targetPosition: props.targetPosition
})

function handleEdgeClick() {
  isEditing.value = true
  editType.value = (props.type as EdgeRelationshipType) || 'relates-to'
  editLabel.value = props.label || ''
}

async function saveEdit() {
  try {
    await $fetch(`/api/canvas/edges/${props.id}`, {
      method: 'PATCH',
      body: {
        type: editType.value,
        label: editLabel.value || null
      }
    })
    
    isEditing.value = false
  } catch (error) {
    console.error('Failed to update edge:', error)
  }
}

function cancelEdit() {
  isEditing.value = false
  editType.value = (props.type as EdgeRelationshipType) || 'relates-to'
  editLabel.value = props.label || ''
}
</script>

<style scoped>
.vue-flow__edge-path {
  transition: stroke-width 0.2s ease;
}

.vue-flow__edge-interaction:hover + .vue-flow__edge-path {
  stroke-width: 4px !important;
}

.edge-label-wrapper {
  pointer-events: none;
}

.edge-label {
  background: white;
  border: 1px solid #f0e5e0;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #40312b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  text-align: center;
}

.edge-editor-wrapper {
  pointer-events: all;
}

.edge-editor {
  background: white;
  border: 1px solid #d4756f;
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edge-type-select,
.edge-label-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #f0e5e0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #40312b;
  background: white;
}

.edge-type-select:focus,
.edge-label-input:focus {
  outline: none;
  border-color: #d4756f;
}

.edge-editor-actions {
  display: flex;
  gap: 0.5rem;
}

.save-btn,
.cancel-btn {
  flex: 1;
  padding: 0.375rem;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background: #d4756f;
  color: white;
}

.save-btn:hover {
  background: #c26660;
}

.cancel-btn {
  background: #f0e5e0;
  color: #40312b;
}

.cancel-btn:hover {
  background: #e5d5d0;
}
</style>
