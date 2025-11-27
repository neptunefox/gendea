<template>
  <div class="goal-node" :class="{ selected: props.selected, achieved: isAchieved, 'coach-origin': isCoachOrigin }">
    <Handle type="target" :position="Position.Top" />
    
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

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Target, Check, TrendingUp, Trophy, Hammer } from 'lucide-vue-next'

const props = defineProps<NodeProps>()

const isAchieved = computed(() => !!props.data.achieved)
const isCoachOrigin = computed(() => !!props.data.coachOrigin)

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
  min-width: 220px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 2px solid #66bb6a;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.2);
  transition: all 0.2s ease;
}

.goal-node:hover {
  box-shadow: 0 4px 16px rgba(102, 187, 106, 0.3);
}

.goal-node.selected {
  outline: 2px solid #66bb6a;
  outline-offset: 2px;
}

.goal-node.achieved {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  border-color: #ffc107;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.goal-icon {
  color: #43a047;
}

.goal-node.achieved .goal-icon {
  color: #ffc107;
}

.goal-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #43a047;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}

.goal-node.achieved .goal-label {
  color: #f57c00;
}

.achieve-btn {
  padding: 0.375rem;
  background: white;
  border: 1px solid #66bb6a;
  border-radius: 6px;
  color: #66bb6a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}

.goal-node:hover .achieve-btn {
  opacity: 1;
}

.achieve-btn:hover {
  background: #66bb6a;
  color: white;
}

.coach-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: rgba(212, 117, 111, 0.15);
  border-radius: 4px;
  color: #d4756f;
}

.goal-node.coach-origin {
  border-style: dashed;
  border-color: #d4756f;
  background: linear-gradient(135deg, #fff5f0 0%, #e8f5e9 100%);
}

.goal-node.coach-origin .goal-icon {
  color: #d4756f;
}

.goal-node.coach-origin .goal-label {
  color: #d4756f;
}

.goal-text {
  font-size: 1rem;
  font-weight: 600;
  color: #40312b;
  line-height: 1.4;
}

.goal-metric {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(102, 187, 106, 0.3);
  font-size: 0.8125rem;
  color: #43a047;
}

.achieved-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #f57c00;
}
</style>
