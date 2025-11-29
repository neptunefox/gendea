<template>
  <div class="test-phase">
    <div class="phase-header">
      <h2>Run your test</h2>
      <p class="phase-subtitle">Time to gather evidence</p>
    </div>

    <div class="commitment-display">
      <div class="commitment-icon">📅</div>
      <div class="commitment-content">
        <p class="commitment-label">Your commitment</p>
        <p class="commitment-text">
          <strong>{{ commitment.when }}</strong> at <strong>{{ commitment.where }}</strong>
        </p>
        <p class="commitment-description">{{ commitment.description }}</p>
        <p class="commitment-signal">Success signal: {{ commitment.successSignal }}</p>
      </div>
    </div>

    <div class="test-actions">
      <button class="primary-btn large" @click="markAsDone">✓ Mark as done</button>
      <button class="ghost-btn" @click="showReschedule = true">Reschedule</button>
    </div>

    <transition name="modal">
      <div v-if="showReschedule" class="modal-overlay" @click="showReschedule = false">
        <div class="modal-card" @click.stop>
          <h3>Reschedule test</h3>
          <p class="modal-hint">When will you do this instead?</p>

          <div class="form-group">
            <label>When?</label>
            <input v-model="newWhen" type="text" :placeholder="commitment.when" />
          </div>

          <div class="form-group">
            <label>Where?</label>
            <input v-model="newWhere" type="text" :placeholder="commitment.where" />
          </div>

          <div class="modal-actions">
            <button class="ghost-btn" @click="showReschedule = false">Cancel</button>
            <button class="primary-btn" :disabled="isSaving" @click="reschedule">
              {{ isSaving ? 'Saving...' : 'Reschedule' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TestCommitment {
  description: string
  when: string
  where: string
  successSignal: string
  committedAt: string
}

interface SavedIdea {
  id: string
  testCommitment?: TestCommitment
}

const props = defineProps<{
  idea: SavedIdea
  commitment: TestCommitment
}>()

const emit = defineEmits<{
  completed: []
}>()

const showReschedule = ref(false)
const newWhen = ref('')
const newWhere = ref('')
const isSaving = ref(false)

async function markAsDone() {
  try {
    await $fetch(`/api/saved-ideas/${props.idea.id}`, {
      method: 'PATCH',
      body: {
        testResult: {
          outcome: 'completed',
          completedAt: new Date().toISOString()
        }
      }
    })

    emit('completed')
  } catch (error) {
    console.error('Failed to mark as done:', error)
  }
}

async function reschedule() {
  if (!newWhen.value.trim() && !newWhere.value.trim()) return

  isSaving.value = true
  try {
    await $fetch(`/api/saved-ideas/${props.idea.id}`, {
      method: 'PATCH',
      body: {
        testCommitment: {
          ...props.commitment,
          when: newWhen.value.trim() || props.commitment.when,
          where: newWhere.value.trim() || props.commitment.where
        }
      }
    })

    showReschedule.value = false
    newWhen.value = ''
    newWhere.value = ''
    emit('completed')
  } catch (error) {
    console.error('Failed to reschedule:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.test-phase {
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

.commitment-display {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-8);
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-lg);
}

.commitment-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.commitment-content {
  flex: 1;
}

.commitment-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-2) 0;
}

.commitment-text {
  font-size: var(--text-lg);
  color: var(--color-text);
  margin: 0 0 var(--space-4) 0;
  font-weight: var(--weight-semibold);
}

.commitment-text strong {
  color: var(--color-primary);
}

.commitment-description {
  font-size: var(--text-base);
  color: var(--color-text);
  margin: 0 0 var(--space-3) 0;
  line-height: 1.6;
}

.commitment-signal {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.test-actions {
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

.ghost-btn:hover {
  background: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
}

.modal-card h3 {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-2) 0;
}

.modal-hint {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-6) 0;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.form-group input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: inherit;
  transition: all var(--duration-normal) var(--ease-out);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-6);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-slow) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
