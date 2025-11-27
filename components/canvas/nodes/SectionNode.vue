<template>
  <div
    class="section-node"
    :class="{ selected: props.selected, collapsed: isCollapsed }"
    :style="sectionStyle"
  >
    <div class="section-header" @dblclick="startEditing">
      <div class="section-title-area">
        <button class="collapse-btn nodrag" @click="toggleCollapse">
          <ChevronDown :size="16" :class="{ rotated: isCollapsed }" />
        </button>
        <input
          v-if="isEditing"
          v-model="editLabel"
          class="section-input nodrag"
          @blur="saveLabel"
          @keydown.enter="saveLabel"
          @keydown.escape="cancelEdit"
          ref="inputRef"
        />
        <span v-else class="section-label">{{ props.data.label || 'Section' }}</span>
      </div>
      <div class="section-actions nodrag">
        <button
          v-for="color in colors"
          :key="color"
          class="color-dot"
          :style="{ backgroundColor: color }"
          :class="{ active: sectionColor === color }"
          @click="setColor(color)"
        />
      </div>
    </div>
    <div v-show="!isCollapsed" class="section-content" :style="contentStyle" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { type NodeProps } from '@vue-flow/core'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<NodeProps>()

const colors = [
  'rgba(212, 117, 111, 0.1)',
  'rgba(139, 122, 117, 0.1)',
  'rgba(76, 175, 80, 0.1)',
  'rgba(33, 150, 243, 0.1)',
  'rgba(156, 39, 176, 0.1)',
  'rgba(255, 193, 7, 0.1)'
]

const borderColors: Record<string, string> = {
  'rgba(212, 117, 111, 0.1)': '#d4756f',
  'rgba(139, 122, 117, 0.1)': '#8b7a75',
  'rgba(76, 175, 80, 0.1)': '#4caf50',
  'rgba(33, 150, 243, 0.1)': '#2196f3',
  'rgba(156, 39, 176, 0.1)': '#9c27b0',
  'rgba(255, 193, 7, 0.1)': '#ffc107'
}

const isEditing = ref(false)
const editLabel = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const isCollapsed = ref(false)

const sectionColor = computed(() => props.data.color || colors[0])
const sectionBorderColor = computed(() => borderColors[sectionColor.value] || '#d4756f')

const sectionStyle = computed(() => ({
  backgroundColor: sectionColor.value,
  borderColor: sectionBorderColor.value,
  width: `${props.data.width || 400}px`,
  height: isCollapsed.value ? 'auto' : `${props.data.height || 300}px`
}))

const contentStyle = computed(() => ({
  minHeight: `${(props.data.height || 300) - 48}px`
}))

function startEditing() {
  editLabel.value = props.data.label || ''
  isEditing.value = true
  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

function cancelEdit() {
  isEditing.value = false
}

async function saveLabel() {
  if (editLabel.value !== props.data.label) {
    try {
      await $fetch(`/api/canvas/nodes/${props.id}`, {
        method: 'PATCH',
        body: { data: { ...props.data, label: editLabel.value } }
      })
    } catch (error) {
      console.error('Failed to save section label:', error)
    }
  }
  isEditing.value = false
}

async function setColor(color: string) {
  try {
    await $fetch(`/api/canvas/nodes/${props.id}`, {
      method: 'PATCH',
      body: { data: { ...props.data, color } }
    })
  } catch (error) {
    console.error('Failed to update section color:', error)
  }
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.section-node {
  border: 2px dashed;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.section-node:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.section-node.selected {
  outline: 2px solid #d4756f;
  outline-offset: 2px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: grab;
}

.section-title-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #8b7a75;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #40312b;
}

.collapse-btn svg {
  transition: transform 0.2s ease;
}

.collapse-btn svg.rotated {
  transform: rotate(-90deg);
}

.section-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #40312b;
}

.section-input {
  font-size: 0.875rem;
  font-weight: 600;
  color: #40312b;
  background: white;
  border: 1px solid rgba(212, 117, 111, 0.3);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  outline: none;
}

.section-input:focus {
  border-color: #d4756f;
}

.section-actions {
  display: flex;
  gap: 0.375rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.section-node:hover .section-actions {
  opacity: 1;
}

.color-dot {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.color-dot:hover {
  transform: scale(1.2);
}

.color-dot.active {
  border-color: #40312b;
}

.section-content {
  position: relative;
}

.section-node.collapsed {
  height: auto !important;
}
</style>
