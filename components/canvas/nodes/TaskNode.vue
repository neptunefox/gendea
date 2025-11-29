<template>
  <div
    class="task-node"
    :class="[
      { selected: props.selected, completed: isCompleted, 'coach-origin': isCoachOrigin },
      animationClass,
      workflowClass
    ]"
    :style="animationStyle"
  >
    <Handle id="top" type="target" :position="Position.Top" class="handle handle-top" />
    <Handle id="right" type="source" :position="Position.Right" class="handle handle-right" />
    <Handle id="bottom" type="source" :position="Position.Bottom" class="handle handle-bottom" />
    <Handle id="left" type="target" :position="Position.Left" class="handle handle-left" />

    <div v-if="isCoachOrigin" class="coach-indicator">
      <Hammer :size="12" />
      <span>From Coach</span>
    </div>

    <div class="task-content">
      <button class="checkbox nodrag" @click="toggleComplete">
        <CheckSquare v-if="isCompleted" :size="20" class="check-icon completed" />
        <Square v-else :size="20" class="check-icon" />
      </button>

      <div class="task-text" :class="{ 'line-through': isCompleted }">
        {{ props.data.text || 'Untitled task' }}
      </div>
    </div>

    <div v-if="props.data.dueDate" class="task-due">
      <Calendar :size="12" />
      <span>{{ formatDate(props.data.dueDate) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, useVueFlow, type NodeProps } from '@vue-flow/core'
import { Square, CheckSquare, Calendar, Hammer } from 'lucide-vue-next'
import { computed, inject } from 'vue'

const props = defineProps<NodeProps>()
const { updateNode } = useVueFlow()

const isCompleted = computed(() => !!props.data.completed)
const isCoachOrigin = computed(() => !!props.data.coachOrigin)

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyle = computed(() => canvasAnimations?.getNodeAnimationStyle(props.id) || {})

const workflowHighlights = inject<any>('workflowHighlights')
const workflowClass = computed(
  () => workflowHighlights?.getNodeClass(props.id, props.type, props.data) || ''
)

async function toggleComplete() {
  try {
    const newCompleted = !isCompleted.value
    const response = await $fetch<{ node: { data: Record<string, unknown>; version: number } }>(
      `/api/canvas/nodes/${props.id}`,
      {
        method: 'PATCH',
        body: { data: { ...props.data, completed: newCompleted } }
      }
    )
    updateNode(props.id, { data: { ...response.node.data, version: response.node.version } })
  } catch (error) {
    console.error('Failed to toggle task:', error)
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.task-node {
  --node-accent: var(--color-text-tertiary);
  min-width: 200px;
  max-width: 280px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--node-accent);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-fast) var(--ease-out);
  will-change: transform, opacity;
}

.task-node:hover {
  box-shadow: var(--shadow-md);
}

.task-node.node-appearing {
  animation: nodeAppear 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.task-node.node-deleting {
  animation: nodeDelete 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.task-node.node-staggered {
  animation: nodeStagger 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes nodeAppear {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes nodeDelete {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}

@keyframes nodeStagger {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.task-node.selected {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.task-node.completed {
  --node-accent: var(--color-success);
}

.task-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.checkbox {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.check-icon {
  color: var(--color-text-tertiary);
  transition: color var(--duration-fast) var(--ease-out);
}

.check-icon.completed {
  color: var(--color-success);
}

.checkbox:hover .check-icon:not(.completed) {
  color: var(--color-primary);
}

.task-text {
  font-size: var(--text-base);
  color: var(--color-text);
  line-height: 1.4;
}

.task-text.line-through {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
}

.task-due {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.task-node.coach-origin {
  border-style: dashed;
  border-left-color: var(--color-primary);
}

.coach-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-primary);
}

.task-node.workflow-testing-highlight {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.task-node.workflow-blocked {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}

.task-node.workflow-incomplete {
  outline: 2px solid var(--color-warning);
  outline-offset: 2px;
}

.task-node.workflow-completed {
  outline: 2px solid var(--color-success);
  outline-offset: 2px;
}

.handle {
  width: 8px !important;
  height: 8px !important;
  background: var(--color-text-tertiary) !important;
  border: 2px solid var(--color-surface) !important;
  border-radius: 50% !important;
  opacity: 0;
  transition: all var(--duration-fast) var(--ease-out);
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

.task-node:hover .handle {
  opacity: 1;
}

.handle:hover {
  transform: scale(1.2);
  background: var(--color-primary) !important;
}

:deep(.vue-flow__handle-connecting),
:deep(.vue-flow__handle-valid) {
  opacity: 1 !important;
  background: var(--color-success) !important;
  transform: scale(1.2) !important;
}
</style>
