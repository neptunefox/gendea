<template>
  <div class="task-node" :class="{ selected: props.selected, completed: isCompleted }">
    <Handle type="target" :position="Position.Top" />
    
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
import { computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Square, CheckSquare, Calendar } from 'lucide-vue-next'

const props = defineProps<NodeProps>()

const isCompleted = computed(() => !!props.data.completed)

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
  transition: all 0.2s ease;
}

.task-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #d4756f;
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
</style>
