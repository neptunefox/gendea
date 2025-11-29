<template>
  <div
    class="sticky-note-node"
    :style="{ backgroundColor: nodeColor, ...animationStyle }"
    :class="[{ selected: props.selected }, animationClass, workflowClass]"
  >
    <Handle id="top" type="target" :position="Position.Top" class="handle handle-top" />
    <Handle id="right" type="source" :position="Position.Right" class="handle handle-right" />
    <Handle id="bottom" type="source" :position="Position.Bottom" class="handle handle-bottom" />
    <Handle id="left" type="target" :position="Position.Left" class="handle handle-left" />

    <div class="sticky-content">
      <textarea
        v-if="isEditing"
        ref="textareaRef"
        v-model="editText"
        class="sticky-textarea nodrag"
        @blur="saveText"
        @keydown.enter.ctrl="saveText"
      />
      <div v-else class="sticky-text" @dblclick="startEditing">
        {{ props.data.text || 'Double-click to edit' }}
      </div>
    </div>

    <div class="sticky-footer">
      <div class="color-picker">
        <button
          v-for="color in colors"
          :key="color"
          class="color-btn"
          :style="{ backgroundColor: color }"
          :class="{ active: nodeColor === color }"
          @click="setColor(color)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { ref, computed, nextTick, inject } from 'vue'

const props = defineProps<NodeProps>()

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyle = computed(() => canvasAnimations?.getNodeAnimationStyle(props.id) || {})

const workflowHighlights = inject<any>('workflowHighlights')
const workflowClass = computed(
  () => workflowHighlights?.getNodeClass(props.id, props.type, props.data) || ''
)

const colors = ['#fff9c4', '#ffccbc', '#c8e6c9', '#b3e5fc', '#e1bee7', '#f5f5f5']

const isEditing = ref(false)
const editText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const nodeColor = computed(() => props.data.color || '#fff9c4')

function startEditing() {
  editText.value = props.data.text || ''
  isEditing.value = true
  nextTick(() => {
    textareaRef.value?.focus()
    textareaRef.value?.select()
  })
}

async function saveText() {
  if (editText.value !== props.data.text) {
    try {
      await $fetch(`/api/canvas/nodes/${props.id}`, {
        method: 'PATCH',
        body: { data: { ...props.data, text: editText.value } }
      })
    } catch (error) {
      console.error('Failed to save sticky note:', error)
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
    console.error('Failed to update color:', error)
  }
}
</script>

<style scoped>
.sticky-note-node {
  min-width: 180px;
  min-height: 120px;
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  transition: box-shadow var(--duration-fast) var(--ease-out);
  will-change: transform, opacity;
}

.sticky-note-node:hover {
  box-shadow: var(--shadow-lg);
}

.sticky-note-node.node-appearing {
  animation: nodeAppear 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.sticky-note-node.node-deleting {
  animation: nodeDelete 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.sticky-note-node.node-staggered {
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

.sticky-note-node.selected {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.sticky-content {
  flex: 1;
  display: flex;
}

.sticky-text {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.4;
  word-wrap: break-word;
  cursor: text;
}

.sticky-textarea {
  width: 100%;
  min-height: 80px;
  border: none;
  background: transparent;
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.4;
  resize: none;
  font-family: inherit;
}

.sticky-textarea:focus {
  outline: none;
}

.sticky-footer {
  margin-top: var(--space-2);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.sticky-note-node:hover .sticky-footer {
  opacity: 1;
}

.color-picker {
  display: flex;
  gap: var(--space-1);
}

.color-btn {
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out);
}

.color-btn:hover {
  transform: scale(1.2);
}

.color-btn.active {
  outline: 2px solid var(--color-text);
  outline-offset: 1px;
}

.sticky-note-node.workflow-testing-highlight {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.sticky-note-node.workflow-blocked {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}

.sticky-note-node.workflow-incomplete {
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

.sticky-note-node:hover .handle {
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
