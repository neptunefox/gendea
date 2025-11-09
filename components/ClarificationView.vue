<template>
  <div class="clarification-view">
    <div class="header">
      <h2>Clarify Your Path</h2>
      <p class="subtitle">Define your North Star and concrete steps</p>
    </div>

    <div class="clarification-grid">
      <NorthStarCard
        :branch-id="branchId"
        :north-star="northStar"
        @save="handleNorthStarSave"
        @update="handleNorthStarUpdate"
      />

      <LadderSteps
        :branch-id="branchId"
        :steps="ladderSteps"
        @save="handleStepSave"
        @update="handleStepUpdate"
        @swap="handleStepSwap"
      />
    </div>

    <div v-if="showAlternatives" class="alternatives-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Mars-Adjacent Alternatives</h3>
          <p class="modal-subtitle">Choose an alternative that points at the same North Star</p>
        </div>

        <div class="alternatives-list">
          <button
            v-for="(alt, index) in alternatives"
            :key="index"
            class="alternative-option"
            @click="selectAlternative(alt)"
          >
            <span class="option-number">{{ index + 1 }}</span>
            <span class="option-text">{{ alt }}</span>
          </button>
        </div>

        <button class="close-button" @click="closeAlternatives">Cancel</button>
      </div>
    </div>

    <div v-if="canProceed" class="proceed-section">
      <button class="proceed-button" @click="handleProceed">Continue to Planning →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { NorthStar, LadderStep } from '~/types/node'
import { useBranchContext } from '~/composables/useBranchContext'

interface Props {
  branchId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  proceed: []
}>()

const { context, fetchContext } = useBranchContext(props.branchId)

const northStar = ref<NorthStar | null>(null)
const ladderSteps = ref<LadderStep[]>([])
const showAlternatives = ref(false)
const alternatives = ref<string[]>([])
const swappingStepIndex = ref<number | null>(null)

const canProceed = computed(() => {
  return northStar.value !== null && ladderSteps.value.length >= 3
})

onMounted(async () => {
  await fetchContext()
  if (context.value) {
    northStar.value = context.value.northStar
    ladderSteps.value = context.value.ladderSteps
  }
})

async function handleNorthStarSave(text: string) {
  try {
    const response = await $fetch('/api/north-star', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        text
      }
    })
    northStar.value = response.northStar
  } catch (error) {
    console.error('Failed to save North Star:', error)
  }
}

async function handleNorthStarUpdate(text: string) {
  if (!northStar.value) return

  try {
    const response = await $fetch(`/api/north-star/${northStar.value.id}`, {
      method: 'PUT',
      body: { text }
    })
    northStar.value = response.northStar
  } catch (error) {
    console.error('Failed to update North Star:', error)
  }
}

async function handleStepSave(index: number, text: string) {
  try {
    const response = await $fetch('/api/ladder-steps', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        text,
        order: index
      }
    })
    ladderSteps.value.push(response.step)

    if (northStar.value && ladderSteps.value.length >= 3) {
      await $fetch('/api/workflow/transition', {
        method: 'POST',
        body: {
          branchId: props.branchId,
          event: { type: 'NORTH_STAR_PINNED' }
        }
      })
    }
  } catch (error) {
    console.error('Failed to save step:', error)
  }
}

async function handleStepUpdate(index: number, text: string) {
  const step = ladderSteps.value.find(s => s.order === index)
  if (!step) return

  try {
    const response = await $fetch(`/api/ladder-steps/${step.id}`, {
      method: 'PUT',
      body: { text }
    })
    const stepIndex = ladderSteps.value.findIndex(s => s.id === step.id)
    if (stepIndex !== -1) {
      ladderSteps.value[stepIndex] = response.step
    }
  } catch (error) {
    console.error('Failed to update step:', error)
  }
}

async function handleStepSwap(index: number) {
  if (!northStar.value) return

  swappingStepIndex.value = index

  try {
    const response = await $fetch('/api/alternatives', {
      method: 'POST',
      body: {
        branchId: props.branchId,
        northStar: northStar.value.text,
        currentStep: ladderSteps.value.find(s => s.order === index)?.text || ''
      }
    })
    alternatives.value = response.alternatives
    showAlternatives.value = true
  } catch (error) {
    console.error('Failed to fetch alternatives:', error)
  }
}

async function selectAlternative(text: string) {
  if (swappingStepIndex.value === null) return

  await handleStepUpdate(swappingStepIndex.value, text)
  closeAlternatives()
}

function closeAlternatives() {
  showAlternatives.value = false
  alternatives.value = []
  swappingStepIndex.value = null
}

function handleProceed() {
  emit('proceed')
}
</script>

<style scoped>
.clarification-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #6b7280;
  font-size: 1.125rem;
  margin: 0;
}

.clarification-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .clarification-grid {
    grid-template-columns: 1fr;
  }
}

.alternatives-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.modal-subtitle {
  color: #6b7280;
  margin: 0;
}

.alternatives-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.alternative-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.alternative-option:hover {
  background: #f3f4f6;
  border-color: #3b82f6;
}

.option-number {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
}

.option-text {
  flex: 1;
  color: #374151;
  line-height: 1.6;
}

.close-button {
  width: 100%;
  padding: 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.close-button:hover {
  background: #e5e7eb;
}

.proceed-section {
  text-align: center;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.proceed-button {
  padding: 1rem 2rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.proceed-button:hover {
  background: #059669;
}
</style>
