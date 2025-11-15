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

.commitment-display {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  background: white;
  border: 2px solid #d4756f;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(212, 117, 111, 0.15);
}

.commitment-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.commitment-content {
  flex: 1;
}

.commitment-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #d4756f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.commitment-text {
  font-size: 1.125rem;
  color: #40312b;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.commitment-text strong {
  color: #d4756f;
}

.commitment-description {
  font-size: 0.9375rem;
  color: #40312b;
  margin: 0 0 0.75rem 0;
  line-height: 1.6;
}

.commitment-signal {
  font-size: 0.875rem;
  color: #8a7566;
  margin: 0;
}

.test-actions {
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

.ghost-btn:hover {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.4);
  color: #d4756f;
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
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #40312b;
  margin: 0 0 0.5rem 0;
}

.modal-hint {
  font-size: 0.9375rem;
  color: #8a7566;
  margin: 0 0 1.5rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #40312b;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #f0e5e0;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #d4756f;
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
