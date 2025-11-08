<template>
  <div class="constraint-toggles">
    <h3 class="title">Set Constraints</h3>
    <p class="subtitle">Choose constraints to frame your plans</p>

    <div class="toggles">
      <label class="toggle-item">
        <input v-model="localConstraints.timeCap" type="checkbox" @change="emitChange" />
        <span class="toggle-label">Time cap (1 hour)</span>
      </label>

      <label class="toggle-item">
        <input v-model="localConstraints.moneyCap" type="checkbox" @change="emitChange" />
        <span class="toggle-label">Money cap ($100)</span>
      </label>

      <label class="toggle-item">
        <input v-model="localConstraints.skillsOnHand" type="checkbox" @change="emitChange" />
        <span class="toggle-label">Skills on hand only</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Constraints {
  timeCap: boolean
  moneyCap: boolean
  skillsOnHand: boolean
}

const props = defineProps<{
  modelValue: Constraints
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Constraints]
}>()

const localConstraints = ref<Constraints>({ ...props.modelValue })

watch(
  () => props.modelValue,
  newValue => {
    localConstraints.value = { ...newValue }
  },
  { deep: true }
)

function emitChange() {
  emit('update:modelValue', { ...localConstraints.value })
}
</script>

<style scoped>
.constraint-toggles {
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.toggles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle-item input[type='checkbox'] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.toggle-label {
  font-size: 0.9375rem;
  color: #374151;
}
</style>
