<template>
  <div class="reference-class-tool">
    <p class="tool-intro">How long do similar projects typically take?</p>

    <div v-if="isLoading" class="tool-loading">
      <Loader :size="20" class="spin" />
      <p>Checking base rates...</p>
    </div>

    <div v-else-if="baseRates" class="base-rates">
      <div class="rate-item">
        <span class="rate-label">Time to first milestone:</span>
        <span class="rate-value">{{ baseRates.timeToMilestone }}</span>
      </div>
      <div class="rate-item">
        <span class="rate-label">Typical pivots needed:</span>
        <span class="rate-value">{{ baseRates.pivots }}</span>
      </div>
      <div class="rate-item">
        <span class="rate-label">Success rate:</span>
        <span class="rate-value">{{ baseRates.successRate }}</span>
      </div>
    </div>

    <button v-else class="load-btn" @click="loadBaseRates">Load base rates</button>

    <div class="tool-footer">
      <p class="tool-research">
        Research: Outside-view forecasting (reference class) reduces planning fallacy and improves
        predictions.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader } from 'lucide-vue-next'
import { ref } from 'vue'

interface SavedIdea {
  id: string
  text: string
}

const props = defineProps<{
  idea: SavedIdea
}>()

interface BaseRates {
  timeToMilestone: string
  pivots: string
  successRate: string
}

const baseRates = ref<BaseRates | null>(null)
const isLoading = ref(false)

async function loadBaseRates() {
  isLoading.value = true
  try {
    const response = await $fetch<{ baseRates: BaseRates }>('/api/coach', {
      method: 'POST',
      body: {
        mode: 'reference-class',
        idea: props.idea.text
      }
    })
    baseRates.value = response.baseRates
  } catch (error) {
    console.error('Failed to load base rates:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reference-class-tool {
  padding-top: var(--space-4);
}

.tool-intro {
  font-size: var(--text-base);
  color: var(--color-text);
  margin: 0 0 var(--space-4) 0;
  line-height: 1.6;
  font-weight: var(--weight-medium);
}

.tool-loading {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.base-rates {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.rate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.rate-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.rate-value {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.load-btn {
  width: 100%;
  padding: var(--space-3);
  background: var(--color-primary-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.load-btn:hover {
  background: var(--color-primary-ring);
  border-color: var(--color-primary);
}

.tool-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
}

.tool-research {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: 1.5;
  font-style: italic;
}
</style>
