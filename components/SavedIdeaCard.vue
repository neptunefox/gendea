<template>
  <div class="saved-idea-card">
    <div class="card-header">
      <div class="source-badge" :class="`source-${idea.source}`">
        <svg
          v-if="idea.source === 'ai'"
          class="badge-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <svg
          v-else-if="idea.source === 'branch'"
          class="badge-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <svg v-else class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        {{ sourceLabel }}
      </div>

      <button class="delete-button" @click="handleDelete">
        <svg class="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>

    <p class="idea-text">{{ idea.text }}</p>

    <div v-if="idea.isReadyToBuild" class="ready-indicator">
      <svg class="ready-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Ready to build</span>
    </div>

    <div class="card-footer">
      <span class="timestamp">{{ formattedDate }}</span>
      <div class="card-actions">
        <button class="action-btn explore-btn" @click="handleExplore">
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Explore
        </button>
        <button class="action-btn build-btn" @click="handleBuild">
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          Build
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SavedIdea {
  id: string
  text: string
  source: 'user' | 'ai' | 'branch'
  tags: string[]
  isReadyToBuild: number
  createdAt: string
}

const props = defineProps<{
  idea: SavedIdea
}>()

const emit = defineEmits<{
  explore: [idea: SavedIdea]
  build: [idea: SavedIdea]
  delete: [ideaId: string]
}>()

const sourceLabel = computed(() => {
  switch (props.idea.source) {
    case 'ai':
      return 'AI'
    case 'branch':
      return 'Branch'
    default:
      return 'You'
  }
})

const formattedDate = computed(() => {
  const date = new Date(props.idea.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

function handleExplore() {
  emit('explore', props.idea)
}

function handleBuild() {
  emit('build', props.idea)
}

function handleDelete() {
  if (confirm('Delete this idea?')) {
    emit('delete', props.idea.id)
  }
}
</script>

<style scoped>
.saved-idea-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 2px solid transparent;
}

.saved-idea-card:hover {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 12px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
  border-color: #667eea;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.source-ai {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #7c3aed;
}

.source-branch {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.source-user {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.badge-icon {
  width: 14px;
  height: 14px;
}

.delete-button {
  min-width: 32px;
  min-height: 32px;
  padding: 0.375rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-button:hover {
  background: #fee2e2;
  color: #dc2626;
}

.delete-icon {
  width: 18px;
  height: 18px;
}

.idea-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #111827;
  margin: 0;
  flex: 1;
}

.ready-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.ready-icon {
  width: 18px;
  height: 18px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.timestamp {
  font-size: 0.8125rem;
  color: #9ca3af;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.explore-btn {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.explore-btn:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  transform: translateY(-1px);
}

.build-btn {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.build-btn:hover {
  background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
  transform: translateY(-1px);
}

.action-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 640px) {
  .action-btn span {
    display: none;
  }

  .action-btn {
    padding: 0.5rem;
  }
}
</style>
