<template>
  <div class="tree-canvas">
    <div class="capture-grid">
      <div class="problem-input">
        <label for="problem">What's the problem or wish?</label>
        <input
          id="problem"
          v-model="problemText"
          type="text"
          placeholder="Describe in one line..."
          class="problem-field"
        />
      </div>

      <div class="assumptions-section">
        <label>What are you assuming?</label>
        <div class="assumptions-grid">
          <input
            v-for="i in 3"
            :key="i"
            v-model="assumptions[i - 1]"
            type="text"
            :placeholder="`Assumption ${i}`"
            class="assumption-field"
          />
        </div>
      </div>

      <button class="save-button selected" :disabled="!canSave" @click="handleSave">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const problemText = ref('')
const assumptions = ref(['', '', ''])

const canSave = computed(() => problemText.value.trim().length > 0)

const emit = defineEmits<{
  save: [data: { problem: string; assumptions: string[] }]
}>()

const handleSave = () => {
  if (!canSave.value) return

  emit('save', {
    problem: problemText.value,
    assumptions: assumptions.value.filter(a => a.trim().length > 0)
  })
}
</script>

<style scoped>
.tree-canvas {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.capture-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.problem-input label,
.assumptions-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.problem-field {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: border-color 0.2s;
}

.problem-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.assumptions-grid {
  display: grid;
  gap: 0.75rem;
}

.assumption-field {
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  transition: border-color 0.2s;
}

.assumption-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.save-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: flex-start;
}

.save-button.selected {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.save-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.save-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>
