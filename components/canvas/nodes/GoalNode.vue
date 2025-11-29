<template>
  <div
    class="goal-node"
    :class="[
      { selected: props.selected, achieved: isAchieved, 'coach-origin': isCoachOrigin },
      animationClass,
      workflowClass
    ]"
    :style="animationStyle"
  >
    <Handle id="top" type="target" :position="Position.Top" class="handle handle-top" />
    <Handle id="right" type="source" :position="Position.Right" class="handle handle-right" />
    <Handle id="bottom" type="source" :position="Position.Bottom" class="handle handle-bottom" />
    <Handle id="left" type="target" :position="Position.Left" class="handle handle-left" />

    <div class="goal-header">
      <Target :size="20" class="goal-icon" />
      <span class="goal-label">Goal</span>
      <span v-if="isCoachOrigin" class="coach-badge" title="From Coach">
        <Hammer :size="12" />
      </span>
      <button v-if="!isAchieved" class="achieve-btn nodrag" @click="markAchieved">
        <Check :size="14" />
      </button>
    </div>

    <div class="goal-text">
      {{ props.data.text || 'Set your goal' }}
    </div>

    <div v-if="props.data.metric" class="goal-metric">
      <TrendingUp :size="14" />
      <span>{{ props.data.metric }}</span>
    </div>

    <div v-if="isAchieved" class="achieved-badge">
      <Trophy :size="14" />
      <span>Achieved!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Target, Check, TrendingUp, Trophy, Hammer } from 'lucide-vue-next'
import { computed, inject } from 'vue'

const props = defineProps<NodeProps>()

const isAchieved = computed(() => !!props.data.achieved)
const isCoachOrigin = computed(() => !!props.data.coachOrigin)

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyle = computed(() => canvasAnimations?.getNodeAnimationStyle(props.id) || {})

const workflowHighlights = inject<any>('workflowHighlights')
const workflowClass = computed(
  () => workflowHighlights?.getNodeClass(props.id, props.type, props.data) || ''
)

async function markAchieved() {
  try {
    await $fetch(`/api/canvas/nodes/${props.id}`, {
      method: 'PATCH',
      body: { data: { ...props.data, achieved: true, achievedAt: new Date().toISOString() } }
    })
  } catch (error) {
    console.error('Failed to mark goal as achieved:', error)
  }
}
</script>

<style scoped>
.goal-node {
  --node-accent: var(--color-success);
  min-width: 220px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--node-accent);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-fast) var(--ease-out);
  will-change: transform, opacity;
}

.goal-node:hover {
  box-shadow: var(--shadow-md);
}

.goal-node.node-appearing {
  animation: nodeAppear 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.goal-node.node-deleting {
  animation: nodeDelete 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.goal-node.node-staggered {
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

.goal-node.selected {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.goal-node.achieved {
  --node-accent: #f59e0b;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.goal-icon {
  color: var(--node-accent);
}

.goal-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--node-accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}

.achieve-btn {
  padding: var(--space-1);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
  opacity: 0;
}

.goal-node:hover .achieve-btn {
  opacity: 1;
}

.achieve-btn:hover {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.coach-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
}

.goal-node.coach-origin {
  border-style: dashed;
  border-left-color: var(--color-primary);
}

.goal-node.coach-origin .goal-icon,
.goal-node.coach-origin .goal-label {
  color: var(--color-primary);
}

.goal-text {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  line-height: 1.4;
}

.goal-metric {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.achieved-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding: var(--space-2);
  background: rgba(245, 158, 11, 0.1);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: #f59e0b;
}

.goal-node.workflow-testing-highlight {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.goal-node.workflow-blocked {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}

.goal-node.workflow-incomplete {
  outline: 2px solid var(--color-warning);
  outline-offset: 2px;
}

.goal-node.workflow-completed {
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

.goal-node:hover .handle {
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
