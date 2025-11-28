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
  background: linear-gradient(135deg, #fff5f0 0%, #fef8f5 100%);
  padding: 6rem 1.5rem 4rem;
}

.coach-layout {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.dashboard-header {
  text-align: center;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #40312b;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 1.125rem;
  color: #8a7566;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: #8a7566;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #fefaf5 0%, #fef5f0 100%);
  border-radius: 16px;
  border: 1px solid #f0e5e0;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #40312b;
  margin: 0;
}

.empty-state p {
  font-size: 1rem;
  color: #8a7566;
  max-width: 400px;
  margin: 0;
  line-height: 1.6;
}

.primary-btn {
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(246, 113, 118, 0.25);
  text-decoration: none;
  display: inline-block;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(246, 113, 118, 0.35);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: linear-gradient(135deg, #fefaf5 0%, #fef5f0 100%);
  border: 1px solid #f0e5e0;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(212, 117, 111, 0.15);
  border-color: #d4756f;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.project-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #40312b;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.project-badge {
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.project-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(212, 117, 111, 0.1);
}

.status-icon {
  font-size: 1.5rem;
}

.status-content {
  flex: 1;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #40312b;
  margin: 0 0 0.25rem 0;
}

.status-detail {
  font-size: 0.875rem;
  color: #8a7566;
  margin: 0;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(212, 117, 111, 0.1);
}

.project-date {
  font-size: 0.8125rem;
  color: #b8a89d;
}

.project-arrow {
  font-size: 1.25rem;
  color: #d4756f;
  transition: transform 0.2s ease;
}

.project-card:hover .project-arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .coach-dashboard {
    padding: 1.5rem 1rem 3rem;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
