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
  min-width: 240px;
  background: linear-gradient(135deg, #fff5f0 0%, #fef8f5 100%);
  border: 2px solid #d4756f;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(212, 117, 111, 0.15);
  transition: box-shadow 0.15s ease;
  will-change: transform, opacity;
}

.input-node:hover {
  box-shadow: 0 4px 16px rgba(212, 117, 111, 0.25);
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

.input-node.selected {
  outline: 2px solid #d4756f;
  outline-offset: 2px;
}

.input-node.answered {
  border-color: #8bc34a;
  background: linear-gradient(135deg, #f5fff0 0%, #f8fef5 100%);
}

.input-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.question-icon {
  color: #d4756f;
}

.input-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #d4756f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-question {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #40312b;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.input-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.answer-input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0.75rem;
  border: 1px solid #f0e5e0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #40312b;
  background: white;
  box-sizing: border-box;
}

.answer-input:focus {
  outline: none;
  border-color: #d4756f;
}

.submit-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  background: #d4756f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background: #c26660;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-answer {
  background: white;
  border-radius: 8px;
  padding: 0.75rem;
  position: relative;
}

.answer-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #8bc34a;
  margin-bottom: 0.25rem;
}

.answer-text {
  font-size: 0.875rem;
  color: #40312b;
}

.edit-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background: transparent;
  border: 1px solid #f0e5e0;
  border-radius: 4px;
  color: #8b7a75;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.input-answer:hover .edit-btn {
  opacity: 1;
}

.edit-btn:hover {
  border-color: #d4756f;
  color: #d4756f;
}

.input-node.workflow-testing-highlight {
  border-color: #2196f3;
  box-shadow:
    0 0 0 3px rgba(33, 150, 243, 0.2),
    0 4px 12px rgba(33, 150, 243, 0.15);
  animation: testingPulse 2s ease-in-out infinite;
}

.input-node.workflow-blocked {
  border-color: #c26660;
  background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
  box-shadow: 0 0 0 2px rgba(194, 102, 96, 0.3);
}

.input-node.workflow-incomplete {
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
  background: #d4756f !important;
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

.input-node.answered .handle {
  background: #8bc34a !important;
}

.input-node:hover .handle {
  opacity: 1;
}

.handle:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.25);
}

.input-node.answered .handle:hover {
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.25);
}

:deep(.vue-flow__handle-connecting),
:deep(.vue-flow__handle-valid) {
  opacity: 1 !important;
  background: #66bb6a !important;
  box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.3) !important;
  transform: scale(1.2) !important;
}
</style>
