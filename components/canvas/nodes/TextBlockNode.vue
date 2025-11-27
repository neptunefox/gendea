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
  background: white;
  border: 1px solid #f0e5e0;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.15s ease;
  will-change: transform, opacity;
}

.text-block-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
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

.text-block-node.selected {
  outline: 2px solid #d4756f;
  outline-offset: 2px;
}

.text-content {
  font-size: 0.9375rem;
  color: #40312b;
  line-height: 1.6;
  cursor: text;
}

.text-content :deep(strong) {
  font-weight: 600;
}

.text-content :deep(em) {
  font-style: italic;
}

.placeholder {
  color: #b8a8a3;
  font-style: italic;
}

.text-editor {
  min-height: 40px;
  font-size: 0.9375rem;
  color: #40312b;
  line-height: 1.6;
  outline: none;
  border: 1px dashed #d4756f;
  border-radius: 4px;
  padding: 0.25rem;
  margin: -0.25rem;
}

.text-block-node.workflow-testing-highlight {
  border-color: #2196f3;
  box-shadow:
    0 0 0 3px rgba(33, 150, 243, 0.2),
    0 4px 12px rgba(33, 150, 243, 0.15);
  animation: testingPulse 2s ease-in-out infinite;
}

.text-block-node.workflow-blocked {
  border-color: #c26660;
  background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
  box-shadow: 0 0 0 2px rgba(194, 102, 96, 0.3);
}

.text-block-node.workflow-incomplete {
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
  background: #b8a8a3 !important;
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

.text-block-node:hover .handle {
  opacity: 1;
}

.handle:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(184, 168, 163, 0.25);
}

:deep(.vue-flow__handle-connecting),
:deep(.vue-flow__handle-valid) {
  opacity: 1 !important;
  background: #66bb6a !important;
  box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.3) !important;
  transform: scale(1.2) !important;
}
</style>
