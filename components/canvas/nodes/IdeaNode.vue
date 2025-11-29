<template>
  <div
    class="idea-node"
    :class="[
      { selected: props.selected, cauldron: isCauldronOutput },
      animationClass,
      workflowClass
    ]"
    :style="animationStyle"
  >
    <Handle id="top" type="target" :position="Position.Top" class="handle handle-top" />
    <Handle id="right" type="source" :position="Position.Right" class="handle handle-right" />
    <Handle id="bottom" type="source" :position="Position.Bottom" class="handle handle-bottom" />
    <Handle id="left" type="target" :position="Position.Left" class="handle handle-left" />

    <div class="idea-header">
      <Lightbulb :size="18" class="idea-icon" />
      <span v-if="isCauldronOutput" class="cauldron-badge">
        <Sparkles :size="12" />
        Cauldron
      </span>
    </div>

    <div class="idea-text">
      {{ props.data.text || 'Untitled idea' }}
    </div>

    <div v-if="props.data.tags?.length" class="idea-tags">
      <span v-for="tag in props.data.tags" :key="tag" class="tag">
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Lightbulb, Sparkles } from 'lucide-vue-next'
import { computed, inject } from 'vue'

const props = defineProps<NodeProps>()

const isCauldronOutput = computed(() => !!props.data.isCauldronOutput)

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyle = computed(() => canvasAnimations?.getNodeAnimationStyle(props.id) || {})

const workflowHighlights = inject<any>('workflowHighlights')
const workflowClass = computed(
  () => workflowHighlights?.getNodeClass(props.id, props.type, props.data) || ''
)
</script>

<style scoped>
.idea-node {
  --node-accent: var(--color-primary);
  min-width: 200px;
  max-width: 280px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--node-accent);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-fast) var(--ease-out);
  will-change: transform, opacity;
}

.idea-node:hover {
  box-shadow: var(--shadow-md);
}

.idea-node.node-appearing {
  animation: nodeAppear 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.idea-node.node-deleting {
  animation: nodeDelete 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.idea-node.node-staggered {
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

.idea-node.selected {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.idea-node.cauldron {
  --node-accent: #9c27b0;
}

.idea-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.idea-icon {
  color: var(--node-accent);
}

.cauldron-badge {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(156, 39, 176, 0.1);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: #9c27b0;
}

.idea-text {
  font-size: var(--text-base);
  color: var(--color-text);
  line-height: 1.5;
}

.idea-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.tag {
  padding: var(--space-1) var(--space-2);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-primary);
}

.idea-node.cauldron .tag {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.idea-node.workflow-testing-highlight {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.idea-node.workflow-blocked {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}

.idea-node.workflow-incomplete {
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

.idea-node:hover .handle {
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
