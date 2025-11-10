<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <h2>Something went wrong</h2>
      <p class="error-message">{{ error.message }}</p>
      <button class="retry-button" @click="retry">Try Again</button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const error = ref<Error | null>(null)

const retry = () => {
  error.value = null
  window.location.reload()
}

defineExpose({
  handleError: (e: Error) => {
    error.value = e
  }
})
</script>

<style scoped>
.error-boundary {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-message {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #2563eb;
}
</style>
