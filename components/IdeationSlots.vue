<template>
  <div class="ideation-container">
    <h2 class="title">Generate Ideas</h2>
    <p class="subtitle">Fill at least 3 slots with your ideas</p>

    <div class="slots-grid">
      <div
        v-for="(slot, index) in slots"
        :key="index"
        class="idea-slot"
        :class="{ filled: slot.text.trim().length > 0, 'ai-slot': slot.isAI }"
      >
        <div class="slot-header">
          <span class="slot-number">{{ index + 1 }}</span>
          <span v-if="slot.isAI" class="ai-badge">AI</span>
        </div>

        <div v-if="slot.isAI && isGenerating" class="ai-loading">
          <div class="spinner" />
          <p>AI is generating ideas...</p>
        </div>

        <textarea
          v-else-if="!slot.isAI || showAI"
          v-model="slot.text"
          :placeholder="slot.isAI ? 'AI suggestion will appear here...' : 'Your idea...'"
          :disabled="slot.isAI"
          class="slot-input"
          rows="3"
        />

        <div v-else class="ai-hidden">
          <p>
            Fill {{ 3 - userFilledCount }} more slot{{ 3 - userFilledCount !== 1 ? 's' : '' }} to
            unlock AI suggestions
          </p>
        </div>
      </div>
    </div>

    <div class="progress-info">
      <p>{{ userFilledCount }} of 3 minimum slots filled</p>
    </div>

    <div v-if="showAI && allSlotsFilled" class="actions">
      <button class="incubation-button" @click="startIncubation">Take a Break</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface IdeaSlot {
  text: string
  isAI: boolean
}

const props = defineProps<{
  branchId: string
  problemText: string
}>()

const emit = defineEmits<{
  complete: [ideas: string[]]
  incubate: []
}>()

const slots = ref<IdeaSlot[]>([
  { text: '', isAI: false },
  { text: '', isAI: false },
  { text: '', isAI: false },
  { text: '', isAI: true },
  { text: '', isAI: true },
  { text: '', isAI: true }
])

const userFilledCount = computed(() => {
  return slots.value.filter(slot => !slot.isAI && slot.text.trim().length > 0).length
})

const showAI = computed(() => userFilledCount.value >= 3)
const aiGenerated = ref(false)
const isGenerating = ref(false)

const allSlotsFilled = computed(() => {
  return slots.value.every(slot => slot.text.trim().length > 0)
})

const startIncubation = () => {
  emit('incubate')
}

watch(showAI, async shouldShow => {
  if (shouldShow && !aiGenerated.value) {
    aiGenerated.value = true
    isGenerating.value = true
    await generateAIIdeas()
    isGenerating.value = false
    emit(
      'complete',
      slots.value.filter(s => !s.isAI).map(s => s.text)
    )
  }
})

const generateAIIdeas = async () => {
  const userIdeas = slots.value.filter(s => !s.isAI && s.text.trim().length > 0).map(s => s.text)

  try {
    const response = await $fetch<{ ideas: string[] }>('/api/diverge', {
      method: 'POST',
      body: {
        problem: props.problemText,
        userIdeas
      }
    })

    const aiSlots = slots.value.filter(s => s.isAI)
    response.ideas.forEach((idea, index) => {
      if (aiSlots[index]) {
        aiSlots[index].text = idea
      }
    })
  } catch (error) {
    console.error('Failed to generate AI ideas:', error)
  }
}
</script>

<style scoped>
.ideation-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 2rem;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.idea-slot {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
}

.idea-slot.filled {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.idea-slot.ai-slot {
  background-color: #faf5ff;
  border-color: #e9d5ff;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.slot-number {
  font-weight: 600;
  color: #6b7280;
}

.ai-badge {
  padding: 0.125rem 0.5rem;
  background-color: #a855f7;
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.slot-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
}

.slot-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.slot-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.ai-hidden {
  padding: 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
}

.progress-info {
  text-align: center;
  color: #6b7280;
  font-weight: 500;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.incubation-button {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.incubation-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  gap: 0.75rem;
}

.ai-loading p {
  color: #a855f7;
  font-size: 0.875rem;
  font-weight: 500;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e9d5ff;
  border-top-color: #a855f7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
