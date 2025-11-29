<template>
  <div
    class="input-node"
    :class="[{ selected: props.selected, answered: hasAnswer }, animationClass, workflowClass]"
    :style="animationStyle"
  >
    <Handle id="top" type="target" :position="Position.Top" class="handle handle-top" />
    <Handle id="right" type="source" :position="Position.Right" class="handle handle-right" />
    <Handle id="bottom" type="source" :position="Position.Bottom" class="handle handle-bottom" />
    <Handle id="left" type="target" :position="Position.Left" class="handle handle-left" />

    <div class="input-header">
      <HelpCircle :size="18" class="question-icon" />
      <span class="input-label">Question</span>
    </div>

    <div class="input-question">
      {{ props.data.question || 'What would you like to know?' }}
    </div>

    <div v-if="!hasAnswer" class="input-field">
      <input
        v-model="answer"
        type="text"
        class="answer-input nodrag"
        placeholder="Type your answer..."
        @keydown.enter="submitAnswer"
      />
      <button class="submit-btn" :disabled="!answer.trim()" @click="submitAnswer">
        <Send :size="14" />
      </button>
    </div>

    <div v-else class="input-answer">
      <div class="answer-label">Answer:</div>
      <div class="answer-text">{{ props.data.answer }}</div>
      <button class="edit-btn" @click="editAnswer">Edit</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { HelpCircle, Send } from 'lucide-vue-next'
import { ref, computed, inject } from 'vue'

const props = defineProps<NodeProps>()

const answer = ref('')

const hasAnswer = computed(() => !!props.data.answer)

const canvasAnimations = inject<any>('canvasAnimations')
const animationClass = computed(() => canvasAnimations?.getNodeAnimationClass(props.id) || '')
const animationStyle = computed(() => canvasAnimations?.getNodeAnimationStyle(props.id) || {})

const workflowHighlights = inject<any>('workflowHighlights')
const workflowClass = computed(
  () => workflowHighlights?.getNodeClass(props.id, props.type, props.data) || ''
)

async function submitAnswer() {
  if (!answer.value.trim()) return

  try {
    await $fetch(`/api/canvas/nodes/${props.id}`, {
      method: 'PATCH',
      body: { data: { ...props.data, answer: answer.value.trim() } }
    })
    answer.value = ''
  } catch (error) {
    console.error('Failed to submit answer:', error)
  }
}

function editAnswer() {
  answer.value = props.data.answer || ''
  $fetch(`/api/canvas/nodes/${props.id}`, {
    method: 'PATCH',
    body: { data: { ...props.data, answer: null } }
  }).catch(console.error)
}
</script>

<style scoped>
.input-node {
  --node-accent: var(--color-primary);
  min-width: 240px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--node-accent);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-fast) var(--ease-out);
  will-change: transform, opacity;
}

.input-node:hover {
  box-shadow: var(--shadow-md);
}

.input-node.node-appearing {
  animation: nodeAppear 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.input-node.node-deleting {
  animation: nodeDelete 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.input-node.node-staggered {
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

.input-node.selected {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.input-node.answered {
  --node-accent: var(--color-success);
}

.input-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.question-icon {
  color: var(--node-accent);
}

.input-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--node-accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-question {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  margin-bottom: var(--space-3);
  line-height: 1.4;
}

.input-field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.answer-input {
  flex: 1;
  min-width: 0;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  background: var(--color-surface);
  box-sizing: border-box;
}

.answer-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.submit-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-answer {
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  position: relative;
}

.answer-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-success);
  margin-bottom: var(--space-1);
}

.answer-text {
  font-size: var(--text-sm);
  color: var(--color-text);
}

.edit-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.input-answer:hover .edit-btn {
  opacity: 1;
}

.edit-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.input-node.workflow-testing-highlight {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.input-node.workflow-blocked {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}

.input-node.workflow-incomplete {
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

.input-node:hover .handle {
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
