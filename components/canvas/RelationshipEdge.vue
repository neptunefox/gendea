<template>
  <BaseEdge :id="id" :path="path" :style="edgeStyle" :marker-end="markerEnd" />

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

  <EdgeLabelRenderer>
    <div
      v-if="showLabel && displayLabel"
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        pointerEvents: 'none'
      }"
      class="edge-label nodrag nopan"
    >
      {{ displayLabel }}
    </div>

    <div
      v-if="isEditing"
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        pointerEvents: 'all'
      }"
      class="edge-editor nodrag nopan"
      @click.stop
    >
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
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
      />
      <div class="edge-editor-actions">
        <button class="save-btn" @click="saveEdit">Save</button>
        <button class="cancel-btn" @click="cancelEdit">Cancel</button>
      </div>
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow, type EdgeProps } from '@vue-flow/core'
import { EDGE_STYLES, EDGE_RELATIONSHIP_LABELS, type EdgeRelationshipType } from '~/types/canvas'

const props = defineProps<EdgeProps>()

const { updateEdge, findEdge } = useVueFlow()

const showLabel = ref(false)
const isEditing = ref(false)
const editType = ref<EdgeRelationshipType>('relates-to')
const editLabel = ref('')

const edgeType = computed<EdgeRelationshipType>(() => {
  const type = props.data?.relationshipType || props.type
  return (type as EdgeRelationshipType) || 'relates-to'
})

const displayLabel = computed(() => {
  if (props.label) return props.label
  return EDGE_RELATIONSHIP_LABELS[edgeType.value]
})

const edgeStyle = computed(() => {
  const style = EDGE_STYLES[edgeType.value] || EDGE_STYLES['relates-to']
  return {
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
    strokeDasharray: style.strokeDasharray
  }
})

const markerEnd = computed(() => `url(#arrow-${edgeType.value})`)

const pathData = computed(() =>
  getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition
  })
)

const path = computed(() => pathData.value[0])
const labelX = computed(() => pathData.value[1])
const labelY = computed(() => pathData.value[2])

watch(
  () => props.data?.relationshipType,
  newType => {
    if (newType) {
      editType.value = newType as EdgeRelationshipType
    }
  },
  { immediate: true }
)

function handleEdgeClick() {
  isEditing.value = true
  editType.value = edgeType.value
  editLabel.value = (props.label as string) || ''
}

async function saveEdit() {
  try {
    await $fetch(`/api/canvas/edges/${props.id}`, {
      method: 'PATCH',
      body: {
        type: 'relationship',
        label: editLabel.value || null,
        style: {
          relationshipType: editType.value
        }
      }
    })

    const edge = findEdge(props.id)
    if (edge) {
      updateEdge(edge, {
        ...edge,
        label: editLabel.value || undefined,
        data: {
          ...edge.data,
          relationshipType: editType.value
        }
      })
    }

    isEditing.value = false
  } catch (error) {
    console.error('Failed to update edge:', error)
  }
}

function cancelEdit() {
  isEditing.value = false
  editType.value = edgeType.value
  editLabel.value = (props.label as string) || ''
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<style scoped>
.vue-flow__edge-interaction {
  cursor: pointer;
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

.edge-editor {
  background: white;
  border: 1px solid #d4756f;
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 180px;
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
