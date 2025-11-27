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
  min-width: 200px;
  max-width: 280px;
  background: linear-gradient(135deg, #fffde7 0%, #fff9c4 100%);
  border: 2px solid #ffd54f;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(255, 213, 79, 0.2);
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;
  will-change: transform, opacity;
}

.idea-node:hover {
  box-shadow: 0 4px 16px rgba(255, 213, 79, 0.3);
  transform: translateY(-1px);
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

.idea-node.selected {
  outline: 2px solid #ffd54f;
  outline-offset: 2px;
}

.idea-node.cauldron {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border-color: #ba68c8;
  box-shadow: 0 2px 8px rgba(186, 104, 200, 0.2);
}

.idea-node.cauldron:hover {
  box-shadow: 0 4px 16px rgba(186, 104, 200, 0.3);
}

.idea-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.idea-icon {
  color: #ffa000;
}

.idea-node.cauldron .idea-icon {
  color: #ba68c8;
}

.cauldron-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(186, 104, 200, 0.2);
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9c27b0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.idea-text {
  font-size: 0.9375rem;
  color: #40312b;
  line-height: 1.5;
}

.idea-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.75rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background: rgba(255, 160, 0, 0.15);
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #f57c00;
}

.idea-node.cauldron .tag {
  background: rgba(186, 104, 200, 0.15);
  color: #9c27b0;
}

.idea-node.workflow-testing-highlight {
  border-color: #2196f3;
  box-shadow:
    0 0 0 3px rgba(33, 150, 243, 0.2),
    0 4px 12px rgba(33, 150, 243, 0.15);
  animation: testingPulse 2s ease-in-out infinite;
}

.idea-node.workflow-blocked {
  border-color: #c26660;
  background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
  box-shadow: 0 0 0 2px rgba(194, 102, 96, 0.3);
}

.idea-node.workflow-incomplete {
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

.handle {
  width: 8px !important;
  height: 8px !important;
  background: #ffd54f !important;
  border: 2px solid white !important;
  border-radius: 50% !important;
  opacity: 0;
  transition: all 0.2s ease;
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

.idea-node.cauldron .handle {
  background: #ba68c8 !important;
}

.idea-node:hover .handle {
  opacity: 1;
}

.handle:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(255, 213, 79, 0.25);
}

.idea-node.cauldron .handle:hover {
  box-shadow: 0 0 0 3px rgba(186, 104, 200, 0.25);
}

:deep(.vue-flow__handle-connecting),
:deep(.vue-flow__handle-valid) {
  opacity: 1 !important;
  background: #66bb6a !important;
  box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.3) !important;
  transform: scale(1.2) !important;
}
</style>
