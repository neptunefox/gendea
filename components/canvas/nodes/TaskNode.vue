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
    <Handle type="target" :position="Position.Top" />

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

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Square, CheckSquare, Calendar, Hammer } from 'lucide-vue-next'
import { computed, inject } from 'vue'

const props = defineProps<NodeProps>()

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
    await $fetch(`/api/canvas/nodes/${props.id}`, {
      method: 'PATCH',
      body: { data: { ...props.data, completed: !isCompleted.value } }
    })
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
  min-width: 200px;
  background: white;
  border: 2px solid #f0e5e0;
  border-radius: 10px;
  padding: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease;
  will-change: transform, opacity;
}

.task-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #d4756f;
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

.task-node.selected {
  outline: 2px solid #d4756f;
  outline-offset: 2px;
}

.task-node.completed {
  background: #f8fef5;
  border-color: #c8e6c9;
}

.task-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.checkbox {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.check-icon {
  color: #b8a8a3;
  transition: color 0.2s ease;
}

.check-icon.completed {
  color: #8bc34a;
}

.checkbox:hover .check-icon:not(.completed) {
  color: #d4756f;
}

.task-text {
  font-size: 0.9375rem;
  color: #40312b;
  line-height: 1.4;
}

.task-text.line-through {
  text-decoration: line-through;
  color: #b8a8a3;
}

.task-due {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0e5e0;
  font-size: 0.75rem;
  color: #8b7a75;
}

.task-node.coach-origin {
  border-style: dashed;
  border-color: #d4756f;
  background: linear-gradient(135deg, #fff5f0 0%, #ffffff 100%);
}

.coach-indicator {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(212, 117, 111, 0.1);
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #d4756f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-node.workflow-testing-highlight {
  border-color: #2196f3;
  box-shadow:
    0 0 0 3px rgba(33, 150, 243, 0.2),
    0 4px 12px rgba(33, 150, 243, 0.15);
  animation: testingPulse 2s ease-in-out infinite;
}

.task-node.workflow-blocked {
  border-color: #c26660;
  background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
  box-shadow: 0 0 0 2px rgba(194, 102, 96, 0.3);
}

.task-node.workflow-incomplete {
  border-color: #ff9800;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
}

.task-node.workflow-completed {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.task-node.workflow-completed::after {
  content: '✓';
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

@keyframes testingPulse {
  0%,
  100% {
    box-shadow:
      0 0 0 3px rgba(33, 150, 243, 0.2),
      0 4px 12px rgba(33, 150, 243, 0.15);
  }
  50% {
    box-shadow:
      0 0 0 6px rgba(33, 150, 243, 0.1),
      0 4px 16px rgba(33, 150, 243, 0.25);
  }
}
</style>
