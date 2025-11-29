<template>
  <div v-if="suggestion" class="ai-suggestion-panel">
    <div class="suggestion-header">
      <Lightbulb :size="16" class="suggestion-icon" />
      <span>AI Suggestion</span>
      <button class="dismiss-btn" title="Dismiss" @click="handleDismiss">
        <X :size="14" />
      </button>
    </div>

    <div class="suggestion-content">
      <p class="suggestion-text">{{ suggestion.message }}</p>

      <div v-if="suggestion.type === 'clusters' && suggestion.clusters" class="clusters-info">
        <div v-for="(cluster, idx) in suggestion.clusters" :key="idx" class="cluster-item">
          <span class="cluster-theme">{{ cluster.theme }}</span>
          <span class="cluster-count">{{ cluster.nodeIds.length }} nodes</span>
        </div>
      </div>

      <div v-if="suggestion.type === 'intermediate' && suggestion.steps" class="steps-info">
        <div v-for="(step, idx) in suggestion.steps" :key="idx" class="step-item">
          {{ idx + 1 }}. {{ step }}
        </div>
      </div>
    </div>

    <div class="suggestion-actions">
      <button
        v-if="suggestion.action"
        class="action-btn primary"
        :disabled="isApplying"
        @click="handleApply"
      >
        <Loader2 v-if="props.isApplying" :size="14" class="spin" />
        <span>{{ suggestion.actionLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lightbulb, X, Loader2 } from 'lucide-vue-next'

interface Suggestion {
  type: 'clusters' | 'intermediate' | 'incomplete'
  message: string
  action?: string
  actionLabel?: string
  clusters?: Array<{ nodeIds: string[]; theme: string }>
  steps?: string[]
  nodeId?: string
}

const props = defineProps<{
  suggestion: Suggestion | null
  projectId: string
  isApplying?: boolean
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
  (e: 'apply', action: string): void
}>()

function handleDismiss() {
  emit('dismiss')
}

function handleApply() {
  if (!props.suggestion?.action || props.isApplying) return
  emit('apply', props.suggestion.action)
}
</script>

<style scoped>
.ai-suggestion-panel {
  position: fixed;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 50;
  animation: slideUp 0.2s var(--ease-out);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.suggestion-icon {
  color: var(--color-primary);
}

.dismiss-btn {
  margin-left: auto;
  padding: var(--space-1);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.dismiss-btn:hover {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.suggestion-content {
  padding: var(--space-3) var(--space-4);
}

.suggestion-text {
  margin: 0 0 var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.5;
}

.clusters-info,
.steps-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.cluster-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.cluster-theme {
  color: var(--color-text);
  font-weight: var(--weight-medium);
}

.cluster-count {
  color: var(--color-text-secondary);
}

.step-item {
  padding: var(--space-2);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-text);
}

.suggestion-actions {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border);
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.action-btn.primary {
  background: var(--color-primary);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
