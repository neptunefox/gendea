<template>
  <div class="text-block-node" :class="[{ selected: props.selected }, animationClass]" :style="animationStyle">
    <Handle type="target" :position="Position.Top" />
    
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

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, inject } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()

const isEditing = ref(false)
const editText = ref('')
const editorRef = ref<HTMLDivElement | null>(null)

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyle = computed(() => canvasAnimations?.getNodeAnimationStyle(props.id) || {})

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
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes nodeDelete {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.8); }
}

@keyframes nodeStagger {
  from { opacity: 0; transform: translateY(20px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
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
</style>
