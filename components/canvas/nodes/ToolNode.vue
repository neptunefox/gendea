<template>
  <div
    class="tool-node"
    :class="[{ selected: props.selected }, animationClass, workflowClass]"
    :style="animationStyle"
  >
    <Handle id="top" type="target" :position="Position.Top" class="handle handle-top" />
    <Handle id="right" type="source" :position="Position.Right" class="handle handle-right" />
    <Handle id="bottom" type="source" :position="Position.Bottom" class="handle handle-bottom" />
    <Handle id="left" type="target" :position="Position.Left" class="handle handle-left" />

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
  --node-accent: #64b5f6;
  min-width: 200px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--node-accent);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-fast) var(--ease-out);
  will-change: transform, opacity;
}

.tool-node:hover {
  box-shadow: var(--shadow-md);
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
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes nodeDelete {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}

@keyframes nodeStagger {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tool-node.selected {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.tool-icon {
  color: var(--node-accent);
}

.tool-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--node-accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tool-name {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.tool-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-bottom: var(--space-3);
}

.tool-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--node-accent);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-out);
}

.tool-link:hover {
  background: var(--node-accent);
  border-color: var(--node-accent);
  color: white;
}

.tool-node.workflow-testing-highlight {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.tool-node.workflow-blocked {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}

.tool-node.workflow-incomplete {
  outline: 2px solid var(--color-warning);
  outline-offset: 2px;
}

.handle {
  width: 8px !important;
  height: 8px !important;
  background: var(--color-text-tertiary) !important;
  border: 2px solid var(--color-surface) !important;
  border-radius: 50% !important;
  opacity: 0;
  transition: all var(--duration-fast) var(--ease-out);
  cursor: crosshair;
}

.handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.tool-node:hover .handle {
  opacity: 1;
}

.handle:hover {
  transform: scale(1.2);
  background: var(--color-primary) !important;
}

:deep(.vue-flow__handle-connecting),
:deep(.vue-flow__handle-valid) {
  opacity: 1 !important;
  background: var(--color-success) !important;
  transform: scale(1.2) !important;
}
</style>
