<template>
  <div
    class="group-node"
    :class="[{ selected: props.selected, collapsed: isCollapsed }, animationClass]"
    :style="groupStyle"
  >
    <Handle id="top" type="target" :position="Position.Top" class="handle handle-top" />
    <Handle id="right" type="source" :position="Position.Right" class="handle handle-right" />
    <Handle id="bottom" type="source" :position="Position.Bottom" class="handle handle-bottom" />
    <Handle id="left" type="target" :position="Position.Left" class="handle handle-left" />

    <div class="group-header">
      <button class="collapse-btn" @click.stop="toggleCollapse">
        <ChevronDown v-if="!isCollapsed" :size="14" />
        <ChevronRight v-else :size="14" />
      </button>
      <span v-if="props.data.label" class="group-label">{{ props.data.label }}</span>
      <span v-else class="group-label placeholder">Unnamed Group</span>
      <span v-if="childCount > 0" class="child-count">{{ childCount }}</span>
    </div>

    <div v-if="!isCollapsed" class="group-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { computed, inject, ref } from 'vue'

const props = defineProps<NodeProps>()

const isCollapsed = ref(false)

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyleFromComposable = computed(
  () => canvasAnimations?.getNodeAnimationStyle(props.id) || {}
)

const childCount = computed(() => props.data.childCount || 0)

const groupStyle = computed(() => ({
  backgroundColor: props.data.fill || 'rgba(232, 228, 225, 0.6)',
  borderColor: props.data.stroke || '#d4ccc7',
  width: props.data.width ? `${props.data.width}px` : undefined,
  height: isCollapsed.value ? 'auto' : props.data.height ? `${props.data.height}px` : undefined,
  minWidth: isCollapsed.value ? '160px' : '200px',
  minHeight: isCollapsed.value ? 'auto' : '120px',
  ...animationStyleFromComposable.value
}))

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.group-node {
  display: flex;
  flex-direction: column;
  border: 2px dashed;
  border-radius: 12px;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  will-change: transform, opacity;
  backdrop-filter: blur(4px);
}

.group-node:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-style: solid;
}

.group-node.node-appearing {
  animation: nodeAppear 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.group-node.node-deleting {
  animation: nodeDelete 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.group-node.node-staggered {
  animation: nodeStagger 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes nodeAppear {
  from {
    opacity: 0;
    transform: scale(0.9);
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
    transform: scale(0.9);
  }
}

@keyframes nodeStagger {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.group-node.selected {
  outline: 2px solid #8b7a75;
  outline-offset: 2px;
  border-style: solid;
}

.group-node.collapsed {
  min-height: auto;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px 10px 0 0;
}

.group-node.collapsed .group-header {
  border-bottom: none;
  border-radius: 10px;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #8b7a75;
  transition: all 0.15s ease;
}

.collapse-btn:hover {
  background: rgba(139, 122, 117, 0.1);
  color: #40312b;
}

.group-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #40312b;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-label.placeholder {
  color: #b8a8a3;
  font-style: italic;
  font-weight: 400;
}

.child-count {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #8b7a75;
  background: rgba(139, 122, 117, 0.15);
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
}

.group-content {
  flex: 1;
  padding: 0.75rem;
  min-height: 60px;
}

.handle {
  width: 8px !important;
  height: 8px !important;
  background: #8b7a75 !important;
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

.group-node:hover .handle {
  opacity: 1;
}

.handle:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(139, 122, 117, 0.25);
}

:deep(.vue-flow__handle-connecting),
:deep(.vue-flow__handle-valid) {
  opacity: 1 !important;
  background: #66bb6a !important;
  box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.3) !important;
  transform: scale(1.2) !important;
}
</style>
