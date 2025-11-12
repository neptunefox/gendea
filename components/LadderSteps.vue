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
          />
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
  background: linear-gradient(135deg, #fff6ef, #fdefff);
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(40, 18, 13, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2f1810;
  margin: 0;
}

.pinned-badge {
  background: rgba(212, 117, 111, 0.15);
  color: #d4756f;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.step-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.step-number {
  flex-shrink: 0;
  width: 1.85rem;
  height: 1.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.8rem;
  box-shadow: 0 2px 6px rgba(246, 113, 118, 0.3);
}

.step-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-text {
  margin: 0;
  color: #40312b;
  line-height: 1.6;
  font-size: 0.95rem;
}

.step-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.35rem 0.75rem;
  background: transparent;
  color: #c0667f;
  border: 1px solid rgba(212, 117, 111, 0.25);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.4);
}

.swap-button {
  background: rgba(255, 196, 87, 0.15);
  color: #9b5c00;
  border-color: rgba(255, 196, 87, 0.3);
}

.swap-button:hover {
  background: rgba(255, 196, 87, 0.25);
  border-color: rgba(255, 196, 87, 0.5);
}

.step-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.input-field {
  width: 100%;
  padding: 0.65rem 0.75rem;
  font-size: 0.9rem;
  border: 1px solid rgba(212, 117, 111, 0.25);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #2f1810;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: rgba(212, 117, 111, 0.5);
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.1);
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.save-button {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(246, 113, 118, 0.25);
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(246, 113, 118, 0.35);
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background: transparent;
  color: #835872;
  border: 1px solid rgba(212, 117, 111, 0.25);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.4);
}

.step-empty {
  flex: 1;
}

.add-button {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.6);
  color: #c0667f;
  border: 1px dashed rgba(212, 117, 111, 0.3);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.add-button:hover {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.5);
  color: #2f1810;
  color: #374151;
}
</style>
