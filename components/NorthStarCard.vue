<template>
  <div class="north-star-card">
    <div class="card-header">
      <h3>⭐ North Star</h3>
      <span class="pinned-badge">Pinned</span>
    </div>

    <div v-if="!isEditing && northStar" class="north-star-display">
      <p class="north-star-text">{{ northStar.text }}</p>
      <button class="edit-button" @click="startEditing">Edit</button>
    </div>

    <div v-else-if="isEditing || !northStar" class="north-star-input">
      <label for="north-star-input">Why does this matter? (one line)</label>
      <input
        id="north-star-input"
        v-model="editText"
        type="text"
        placeholder="The core purpose or goal..."
        class="input-field"
        @keyup.enter="saveNorthStar"
      />
      <div class="button-group">
        <button class="save-button" :disabled="!canSave" @click="saveNorthStar">
          {{ northStar ? 'Update' : 'Pin North Star' }}
        </button>
        <button v-if="northStar" class="cancel-button" @click="cancelEditing">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { NorthStar } from '~/types/node'

interface Props {
  branchId: string
  northStar?: NorthStar | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [text: string]
  update: [text: string]
}>()

const isEditing = ref(false)
const editText = ref('')

const canSave = computed(() => editText.value.trim().length > 0)

watch(
  () => props.northStar,
  newValue => {
    if (newValue) {
      editText.value = newValue.text
    }
  },
  { immediate: true }
)

function startEditing() {
  isEditing.value = true
  editText.value = props.northStar?.text || ''
}

function cancelEditing() {
  isEditing.value = false
  editText.value = props.northStar?.text || ''
}

function saveNorthStar() {
  if (!canSave.value) return

  if (props.northStar) {
    emit('update', editText.value)
  } else {
    emit('save', editText.value)
  }

  isEditing.value = false
}
</script>

<style scoped>
.north-star-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  margin: 0;
}

.pinned-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.north-star-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.north-star-text {
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0;
}

.edit-button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.north-star-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.north-star-input label {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.9;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: border-color 0.2s;
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.input-field:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.save-button {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
