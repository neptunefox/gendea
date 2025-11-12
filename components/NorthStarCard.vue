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

async function saveNorthStar() {
  if (!canSave.value) return

  if (props.northStar) {
    emit('update', editText.value)
  } else {
    emit('save', editText.value)

    await $fetch('/api/workflow/transition', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        event: { type: 'NORTH_STAR_PINNED' }
      }
    })
  }

  isEditing.value = false
}
</script>

<style scoped>
.north-star-card {
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
  margin: 0;
  color: #2f1810;
}

.pinned-badge {
  background: rgba(212, 117, 111, 0.15);
  color: #d4756f;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.north-star-display {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.north-star-text {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  color: #40312b;
}

.edit-button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: transparent;
  color: #c0667f;
  border: 1px solid rgba(212, 117, 111, 0.3);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.edit-button:hover {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.5);
}

.north-star-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.north-star-input label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #835872;
}

.input-field {
  width: 100%;
  padding: 0.75rem 0.85rem;
  font-size: 0.95rem;
  border: 1px solid rgba(212, 117, 111, 0.25);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #2f1810;
  transition: all 0.2s;
}

.input-field::placeholder {
  color: #9b7455;
}

.input-field:focus {
  outline: none;
  border-color: rgba(212, 117, 111, 0.5);
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.1);
}

.button-group {
  display: flex;
  gap: 0.65rem;
}

.save-button {
  padding: 0.65rem 1.25rem;
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(246, 113, 118, 0.25);
  font-size: 0.9rem;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(246, 113, 118, 0.35);
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-button {
  padding: 0.65rem 1.25rem;
  background: transparent;
  color: #835872;
  border: 1px solid rgba(212, 117, 111, 0.3);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.cancel-button:hover {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.5);
}
</style>
