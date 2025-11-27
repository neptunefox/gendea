<template>
  <div
    class="sticky-note-node"
    :style="{ backgroundColor: nodeColor, ...animationStyle }"
    :class="[{ selected: props.selected }, animationClass, workflowClass]"
  >
    <Handle type="target" :position="Position.Top" />
    
    <div class="sticky-content">
      <textarea
        v-if="isEditing"
        v-model="editText"
        class="sticky-textarea nodrag"
        @blur="saveText"
        @keydown.enter.ctrl="saveText"
        ref="textareaRef"
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

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, inject } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyle = computed(() => canvasAnimations?.getNodeAnimationStyle(props.id) || {})

const workflowHighlights = inject<any>('workflowHighlights')
const workflowClass = computed(() => workflowHighlights?.getNodeClass(props.id, props.type, props.data) || '')

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
  padding: 0.75rem;
  border-radius: 2px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  transform: rotate(-1deg);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  will-change: transform;
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
  from { opacity: 0; transform: rotate(-1deg) scale(0.8); }
  to { opacity: 1; transform: rotate(-1deg) scale(1); }
}

@keyframes nodeDelete {
  from { opacity: 1; transform: rotate(-1deg) scale(1); }
  to { opacity: 0; transform: rotate(-1deg) scale(0.8); }
}

@keyframes nodeStagger {
  from { opacity: 0; transform: rotate(-1deg) translateY(20px) scale(0.9); }
  to { opacity: 1; transform: rotate(-1deg) translateY(0) scale(1); }
}

.sticky-note-node:hover {
  transform: rotate(0deg) scale(1.02);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.2);
}

.sticky-note-node.selected {
  outline: 2px solid #d4756f;
  outline-offset: 2px;
}

.sticky-content {
  flex: 1;
  display: flex;
}

.sticky-text {
  font-size: 0.875rem;
  color: #40312b;
  line-height: 1.4;
  word-wrap: break-word;
  cursor: text;
}

.sticky-textarea {
  width: 100%;
  min-height: 80px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #40312b;
  line-height: 1.4;
  resize: none;
  font-family: inherit;
}

.sticky-textarea:focus {
  outline: none;
}

.sticky-footer {
  margin-top: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sticky-note-node:hover .sticky-footer {
  opacity: 1;
}

.color-picker {
  display: flex;
  gap: 0.25rem;
}

.color-btn {
  width: 16px;
  height: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.color-btn:hover {
  transform: scale(1.2);
}

.color-btn.active {
  outline: 2px solid #40312b;
  outline-offset: 1px;
}

.sticky-note-node.workflow-testing-highlight {
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3), 2px 2px 8px rgba(0, 0, 0, 0.15);
  animation: testingPulse 2s ease-in-out infinite;
}

.sticky-note-node.workflow-blocked {
  box-shadow: 0 0 0 2px rgba(194, 102, 96, 0.4), 2px 2px 8px rgba(0, 0, 0, 0.15);
}

.sticky-note-node.workflow-incomplete {
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.3), 2px 2px 8px rgba(0, 0, 0, 0.15);
}

@keyframes testingPulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3), 2px 2px 8px rgba(0, 0, 0, 0.15); }
  50% { box-shadow: 0 0 0 6px rgba(33, 150, 243, 0.15), 2px 2px 12px rgba(0, 0, 0, 0.2); }
}
</style>
