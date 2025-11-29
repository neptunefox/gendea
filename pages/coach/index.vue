<template>
  <div class="coach-dashboard">
    <div class="coach-layout">
      <header class="dashboard-header">
        <h1>Active projects</h1>
        <p class="subtitle">Ideas you're actively building</p>
      </header>

      <div v-if="isLoading" class="loading-state">
        <Loader :size="32" class="spin" />
        <p>Loading projects...</p>
      </div>

      <div v-else-if="activeProjects.length === 0" class="empty-state">
        <div class="empty-icon">🔨</div>
        <h2>No active projects yet</h2>
        <p>Mark an idea as "Building" to start working on it with research-backed tools.</p>
        <router-link to="/" class="primary-btn"> Browse your ideas → </router-link>
      </div>

      <div v-else class="projects-grid">
        <div
          v-for="project in activeProjects"
          :key="project.id"
          class="project-card"
          @click="navigateToProject(project)"
        >
          <div class="project-header">
            <h3>{{ project.text }}</h3>
            <div class="project-badge">Building</div>
          </div>

          <div v-if="project.testCommitment" class="project-status">
            <div class="status-icon">📅</div>
            <div class="status-content">
              <p class="status-label">Test scheduled</p>
              <p class="status-detail">{{ project.testCommitment.when }}</p>
            </div>
          </div>

          <div v-else class="project-status">
            <div class="status-icon">🎯</div>
            <div class="status-content">
              <p class="status-label">Ready to commit</p>
              <p class="status-detail">Set up your first test</p>
            </div>
          </div>

          <div class="project-footer">
            <span class="project-date">Started {{ formatDate(project.createdAt) }}</span>
            <span class="project-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface SavedIdea {
  id: string
  text: string
  status: 'exploring' | 'ready' | 'building' | 'done'
  createdAt: string
  testCommitment?: {
    description: string
    when: string
    where: string
    successSignal: string
    committedAt: string
  }
  lastActiveView?: 'coach' | 'canvas'
}

const router = useRouter()
const activeProjects = ref<SavedIdea[]>([])
const isLoading = ref(true)

function navigateToProject(project: SavedIdea) {
  const view = project.lastActiveView || 'coach'
  if (view === 'canvas') {
    router.push(`/canvas/${project.id}`)
  } else {
    router.push(`/coach/${project.id}`)
  }
}

async function loadActiveProjects() {
  try {
    const { ideas } = await $fetch<{ ideas: SavedIdea[] }>('/api/saved-ideas')
    activeProjects.value = ideas.filter(idea => idea.status === 'building')
  } catch (error) {
    console.error('Failed to load active projects:', error)
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadActiveProjects()
})
</script>

<style scoped>
.coach-dashboard {
  min-height: 100vh;
  background: var(--color-bg);
  padding: var(--space-8) var(--space-6);
}

.coach-layout {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.dashboard-header {
  text-align: center;
}

.dashboard-header h1 {
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-2) 0;
}

.subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-12) var(--space-6);
  color: var(--color-text-secondary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  padding: var(--space-12) var(--space-6);
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.empty-state h2 {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  margin: 0;
}

.empty-state p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  max-width: 400px;
  margin: 0;
  line-height: 1.6;
}

.primary-btn {
  padding: var(--space-3) var(--space-5);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--weight-semibold);
  font-size: var(--text-base);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
  text-decoration: none;
  display: inline-block;
}

.primary-btn:hover {
  background: var(--color-primary-hover);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-5);
}

.project-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.project-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.project-header h3 {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.project-badge {
  background: var(--color-primary);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  white-space: nowrap;
}

.project-status {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.status-icon {
  font-size: 1.5rem;
}

.status-content {
  flex: 1;
}

.status-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-1) 0;
}

.status-detail {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.project-date {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.project-arrow {
  font-size: var(--text-xl);
  color: var(--color-primary);
  transition: transform var(--duration-fast) var(--ease-out);
}

.project-card:hover .project-arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .coach-dashboard {
    padding: var(--space-5) var(--space-4) var(--space-8);
  }

  .dashboard-header h1 {
    font-size: var(--text-2xl);
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
