<template>
  <div v-if="planSummary && planSummary.hasStructure" class="canvas-plan-progress">
    <div class="progress-header">
      <LayoutGrid :size="16" />
      <span>Canvas Plan</span>
    </div>

    <div v-if="planSummary.totalTasks > 0" class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${planSummary.progressPercent}%` }" />
      </div>
      <span class="progress-text"
        >{{ planSummary.completedTasks }}/{{ planSummary.totalTasks }} tasks</span
      >
    </div>

    <div v-if="planSummary.goalNodes.length > 0" class="goals-section">
      <div v-for="goal in planSummary.goalNodes" :key="goal.id" class="goal-item">
        <Target :size="14" />
        <span>{{ truncateText(goal.text, 50) }}</span>
      </div>
    </div>

    <div v-if="planSummary.taskNodes.length > 0" class="tasks-preview">
      <div
        v-for="task in visibleTasks"
        :key="task.id"
        class="task-item"
        :class="{ completed: task.completed }"
      >
        <CheckSquare v-if="task.completed" :size="14" class="task-icon completed" />
        <Square v-else :size="14" class="task-icon" />
        <span>{{ truncateText(task.text, 40) }}</span>
      </div>
      <p v-if="planSummary.taskNodes.length > 3" class="more-tasks">
        +{{ planSummary.taskNodes.length - 3 }} more tasks
      </p>
    </div>

    <button class="view-canvas-btn" @click="$emit('viewCanvas')">View full plan →</button>
  </div>
</template>

<script setup lang="ts">
import { LayoutGrid, Target, Square, CheckSquare } from 'lucide-vue-next'
import { computed } from 'vue'

interface PlanNode {
  id: string
  type: string
  text: string
  completed?: boolean
  coachOrigin?: boolean
}

interface PlanSummary {
  totalNodes: number
  taskNodes: PlanNode[]
  goalNodes: PlanNode[]
  completedTasks: number
  totalTasks: number
  progressPercent: number
  hasStructure: boolean
}

const props = defineProps<{
  planSummary: PlanSummary | null
}>()

defineEmits<{
  viewCanvas: []
}>()

const visibleTasks = computed(() => {
  if (!props.planSummary) return []
  return props.planSummary.taskNodes.slice(0, 3)
})

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
</script>

<style scoped>
.canvas-plan-progress {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.progress-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-cauldron);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-cauldron);
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}

.progress-text {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-cauldron);
  white-space: nowrap;
}

.goals-section {
  margin-bottom: var(--space-3);
}

.goal-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--color-text);
}

.goal-item svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.tasks-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text);
}

.task-item.completed {
  color: var(--color-text-secondary);
}

.task-item.completed span {
  text-decoration: line-through;
}

.task-icon {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.task-icon.completed {
  color: var(--color-success);
}

.more-tasks {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: var(--space-1) 0 0 var(--space-6);
}

.view-canvas-btn {
  width: 100%;
  padding: var(--space-2);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-cauldron);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.view-canvas-btn:hover {
  background: var(--color-primary-subtle);
  border-color: var(--color-cauldron);
}
</style>
