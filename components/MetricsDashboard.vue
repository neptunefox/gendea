<template>
  <div class="metrics-dashboard">
    <h1 class="dashboard-title">Metrics Dashboard</h1>

    <div v-if="loading" class="loading">Loading metrics...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="metrics-grid">
      <div class="metric-card">
        <h2>Acquisition</h2>
        <div class="metric-value">{{ metrics.acquisition.totalSeeds }}</div>
        <div class="metric-label">Total Seeds</div>
        <div class="metric-detail">{{ metrics.acquisition.reachedPlanning }}% reached planning</div>
        <div class="metric-detail">{{ metrics.acquisition.setDatePlace }}% set date & place</div>
      </div>

      <div class="metric-card">
        <h2>Execution</h2>
        <div class="metric-value">{{ metrics.execution.testsScheduled }}</div>
        <div class="metric-label">Tests Scheduled (7 days)</div>
        <div class="metric-detail">{{ metrics.execution.completionRate }}% completion rate</div>
        <div class="metric-detail">{{ metrics.execution.passRate }}% pass rate</div>
      </div>

      <div class="metric-card">
        <h2>Learning</h2>
        <div class="metric-value">
          {{ Number(metrics.learning.avgLessonsPerBranch || 0).toFixed(1) }}
        </div>
        <div class="metric-label">Avg Lessons per Branch</div>
        <div class="metric-detail">
          {{ metrics.learning.archiveViewsBeforePlanning || 0 }} archive views before planning
        </div>
      </div>

      <div class="metric-card">
        <h2>Motivation</h2>
        <div class="metric-value">{{ Number(metrics.motivation.avgEnergy || 0).toFixed(1) }}</div>
        <div class="metric-label">Avg Energy</div>
        <div class="metric-detail">
          Expectancy: {{ Number(metrics.motivation.avgExpectancy || 0).toFixed(1) }}
        </div>
        <div class="metric-detail">
          {{ metrics.motivation.noveltyInjections || 0 }} novelty injections
        </div>
      </div>

      <div class="metric-card">
        <h2>Quality</h2>
        <div class="metric-value">{{ metrics.quality.progressionRate }}%</div>
        <div class="metric-label">Seed to Test Rate</div>
        <div class="metric-detail">
          {{ metrics.quality.totalProgressed }} / {{ metrics.quality.totalSeeds }} ideas
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Metrics {
  acquisition: {
    totalSeeds: number
    reachedPlanning: number
    setDatePlace: number
  }
  execution: {
    testsScheduled: number
    completionRate: number
    passRate: number
    avgTimeToFirstResult: number
  }
  learning: {
    avgLessonsPerBranch: number
    archiveViewsBeforePlanning: number
  }
  motivation: {
    avgEnergy: number
    avgExpectancy: number
    sessionCount: number
    noveltyInjections: number
  }
  quality: {
    progressionRate: number
    totalSeeds: number
    totalProgressed: number
  }
}

const metrics = ref<Metrics>({
  acquisition: { totalSeeds: 0, reachedPlanning: 0, setDatePlace: 0 },
  execution: { testsScheduled: 0, completionRate: 0, passRate: 0, avgTimeToFirstResult: 0 },
  learning: { avgLessonsPerBranch: 0, archiveViewsBeforePlanning: 0 },
  motivation: { avgEnergy: 0, avgExpectancy: 0, sessionCount: 0, noveltyInjections: 0 },
  quality: { progressionRate: 0, totalSeeds: 0, totalProgressed: 0 }
})

const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const responses = await Promise.all([
      fetch('/api/metrics/acquisition'),
      fetch('/api/metrics/execution'),
      fetch('/api/metrics/learning'),
      fetch('/api/metrics/motivation'),
      fetch('/api/metrics/quality')
    ])

    const [acquisition, execution, learning, motivation, quality] = await Promise.all(
      responses.map(r => r.json())
    )

    metrics.value = {
      acquisition,
      execution,
      learning,
      motivation,
      quality
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load metrics'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.metrics-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #111827;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  font-size: 1.125rem;
}

.error {
  color: #dc2626;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metric-card h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.metric-detail {
  font-size: 0.875rem;
  color: #374151;
  padding: 0.25rem 0;
}
</style>
