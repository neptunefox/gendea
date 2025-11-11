<template>
  <div class="spark-container">
    <div class="spark-header">
      <h1 class="spark-title">What's on your mind?</h1>
      <p class="spark-subtitle">Share anything—vague, wild, or half-formed. Let's explore.</p>
    </div>

    <div class="input-wrapper">
      <textarea
        v-model="input"
        class="spark-textarea"
        placeholder="I want to learn to draw..."
        rows="3"
        @keydown.meta.enter="handleGenerate"
        @keydown.ctrl.enter="handleGenerate"
      />
      <div class="input-actions">
        <button
          class="generate-button"
          :disabled="!canGenerate || isGenerating"
          @click="handleGenerate"
        >
          <span v-if="isGenerating" class="button-content">
            <span class="spinner-small" />
            Exploring...
          </span>
          <span v-else class="button-content">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Generate Ideas
          </span>
        </button>
      </div>
    </div>

    <div v-if="showHint" class="keyboard-hint"><kbd>⌘</kbd> + <kbd>Enter</kbd> to generate</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  generate: [input: string]
}>()

const input = ref('')
const isGenerating = ref(false)
const showHint = computed(() => input.value.length > 10 && !isGenerating.value)

const canGenerate = computed(() => input.value.trim().length > 0)

function handleGenerate() {
  if (!canGenerate.value || isGenerating.value) return

  isGenerating.value = true
  emit('generate', input.value.trim())

  setTimeout(() => {
    isGenerating.value = false
  }, 2000)
}

defineExpose({
  reset: () => {
    input.value = ''
    isGenerating.value = false
  }
})
</script>

<style scoped>
.spark-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.spark-header {
  text-align: center;
  margin-bottom: 3rem;
}

.spark-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
  letter-spacing: -0.02em;
}

.spark-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.input-wrapper {
  position: relative;
  background: white;
  border-radius: 1.5rem;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 25px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  transition: box-shadow 0.3s ease;
}

.input-wrapper:focus-within {
  box-shadow:
    0 8px 12px rgba(102, 126, 234, 0.15),
    0 20px 40px rgba(102, 126, 234, 0.2);
}

.spark-textarea {
  width: 100%;
  border: none;
  outline: none;
  font-size: 1.125rem;
  line-height: 1.6;
  color: #111827;
  resize: none;
  font-family: inherit;
  min-height: 80px;
  background: transparent;
}

.spark-textarea::placeholder {
  color: #9ca3af;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.generate-button {
  min-width: 44px;
  min-height: 44px;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.icon {
  width: 20px;
  height: 20px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.keyboard-hint {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

kbd {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

@media (max-width: 640px) {
  .spark-container {
    padding: 2rem 1rem;
  }

  .spark-title {
    font-size: 2rem;
  }

  .spark-subtitle {
    font-size: 1rem;
  }
}
</style>
