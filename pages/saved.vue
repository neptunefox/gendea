<template>
  <div class="saved-page">
    <header class="pinboard-hero">
      <div>
        <p class="hero-label">Pinboard</p>
        <h1>Keep sparks close until you’re ready to move.</h1>
        <p>
          Stick ideas like postcards—wander back when they call you. Filters stay light so you can
          jump straight in (Paradox of the Active User approved).
        </p>
      </div>
      <div class="hero-meta">
        <p>{{ ideas.length }} saved</p>
        <span>Goal-gradient friendly: watch the wall fill up.</span>
      </div>
    </header>

    <div class="filter-row">
      <div class="chip-cluster">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="['filter-chip', { active: selectedFilter === filter.value }]"
          @click="selectedFilter = filter.value"
        >
          {{ filter.label }}
          <span>{{ getCountFor(filter.value) }}</span>
        </button>
      </div>
      <NuxtLink to="/spark" class="new-btn">
        <Plus :size="18" />
        New idea
      </NuxtLink>
    </div>

    <div v-if="loading" class="loading">
      <Loader :size="32" class="spin" />
    </div>

    <div v-else-if="filteredIdeas.length === 0" class="empty">
      <Lightbulb :size="48" />
      <p>No ideas yet for this filter.</p>
      <NuxtLink to="/spark" class="empty-btn">Start Exploring</NuxtLink>
    </div>

    <div v-else class="pinboard-grid">
      <div
        v-for="(idea, index) in filteredIdeas"
        :key="idea.id"
        class="pin-card"
        :style="getPinStyle(index)"
        @click="handleCardClick(idea)"
      >
        <span class="pin-tack" />
        <p class="card-text">{{ idea.text }}</p>
        <div class="card-meta">
          <span class="status-pill" :style="{ backgroundColor: statusColors[idea.status] }">
            {{ idea.status }}
          </span>
          <span class="card-time">{{ formatTime(idea.createdAt) }}</span>
        </div>
        <div class="pin-actions">
          <button class="link-button" type="button" @click.stop="handleCardClick(idea)">
            {{ idea.status === 'exploring' ? 'Ideate' : 'Coach' }}
          </button>
          <button class="card-delete" type="button" @click.stop="handleDelete(idea.id)">
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, Lightbulb, Loader, Trash2 } from 'lucide-vue-next'

interface SavedIdea {
  id: string
  text: string
  source: string
  status: 'exploring' | 'ready' | 'building' | 'done'
  createdAt: string
}

const ideas = ref<SavedIdea[]>([])
const loading = ref(true)
const selectedFilter = ref<'all' | SavedIdea['status']>('all')

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Exploring', value: 'exploring' },
  { label: 'Ready', value: 'ready' },
  { label: 'Building', value: 'building' },
  { label: 'Done', value: 'done' }
]

const statusColors: Record<SavedIdea['status'], string> = {
  exploring: '#fde7ff',
  ready: '#fff0da',
  building: '#e9f8ec',
  done: '#e9edff'
}

const filteredIdeas = computed(() => {
  if (selectedFilter.value === 'all') return ideas.value
  return ideas.value.filter(idea => idea.status === selectedFilter.value)
})

const getCountFor = (filter: 'all' | SavedIdea['status']) => {
  if (filter === 'all') return ideas.value.length
  return ideas.value.filter(idea => idea.status === filter).length
}

onMounted(async () => {
  await fetchIdeas()
})

async function fetchIdeas() {
  loading.value = true
  try {
    const response = await $fetch<{ ideas: SavedIdea[] }>('/api/saved-ideas')
    ideas.value = response.ideas
  } catch (error) {
    console.error('Failed to fetch ideas:', error)
  } finally {
    loading.value = false
  }
}

function handleCardClick(idea: SavedIdea) {
  navigateTo(`/spark?explore=${encodeURIComponent(idea.text)}`)
}

async function handleDelete(ideaId: string) {
  if (!confirm('Delete this idea?')) return

  try {
    await $fetch(`/api/saved-ideas/${ideaId}`, { method: 'DELETE' })
    ideas.value = ideas.value.filter(i => i.id !== ideaId)
  } catch (error) {
    console.error('Failed to delete idea:', error)
  }
}

function getPinStyle(index: number) {
  const tilts = [-2.5, -1.5, 0, 1.5, 2.5]
  const rotation = tilts[index % tilts.length]
  return {
    transform: `rotate(${rotation}deg)`
  }
}

function formatTime(date: string) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.saved-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf2ff, #f9f6ee);
  padding: 2.5rem 1.5rem 3rem;
}

.pinboard-hero {
  max-width: 1000px;
  margin: 0 auto 2.5rem;
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.hero-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9b7455;
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
}

.pinboard-hero h1 {
  margin: 0;
  color: #2d2d2d;
}

.pinboard-hero p {
  margin: 0.75rem 0 0;
  color: #5b463a;
  line-height: 1.6;
}

.hero-meta {
  min-width: 220px;
  background: white;
  border-radius: 18px;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #7b5844;
  box-shadow: 0 12px 30px rgba(47, 24, 15, 0.08);
}

.filter-row {
  max-width: 1000px;
  margin: 0 auto 1.5rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.chip-cluster {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-chip {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.04);
  color: #5c4a42;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.filter-chip span {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.8rem;
}

.filter-chip.active {
  background: #f3d9ff;
  color: #673969;
}

.new-btn {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1.25rem;
  background: #d4756f;
  color: white;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 10px 25px rgba(212, 117, 111, 0.3);
}

.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  gap: 1rem;
  color: #999;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #d4756f;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
}

.pinboard-grid {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.pin-card {
  background: #fffdf6;
  border-radius: 18px;
  padding: 1.1rem;
  box-shadow: 0 18px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
}

.pin-card:hover {
  transform: translateY(-4px);
}

.pin-tack {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff7b9c;
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.card-text {
  margin: 0 0 0.75rem;
  color: #40312b;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.status-pill {
  text-transform: capitalize;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  color: #4f3f3a;
}

.card-time {
  color: #8a7566;
  font-size: 0.85rem;
}

.pin-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.link-button {
  border: none;
  background: none;
  font-weight: 600;
  color: #c0667f;
  cursor: pointer;
}

.card-delete {
  border: none;
  background: none;
  color: #b05b5b;
  cursor: pointer;
}

@media (max-width: 640px) {
  .pinboard-hero {
    flex-direction: column;
  }

  .filter-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .pin-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
