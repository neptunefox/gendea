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
      <div class="palette-header">Add Nodes</div>

      <div class="palette-items">
        <div
          v-for="item in paletteItems"
          :key="item.type"
          class="palette-item"
          draggable="true"
          @dragstart="e => onDragStart(e, item.type)"
          @dragend="onDragEnd"
        >
          <div class="item-icon" :style="{ background: item.color }">
            <component :is="item.icon" :size="18" />
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
  Square,
  Type,
  HelpCircle,
  Wrench,
  CheckSquare,
  Lightbulb,
  Target,
  LayoutGrid,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import { ref } from 'vue'

import type { CanvasNodeType } from '~/components/canvas/nodes'
import { useDragAndDrop } from '~/composables/useDragAndDrop'

const { onDragStart, onDragEnd } = useDragAndDrop()

const isCollapsed = ref(false)

const paletteItems: { type: CanvasNodeType; label: string; icon: any; color: string }[] = [
  { type: 'sticky-note', label: 'Sticky Note', icon: StickyNote, color: '#fff9c4' },
  {
    type: 'idea',
    label: 'Idea',
    icon: Lightbulb,
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  {
    type: 'task',
    label: 'Task',
    icon: CheckSquare,
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    type: 'goal',
    label: 'Goal',
    icon: Target,
    color: 'linear-gradient(135deg, #d4756f 0%, #c26660 100%)'
  },
  {
    type: 'input',
    label: 'Question',
    icon: HelpCircle,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    type: 'tool',
    label: 'Tool',
    icon: Wrench,
    color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  { type: 'text-block', label: 'Text', icon: Type, color: '#f5f5f5' },
  {
    type: 'shape',
    label: 'Shape',
    icon: Square,
    color: 'linear-gradient(135deg, #d4756f 0%, #e8a5a0 100%)'
  },
  { type: 'section', label: 'Section', icon: LayoutGrid, color: 'rgba(212, 117, 111, 0.1)' }
]
</script>

<style scoped>
.node-palette {
  position: fixed;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: all 0.2s ease;
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
  background: white;
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8b7a75;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: #d4756f;
  color: white;
  border-color: #d4756f;
}

.palette-content {
  padding: 0.75rem;
}

.palette-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b7a75;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding: 0 0.25rem;
}

.palette-items {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.15s ease;
  user-select: none;
}

.palette-item:hover {
  background: rgba(212, 117, 111, 0.08);
}

.palette-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #40312b;
  flex-shrink: 0;
}

.item-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #40312b;
  white-space: nowrap;
}
</style>
