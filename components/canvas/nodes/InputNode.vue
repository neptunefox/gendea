<template>
  <div class="input-node" :class="{ selected: props.selected, answered: hasAnswer }">
    <Handle type="target" :position="Position.Top" />
    
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
      <button class="submit-btn" @click="submitAnswer" :disabled="!answer.trim()">
        <Send :size="14" />
      </button>
    </div>

    <div v-else class="input-answer">
      <div class="answer-label">Answer:</div>
      <div class="answer-text">{{ props.data.answer }}</div>
      <button class="edit-btn" @click="editAnswer">Edit</button>
    </div>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { HelpCircle, Send } from 'lucide-vue-next'

const props = defineProps<NodeProps>()

const answer = ref('')

const hasAnswer = computed(() => !!props.data.answer)

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
  transition: all 0.2s ease;
}

.input-node:hover {
  box-shadow: 0 4px 16px rgba(212, 117, 111, 0.25);
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
  gap: 0.5rem;
}

.answer-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #f0e5e0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #40312b;
  background: white;
}

.answer-input:focus {
  outline: none;
  border-color: #d4756f;
}

.submit-btn {
  padding: 0.5rem;
  background: #d4756f;
  color: white;
  border: none;
  border-radius: 8px;
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
</style>
