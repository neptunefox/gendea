<template>
  <div class="exit-view">
    <div class="exit-header">
      <h2 class="exit-title">Find a New Route</h2>
      <p class="exit-subtitle">
        Your North Star remains the same. Let's explore different ways to get there.
      </p>
    </div>

    <div v-if="northStar" class="north-star-display">
      <strong>Your North Star:</strong>
      <p>{{ northStar }}</p>
    </div>

    <div v-if="loading" class="loading">
      <p>Generating alternative approaches...</p>
    </div>

    <div v-else-if="alternatives.length > 0" class="alternatives">
      <h3>Alternative Approaches</h3>
      <div class="alternatives-grid">
        <div
          v-for="(alt, index) in alternatives"
          :key="index"
          class="alternative-card"
          :class="{ selected: selectedIndex === index }"
          @click="selectedIndex = index"
        >
          <h4>{{ alt.title }}</h4>
          <p>{{ alt.description }}</p>
        </div>
      </div>

      <button
        class="select-button"
        :disabled="selectedIndex === null || processing"
        @click="handleSelectAlternative"
      >
        {{ processing ? 'Starting...' : 'Start This Approach' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  branchId: string
  northStar: string
  failedApproach?: string
}>()

const emit = defineEmits<{
  select: [{ alternative: { title: string; description: string }; branchId: string }]
  exit: []
}>()

interface Alternative {
  title: string
  description: string
}

const alternatives = ref<Alternative[]>([])
const selectedIndex = ref<number | null>(null)
const loading = ref(true)
const processing = ref(false)

onMounted(async () => {
  try {
    const response = (await $fetch('/api/action-crisis/alternatives', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        northStar: props.northStar,
        failedApproach: props.failedApproach
      }
    })) as { alternatives: Alternative[] }
    alternatives.value = response.alternatives
  } catch (error) {
    console.error('Failed to fetch alternatives:', error)
    alternatives.value = [
      {
        title: 'Simplified Version',
        description: 'Start with a much smaller, simpler version of the same goal'
      },
      {
        title: 'Different Angle',
        description: 'Approach the same goal from a completely different direction'
      },
      {
        title: 'Partner Up',
        description: 'Find someone to collaborate with who has complementary skills'
      }
    ]
  } finally {
    loading.value = false
  }
})

function handleSelectAlternative() {
  if (selectedIndex.value === null || processing.value) return

  processing.value = true
  const selected = alternatives.value[selectedIndex.value]
  emit('select', { alternative: selected, branchId: props.branchId })
}
</script>

<style scoped>
.exit-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.exit-header {
  text-align: center;
  margin-bottom: 2rem;
}

.exit-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.exit-subtitle {
  font-size: 1rem;
  color: #6b7280;
}

.north-star-display {
  padding: 1.5rem;
  background: #eff6ff;
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
  margin-bottom: 2rem;
}

.north-star-display strong {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #1e40af;
  margin-bottom: 0.5rem;
}

.north-star-display p {
  font-size: 1.125rem;
  color: #1e3a8a;
  margin: 0;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.alternatives h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

.alternatives-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.alternative-card {
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.alternative-card:hover {
  border-color: #3b82f6;
  background: #f9fafb;
}

.alternative-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.alternative-card h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.alternative-card p {
  font-size: 0.9375rem;
  color: #4b5563;
  margin: 0;
}

.select-button {
  width: 100%;
  padding: 0.875rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.select-button:hover:not(:disabled) {
  background: #059669;
}

.select-button:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>
