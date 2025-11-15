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
  padding-top: 1rem;
}

.tool-intro {
  font-size: 0.9375rem;
  color: #40312b;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  font-weight: 500;
}

.tool-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  color: #8a7566;
  font-size: 0.875rem;
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
  gap: 0.75rem;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
}

.rate-label {
  font-size: 0.875rem;
  color: #8a7566;
}

.rate-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #40312b;
}

.load-btn {
  width: 100%;
  padding: 0.75rem;
  background: rgba(212, 117, 111, 0.1);
  border: 1px solid rgba(212, 117, 111, 0.25);
  border-radius: 8px;
  color: #d4756f;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-btn:hover {
  background: rgba(212, 117, 111, 0.15);
  border-color: rgba(212, 117, 111, 0.4);
}

.tool-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(212, 117, 111, 0.1);
}

.tool-research {
  font-size: 0.8125rem;
  color: #b8a89d;
  margin: 0;
  line-height: 1.5;
  font-style: italic;
}
</style>
