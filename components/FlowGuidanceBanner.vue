<template>
  <transition name="slide-banner">
    <div v-if="isVisible && suggestion" class="flow-guidance-banner">
      <div class="banner-icon">
        <Sparkles v-if="suggestion.icon === 'cauldron'" :size="18" />
        <Hammer v-else-if="suggestion.icon === 'build'" :size="18" />
        <LayoutGrid v-else-if="suggestion.icon === 'canvas'" :size="18" />
        <Target v-else-if="suggestion.icon === 'coach'" :size="18" />
      </div>
      <p class="banner-message">{{ suggestion.message }}</p>
      <div class="banner-actions">
        <button class="action-btn" @click="handleAction">
          {{ suggestion.action }}
          <ArrowRight :size="16" />
        </button>
        <button class="dismiss-btn" title="Dismiss" @click="$emit('dismiss')">
          <X :size="16" />
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { Sparkles, Hammer, LayoutGrid, Target, ArrowRight, X } from 'lucide-vue-next'

import type { FlowSuggestion } from '~/composables/useFlowGuidance'

interface Props {
  suggestion: FlowSuggestion | null
  isVisible: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  dismiss: []
  action: [suggestion: FlowSuggestion]
}>()

function handleAction() {
  emit('action', {} as FlowSuggestion)
}
</script>

<style scoped>
.flow-guidance-banner {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(8px);
}

.banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-primary-subtle);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  flex-shrink: 0;
}

.banner-message {
  flex: 1;
  margin: 0;
  font-size: var(--text-base);
  color: var(--color-text);
  line-height: 1.4;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.action-btn:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}

.dismiss-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.dismiss-btn:hover {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.slide-banner-enter-active {
  transition: all var(--duration-slow) var(--ease-out);
}

.slide-banner-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.slide-banner-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-banner-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
