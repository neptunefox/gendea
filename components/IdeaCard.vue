<template>
  <div class="idea-card" :class="{ saving: isSaving, saved: isSaved }">
    <div class="idea-content">
      <div v-if="idea.source === 'ai'" class="idea-badge">
        <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        AI
      </div>

      <p class="idea-text">{{ idea.text }}</p>

      <div v-if="idea.isReadyToBuild" class="ready-badge">
        <svg class="ready-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Ready to build
      </div>
    </div>

    <div class="idea-actions">
      <button
        v-if="!isSaved"
        class="action-button save-button"
        :disabled="isSaving"
        @click="handleSave"
      >
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        Save
      </button>

      <button v-if="!isSaved" class="action-button branch-button" @click="handleBranch">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        Branch
      </button>

      <button v-if="!isSaved" class="action-button dismiss-button" @click="handleDismiss">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div v-if="isSaved" class="saved-indicator">
        <svg class="saved-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Saved
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Idea {
  id?: string
  text: string
  source: 'user' | 'ai' | 'branch'
  isReadyToBuild?: boolean
}

const props = defineProps<{
  idea: Idea
}>()

const emit = defineEmits<{
  save: [idea: Idea]
  branch: [idea: Idea]
  dismiss: [idea: Idea]
}>()

const isSaving = ref(false)
const isSaved = ref(false)

async function handleSave() {
  isSaving.value = true
  await new Promise(resolve => setTimeout(resolve, 300))
  isSaved.value = true
  isSaving.value = false
  emit('save', props.idea)
}

function handleBranch() {
  emit('branch', props.idea)
}

function handleDismiss() {
  emit('dismiss', props.idea)
}
</script>

<style scoped>
.idea-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.idea-card:hover {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 12px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.idea-card.saving {
  opacity: 0.7;
}

.idea-card.saved {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.idea-content {
  margin-bottom: 1rem;
}

.idea-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #7c3aed;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.badge-icon {
  width: 14px;
  height: 14px;
}

.idea-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #111827;
  margin: 0;
}

.ready-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.75rem;
}

.ready-icon {
  width: 14px;
  height: 14px;
}

.idea-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-button {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.save-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  transform: translateY(-1px);
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.branch-button {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.branch-button:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  transform: translateY(-1px);
}

.dismiss-button {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.625rem;
  margin-left: auto;
}

.dismiss-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.action-icon {
  width: 18px;
  height: 18px;
}

.saved-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.saved-icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 640px) {
  .action-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .action-button span {
    display: none;
  }

  .dismiss-button {
    margin-left: auto;
  }
}
</style>
