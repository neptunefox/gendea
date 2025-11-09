<template>
  <div class="ladder-steps">
    <div class="card-header">
      <h3>🪜 Ladder</h3>
      <span class="pinned-badge">Pinned</span>
    </div>

    <div class="steps-list">
      <div
        v-for="(step, index) in displaySteps"
        :key="step?.id || `empty-${index}`"
        class="step-item"
      >
        <div class="step-number">{{ index + 1 }}</div>

        <div v-if="editingIndex === index" class="step-input">
          <input
            v-model="editText"
            type="text"
            placeholder="Concrete step..."
            class="input-field"
            @keyup.enter="saveStep(index)"
          >
          <div class="button-group">
            <button class="save-button" :disabled="!canSave" @click="saveStep(index)">Save</button>
            <button class="cancel-button" @click="cancelEditing">Cancel</button>
          </div>
        </div>

        <div v-else-if="step" class="step-display">
          <p class="step-text">{{ step.text }}</p>
          <div class="step-actions">
            <button class="action-button" @click="startEditing(index, step.text)">Edit</button>
            <button class="action-button swap-button" @click="$emit('swap', index)">Swap</button>
          </div>
        </div>

        <div v-else class="step-empty">
          <button class="add-button" @click="startEditing(index, '')">+ Add step</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { LadderStep } from '~/types/node'

interface Props {
  branchId: string
  steps: LadderStep[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [index: number, text: string]
  update: [index: number, text: string]
  swap: [index: number]
}>()

const editingIndex = ref<number | null>(null)
const editText = ref('')

const displaySteps = computed(() => {
  const result: (LadderStep | null)[] = []
  for (let i = 0; i < 3; i++) {
    result.push(props.steps.find(s => s.order === i) || null)
  }
  return result
})

const canSave = computed(() => editText.value.trim().length > 0)

function startEditing(index: number, text: string) {
  editingIndex.value = index
  editText.value = text
}

function cancelEditing() {
  editingIndex.value = null
  editText.value = ''
}

function saveStep(index: number) {
  if (!canSave.value) return

  const existingStep = displaySteps.value[index]

  if (existingStep) {
    emit('update', index, editText.value)
  } else {
    emit('save', index, editText.value)
  }

  editingIndex.value = null
  editText.value = ''
}
</script>

<style scoped>
.ladder-steps {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
}

.pinned-badge {
  background: #e0e7ff;
  color: #4f46e5;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.step-number {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
}

.step-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-text {
  margin: 0;
  color: #374151;
  line-height: 1.6;
}

.step-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.action-button:hover {
  background: #e5e7eb;
}

.swap-button {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.swap-button:hover {
  background: #fde68a;
}

.step-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.save-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #2563eb;
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-button:hover {
  background: #e5e7eb;
}

.step-empty {
  flex: 1;
}

.add-button {
  width: 100%;
  padding: 0.75rem;
  background: #f9fafb;
  color: #6b7280;
  border: 2px dashed #d1d5db;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}
</style>
