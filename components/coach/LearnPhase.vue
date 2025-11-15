<template>
  <div class="learn-phase">
    <div class="phase-header">
      <h2>What did you learn?</h2>
      <p class="phase-subtitle">Capture the evidence</p>
    </div>

    <div class="outcome-selector">
      <h3>What happened?</h3>
      <div class="outcome-buttons">
        <button
          class="outcome-btn"
          :class="{ selected: outcome === 'worked' }"
          @click="outcome = 'worked'"
        >
          <span class="outcome-icon">✓</span>
          <span class="outcome-label">Worked</span>
        </button>
        <button
          class="outcome-btn"
          :class="{ selected: outcome === 'didnt-work' }"
          @click="outcome = 'didnt-work'"
        >
          <span class="outcome-icon">✗</span>
          <span class="outcome-label">Didn't work</span>
        </button>
        <button
          class="outcome-btn"
          :class="{ selected: outcome === 'didnt-try' }"
          @click="outcome = 'didnt-try'"
        >
          <span class="outcome-icon">→</span>
          <span class="outcome-label">Didn't try</span>
        </button>
      </div>
    </div>

    <div v-if="outcome" class="learnings-form">
      <h3>What did you learn?</h3>
      <p class="section-hint">Optional but recommended</p>
      <textarea
        v-model="learnings"
        placeholder="What surprised you? What would you do differently? What's the next question?"
        rows="5"
      />
    </div>

    <div v-if="outcome" class="next-actions">
      <button class="primary-btn large" :disabled="isSaving" @click="saveAndNext">
        {{ isSaving ? 'Saving...' : 'Run another test →' }}
      </button>
      <button class="ghost-btn" :disabled="isSaving" @click="saveAndExplore">
        Back to exploring
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SavedIdea {
  id: string
}

const props = defineProps<{
  idea: SavedIdea
}>()

const emit = defineEmits<{
  next: [action: 'next-test' | 'back-to-exploring']
}>()

const outcome = ref<'worked' | 'didnt-work' | 'didnt-try' | null>(null)
const learnings = ref('')
const isSaving = ref(false)

async function saveResult(nextAction: 'next-test' | 'back-to-exploring') {
  if (!outcome.value) return

  isSaving.value = true
  try {
    await $fetch(`/api/saved-ideas/${props.idea.id}`, {
      method: 'PATCH',
      body: {
        testResult: {
          outcome: outcome.value,
          learnings: learnings.value.trim() || undefined,
          completedAt: new Date().toISOString()
        },
        testCommitment: null
      }
    })

    emit('next', nextAction)
  } catch (error) {
    console.error('Failed to save result:', error)
  } finally {
    isSaving.value = false
  }
}

function saveAndNext() {
  saveResult('next-test')
}

function saveAndExplore() {
  saveResult('back-to-exploring')
}
</script>

<style scoped>
.learn-phase {
  background: linear-gradient(135deg, #fefaf5 0%, #fef5f0 100%);
  border: 1px solid #f0e5e0;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.phase-header {
  margin-bottom: 2rem;
}

.phase-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #40312b;
  margin: 0 0 0.5rem 0;
}

.phase-subtitle {
  font-size: 1.0625rem;
  color: #8a7566;
  margin: 0;
}

.outcome-selector {
  margin-bottom: 2rem;
}

.outcome-selector h3,
.learnings-form h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #40312b;
  margin: 0 0 1rem 0;
}

.outcome-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.outcome-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: white;
  border: 2px solid #f0e5e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.outcome-btn:hover {
  border-color: #d4756f;
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.1);
}

.outcome-btn.selected {
  border-color: #d4756f;
  background: linear-gradient(135deg, #fff9f0 0%, #ffe8e0 100%);
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.2);
}

.outcome-icon {
  font-size: 2rem;
  font-weight: 700;
  color: #d4756f;
}

.outcome-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #40312b;
}

.learnings-form {
  margin-bottom: 2rem;
}

.section-hint {
  font-size: 0.875rem;
  color: #b8a89d;
  margin: -0.5rem 0 1rem 0;
}

.learnings-form textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #f0e5e0;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
}

.learnings-form textarea:focus {
  outline: none;
  border-color: #d4756f;
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.1);
}

.next-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.primary-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(246, 113, 118, 0.25);
  width: 100%;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(246, 113, 118, 0.35);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.primary-btn.large {
  font-size: 1.125rem;
  padding: 1.125rem 2rem;
}

.ghost-btn {
  padding: 0.875rem 1.25rem;
  background: transparent;
  border: 1px solid rgba(212, 117, 111, 0.25);
  border-radius: 10px;
  color: #8a7566;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.ghost-btn:hover:not(:disabled) {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.4);
  color: #d4756f;
}

.ghost-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .outcome-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
