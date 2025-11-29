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
    if (nextAction === 'next-test') {
      await $fetch(`/api/saved-ideas/${props.idea.id}`, {
        method: 'PATCH',
        body: {
          testCommitment: null,
          testResult: null
        }
      })
    } else {
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
    }

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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-sm);
}

.phase-header {
  margin-bottom: var(--space-8);
}

.phase-header h2 {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-2) 0;
}

.phase-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.outcome-selector {
  margin-bottom: var(--space-8);
}

.outcome-selector h3,
.learnings-form h3 {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-4) 0;
}

.outcome-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.outcome-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6) var(--space-4);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.outcome-btn:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.outcome-btn.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
  box-shadow: var(--shadow-md);
}

.outcome-icon {
  font-size: 2rem;
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
}

.outcome-label {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.learnings-form {
  margin-bottom: var(--space-8);
}

.section-hint {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin: calc(-1 * var(--space-2)) 0 var(--space-4) 0;
}

.learnings-form textarea {
  width: 100%;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-family: inherit;
  resize: vertical;
  transition: all var(--duration-normal) var(--ease-out);
}

.learnings-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.next-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.primary-btn {
  padding: var(--space-4) var(--space-8);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--weight-semibold);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  box-shadow: var(--shadow-md);
  width: 100%;
}

.primary-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-lg);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.primary-btn.large {
  font-size: var(--text-lg);
  padding: var(--space-4) var(--space-8);
}

.ghost-btn {
  padding: var(--space-3) var(--space-5);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  width: 100%;
}

.ghost-btn:hover:not(:disabled) {
  background: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
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
