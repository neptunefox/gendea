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
      <span class="progress-text">{{ planSummary.completedTasks }}/{{ planSummary.totalTasks }} tasks</span>
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

    <button class="view-canvas-btn" @click="$emit('viewCanvas')">
      View full plan →
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LayoutGrid, Target, Square, CheckSquare } from 'lucide-vue-next'

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
  background: linear-gradient(135deg, #f5f0ff 0%, #efe8ff 100%);
  border: 1px solid rgba(147, 112, 219, 0.2);
  border-radius: 12px;
  padding: 1rem;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #7c5cbf;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(147, 112, 219, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #9370db, #7c5cbf);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #7c5cbf;
  white-space: nowrap;
}

.goals-section {
  margin-bottom: 0.75rem;
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #40312b;
}

.goal-item svg {
  color: #d4756f;
  flex-shrink: 0;
}

.tasks-preview {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #40312b;
}

.task-item.completed {
  color: #8a7566;
}

.task-item.completed span {
  text-decoration: line-through;
}

.task-icon {
  color: #b8a8a3;
  flex-shrink: 0;
}

.task-icon.completed {
  color: #8bc34a;
}

.more-tasks {
  font-size: 0.75rem;
  color: #8a7566;
  margin: 0.25rem 0 0 1.5rem;
}

.view-canvas-btn {
  width: 100%;
  padding: 0.625rem;
  background: transparent;
  border: 1px solid rgba(147, 112, 219, 0.3);
  border-radius: 8px;
  color: #7c5cbf;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-canvas-btn:hover {
  background: rgba(147, 112, 219, 0.1);
  border-color: #7c5cbf;
}
</style>
