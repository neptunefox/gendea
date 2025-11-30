<template>
  <Transition name="guidance-fade">
    <div v-if="visible" class="flow-guidance-banner" :class="variant">
      <div class="guidance-icon">
        <component :is="iconComponent" :size="18" />
      </div>
      <div class="guidance-content">
        <p class="guidance-text">{{ message }}</p>
        <p v-if="hint" class="guidance-hint">{{ hint }}</p>
        <NuxtLink v-if="actionLink" :to="actionLink" class="action-link" @click="handleDismiss">
          {{ actionLabel }}
          <ArrowRight :size="14" />
        </NuxtLink>
      </div>
      <button v-if="dismissable" class="dismiss-btn" @click="handleDismiss">
        <X :size="16" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Flame, FlaskRound, Eye, Lightbulb, X, ArrowRight } from 'lucide-vue-next'

interface Props {
  visible: boolean
  message: string
  hint?: string
  variant?: 'spark' | 'cauldron' | 'oracle' | 'neutral'
  dismissable?: boolean
  actionLink?: string
  actionLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  dismissable: true,
  actionLabel: 'Go there'
})

const emit = defineEmits<{
  dismiss: []
}>()

const iconComponent = computed(() => {
  switch (props.variant) {
    case 'spark':
      return Flame
    case 'cauldron':
      return FlaskRound
    case 'oracle':
      return Eye
    default:
      return Lightbulb
  }
})

function handleDismiss() {
  emit('dismiss')
}
</script>

<style scoped>
.flow-guidance-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.flow-guidance-banner.spark {
  border-color: rgba(212, 165, 116, 0.3);
  background: linear-gradient(135deg, var(--color-surface) 0%, rgba(212, 165, 116, 0.05) 100%);
}

.flow-guidance-banner.spark .guidance-icon {
  color: var(--color-primary);
}

.flow-guidance-banner.cauldron {
  border-color: rgba(149, 117, 205, 0.3);
  background: linear-gradient(135deg, var(--color-surface) 0%, rgba(149, 117, 205, 0.05) 100%);
}

.flow-guidance-banner.cauldron .guidance-icon {
  color: var(--color-cauldron);
}

.flow-guidance-banner.oracle {
  border-color: rgba(126, 184, 201, 0.3);
  background: linear-gradient(135deg, var(--color-surface) 0%, rgba(126, 184, 201, 0.05) 100%);
}

.flow-guidance-banner.oracle .guidance-icon {
  color: var(--color-oracle);
}

.guidance-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.guidance-content {
  flex: 1;
  min-width: 0;
}

.guidance-text {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.5;
}

.guidance-hint {
  margin: var(--space-1) 0 0;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: 1.4;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s var(--ease-out);
}

.action-link:hover {
  color: var(--color-text);
}

.flow-guidance-banner.cauldron .action-link {
  color: var(--color-cauldron);
}

.flow-guidance-banner.cauldron .action-link:hover {
  color: var(--color-text);
}

.flow-guidance-banner.oracle .action-link {
  color: var(--color-oracle);
}

.flow-guidance-banner.oracle .action-link:hover {
  color: var(--color-text);
}

.flow-guidance-banner.spark .action-link {
  color: var(--color-primary);
}

.flow-guidance-banner.spark .action-link:hover {
  color: var(--color-text);
}

.dismiss-btn {
  flex-shrink: 0;
  padding: var(--space-1);
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color 0.2s var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dismiss-btn:hover {
  color: var(--color-text-secondary);
}

.guidance-fade-enter-active,
.guidance-fade-leave-active {
  transition: all 0.4s var(--ease-out);
}

.guidance-fade-enter-from,
.guidance-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
