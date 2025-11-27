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
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(255, 250, 245, 0.98) 0%, rgba(254, 245, 240, 0.98) 100%);
  border: 1px solid rgba(212, 117, 111, 0.25);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(212, 117, 111, 0.15);
  backdrop-filter: blur(8px);
  max-width: 100%;
}

.banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(212, 117, 111, 0.15) 0%, rgba(212, 117, 111, 0.1) 100%);
  border-radius: 8px;
  color: #d4756f;
  flex-shrink: 0;
}

.banner-message {
  flex: 1;
  margin: 0;
  font-size: 0.9375rem;
  color: #40312b;
  line-height: 1.4;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: linear-gradient(135deg, #d4756f 0%, #c26660 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.3);
}

.dismiss-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #b8a89d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dismiss-btn:hover {
  background: rgba(212, 117, 111, 0.1);
  color: #d4756f;
}

.slide-banner-enter-active {
  transition: all 0.3s ease-out;
}

.slide-banner-leave-active {
  transition: all 0.2s ease-in;
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
