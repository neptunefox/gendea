<template>
  <div class="node-palette" :class="{ collapsed: isCollapsed }">
    <button
      class="toggle-btn"
      :title="isCollapsed ? 'Expand palette' : 'Collapse palette'"
      @click="isCollapsed = !isCollapsed"
    >
      <ChevronLeft v-if="!isCollapsed" :size="16" />
      <ChevronRight v-else :size="16" />
    </button>

    <div v-if="!isCollapsed" class="palette-content">
      <div class="palette-items">
        <div
          v-for="item in paletteItems"
          :key="item.type"
          class="palette-item"
          draggable="true"
          @dragstart="e => onDragStart(e, item.type)"
          @dragend="onDragEnd"
        >
          <div class="item-icon" :style="{ '--accent': item.accent }">
            <component :is="item.icon" :size="16" />
          </div>
          <span class="item-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  StickyNote,
  Type,
  HelpCircle,
  Wrench,
  CheckSquare,
  Lightbulb,
  Target,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import { ref } from 'vue'

import type { CanvasNodeType } from '~/components/canvas/nodes'
import { useDragAndDrop } from '~/composables/useDragAndDrop'

const { onDragStart, onDragEnd } = useDragAndDrop()

const isCollapsed = ref(false)

const paletteItems: { type: CanvasNodeType; label: string; icon: any; accent: string }[] = [
  { type: 'sticky-note', label: 'Sticky Note', icon: StickyNote, accent: '#ffa000' },
  { type: 'idea', label: 'Idea', icon: Lightbulb, accent: 'var(--color-primary)' },
  { type: 'task', label: 'Task', icon: CheckSquare, accent: 'var(--color-text-tertiary)' },
  { type: 'goal', label: 'Goal', icon: Target, accent: 'var(--color-success)' },
  { type: 'input', label: 'Question', icon: HelpCircle, accent: 'var(--color-primary)' },
  { type: 'tool', label: 'Tool', icon: Wrench, accent: '#64b5f6' },
  { type: 'text-block', label: 'Text', icon: Type, accent: 'var(--color-text-tertiary)' }
]
</script>

<style scoped>
.node-palette {
  position: fixed;
  top: 50%;
  left: calc(var(--nav-width) + 1rem);
  transform: translateY(-50%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  transition: all var(--duration-fast) var(--ease-out);
}

@media (max-width: 768px) {
  .node-palette {
    left: 1rem;
  }
}

.node-palette.collapsed {
  padding: 0;
}

.toggle-btn {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--duration-fast) var(--ease-out);
}

.toggle-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.palette-content {
  padding: var(--space-3);
}

.palette-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.palette-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: grab;
  transition: all var(--duration-fast) var(--ease-out);
  user-select: none;
}

.palette-item:hover {
  background: var(--color-primary-subtle);
}

.palette-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.item-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--accent);
  color: var(--accent);
  flex-shrink: 0;
}

.item-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  white-space: nowrap;
}
</style>
