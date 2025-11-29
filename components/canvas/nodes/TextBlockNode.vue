<template>
  <div
    class="text-block-node"
    :class="[{ selected: props.selected }, animationClass, workflowClass]"
    :style="animationStyle"
  >
    <Handle id="top" type="target" :position="Position.Top" class="handle handle-top" />
    <Handle id="right" type="source" :position="Position.Right" class="handle handle-right" />
    <Handle id="bottom" type="source" :position="Position.Bottom" class="handle handle-bottom" />
    <Handle id="left" type="target" :position="Position.Left" class="handle handle-left" />

    <div
      v-if="isEditing"
      ref="editorRef"
      class="text-editor nodrag"
      contenteditable="true"
      @blur="saveText"
      @keydown.enter.ctrl="saveText"
      v-html="editText"
    />
    <div v-else class="text-content" @dblclick="startEditing">
      <span v-if="props.data.text" v-html="formattedText" />
      <span v-else class="placeholder">Double-click to add text</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { ref, computed, nextTick, inject } from 'vue'

const props = defineProps<NodeProps>()

const isEditing = ref(false)
const editText = ref('')
const editorRef = ref<HTMLDivElement | null>(null)

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyle = computed(() => canvasAnimations?.getNodeAnimationStyle(props.id) || {})

const workflowHighlights = inject<any>('workflowHighlights')
const workflowClass = computed(
  () => workflowHighlights?.getNodeClass(props.id, props.type, props.data) || ''
)

const formattedText = computed(() => {
  const text = props.data.text || ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
})

function startEditing() {
  editText.value = props.data.text || ''
  isEditing.value = true
  nextTick(() => {
    editorRef.value?.focus()
    const range = document.createRange()
    const sel = window.getSelection()
    range.selectNodeContents(editorRef.value!)
    range.collapse(false)
    sel?.removeAllRanges()
    sel?.addRange(range)
  })
}

async function saveText() {
  const newText = editorRef.value?.innerText || ''
  if (newText !== props.data.text) {
    try {
      await $fetch(`/api/canvas/nodes/${props.id}`, {
        method: 'PATCH',
        body: { data: { ...props.data, text: newText } }
      })
    } catch (error) {
      console.error('Failed to save text block:', error)
    }
  }
  isEditing.value = false
}
</script>

<style scoped>
.text-block-node {
  min-width: 200px;
  max-width: 400px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-fast) var(--ease-out);
  will-change: transform, opacity;
}

.text-block-node:hover {
  box-shadow: var(--shadow-md);
}

.text-block-node.node-appearing {
  animation: nodeAppear 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.text-block-node.node-deleting {
  animation: nodeDelete 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.text-block-node.node-staggered {
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

.text-block-node.selected {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.text-content {
  font-size: var(--text-base);
  color: var(--color-text);
  line-height: 1.6;
  cursor: text;
}

.text-content :deep(strong) {
  font-weight: var(--weight-semibold);
}

.text-content :deep(em) {
  font-style: italic;
}

.placeholder {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.text-editor {
  min-height: 40px;
  font-size: var(--text-base);
  color: var(--color-text);
  line-height: 1.6;
  outline: none;
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius-sm);
  padding: var(--space-1);
  margin: calc(var(--space-1) * -1);
}

.text-block-node.workflow-testing-highlight {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.text-block-node.workflow-blocked {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}

.text-block-node.workflow-incomplete {
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

.text-block-node:hover .handle {
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
