<template>
  <div
    class="tool-node"
    :class="[{ selected: props.selected }, animationClass, workflowClass]"
    :style="animationStyle"
  >
    <Handle type="target" :position="Position.Top" />

    <div class="tool-header">
      <Wrench :size="18" class="tool-icon" />
      <span class="tool-label">Tool / Resource</span>
    </div>

    <div class="tool-name">
      {{ props.data.name || 'Unnamed Tool' }}
    </div>

    <div v-if="props.data.description" class="tool-description">
      {{ props.data.description }}
    </div>

    <a
      v-if="props.data.url"
      :href="props.data.url"
      target="_blank"
      rel="noopener noreferrer"
      class="tool-link nodrag"
      @click.stop
    >
      <ExternalLink :size="14" />
      <span>Open Resource</span>
    </a>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Wrench, ExternalLink } from 'lucide-vue-next'
import { computed, inject } from 'vue'

const props = defineProps<NodeProps>()

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyle = computed(() => canvasAnimations?.getNodeAnimationStyle(props.id) || {})

const workflowHighlights = inject<any>('workflowHighlights')
const workflowClass = computed(
  () => workflowHighlights?.getNodeClass(props.id, props.type, props.data) || ''
)
</script>

<style scoped>
.tool-node {
  min-width: 200px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%);
  border: 2px solid #64b5f6;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(100, 181, 246, 0.15);
  transition: box-shadow 0.15s ease;
  will-change: transform, opacity;
}

.tool-node:hover {
  box-shadow: 0 4px 16px rgba(100, 181, 246, 0.25);
}

.tool-node.node-appearing {
  animation: nodeAppear 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.tool-node.node-deleting {
  animation: nodeDelete 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.tool-node.node-staggered {
  animation: nodeStagger 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes nodeAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes nodeDelete {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes nodeStagger {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tool-node.selected {
  outline: 2px solid #64b5f6;
  outline-offset: 2px;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tool-icon {
  color: #64b5f6;
}

.tool-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64b5f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tool-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #40312b;
  margin-bottom: 0.5rem;
}

.tool-description {
  font-size: 0.8125rem;
  color: #8b7a75;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.tool-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #64b5f6;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #64b5f6;
  text-decoration: none;
  transition: all 0.2s ease;
}

.tool-link:hover {
  background: #64b5f6;
  color: white;
}

.tool-node.workflow-testing-highlight {
  border-color: #2196f3;
  box-shadow:
    0 0 0 3px rgba(33, 150, 243, 0.2),
    0 4px 12px rgba(33, 150, 243, 0.15);
  animation: testingPulse 2s ease-in-out infinite;
}

.tool-node.workflow-blocked {
  border-color: #c26660;
  background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
  box-shadow: 0 0 0 2px rgba(194, 102, 96, 0.3);
}

.tool-node.workflow-incomplete {
  border-color: #ff9800;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
}

@keyframes testingPulse {
  0%,
  100% {
    box-shadow:
      0 0 0 3px rgba(33, 150, 243, 0.2),
      0 4px 12px rgba(33, 150, 243, 0.15);
  }
  50% {
    box-shadow:
      0 0 0 6px rgba(33, 150, 243, 0.1),
      0 4px 16px rgba(33, 150, 243, 0.25);
  }
}
</style>
