<template>
  <div v-if="suggestion" class="ai-suggestion-panel">
    <div class="suggestion-header">
      <Lightbulb :size="16" class="suggestion-icon" />
      <span>AI Suggestion</span>
      <button class="dismiss-btn" @click="handleDismiss" title="Dismiss">
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 117, 111, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  z-index: 50;
  animation: slideUp 0.2s ease;
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
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0e5e0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #40312b;
}

.suggestion-icon {
  color: #d4756f;
}

.dismiss-btn {
  margin-left: auto;
  padding: 0.25rem;
  background: none;
  border: none;
  color: #8b7a75;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.dismiss-btn:hover {
  background: rgba(212, 117, 111, 0.1);
  color: #d4756f;
}

.suggestion-content {
  padding: 0.75rem 1rem;
}

.suggestion-text {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  color: #40312b;
  line-height: 1.5;
}

.clusters-info,
.steps-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.cluster-item {
  display: flex;
  justify-content: space-between;
  padding: 0.375rem 0.5rem;
  background: rgba(212, 117, 111, 0.08);
  border-radius: 4px;
  font-size: 0.75rem;
}

.cluster-theme {
  color: #40312b;
  font-weight: 500;
}

.cluster-count {
  color: #8b7a75;
}

.step-item {
  padding: 0.375rem 0.5rem;
  background: rgba(212, 117, 111, 0.08);
  border-radius: 4px;
  font-size: 0.75rem;
  color: #40312b;
}

.suggestion-actions {
  padding: 0.75rem 1rem;
  border-top: 1px solid #f0e5e0;
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #d4756f 0%, #c26660 100%);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  box-shadow: 0 2px 8px rgba(212, 117, 111, 0.3);
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
