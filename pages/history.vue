<template>
  <div class="history-page">
    <header class="history-hero">
      <div>
        <p class="hero-label">History</p>
        <h1>Threads and builds stay traceable.</h1>
        <p>
          Idea runs live beside build lessons so you can resume a spark or review evidence without
          hunting. Goal-gradient effect: you always see how far you’ve come.
        </p>
      </div>
      <div class="hero-meta">
        <p>{{ archives.length }} lesson{{ archives.length === 1 ? '' : 's' }}</p>
        <span
          >{{ threadCards.length }} journal thread{{ threadCards.length === 1 ? '' : 's' }}</span
        >
      </div>
    </header>

    <section class="thread-section">
      <div class="thread-head">
        <div>
          <p class="thread-label">Idea threads</p>
          <h2>Return to a saved run any time.</h2>
        </div>
        <button class="thread-button" @click="navigateTo('/spark')">Open journal</button>
      </div>
      <div v-if="threadsLoading" class="history-state substate">Loading threads…</div>
      <div v-else-if="threadsError" class="history-state error substate">{{ threadsError }}</div>
      <div v-else-if="threadCards.length === 0" class="history-state substate">
        <p>No threads saved yet.</p>
        <p class="hint">Generate in Ideas and they’ll appear here automatically.</p>
      </div>
      <template v-else>
        <div class="thread-grid">
          <article v-for="thread in threadCards" :key="thread.id" class="thread-card">
            <p class="thread-date">{{ formatThreadDate(thread.createdAt) }}</p>
            <h3>{{ thread.prompt }}</h3>
            <ul>
              <li v-for="idea in thread.previewIdeas" :key="idea">{{ idea }}</li>
            </ul>
            <button class="thread-link" @click="resumeThread(thread.id)">Resume this run</button>
          </article>
        </div>
      </template>
    </section>

    <div v-if="loading" class="history-state">Loading history…</div>
    <div v-else-if="error" class="history-state error">{{ error }}</div>
    <div v-else-if="archives.length === 0" class="history-state">
      <p>No build notes yet.</p>
      <p class="hint">Finish a branch in Build mode to capture the first lesson.</p>
    </div>

    <ol v-else class="history-timeline">
      <li v-for="archive in archives" :key="archive.id">
        <div class="timeline-dot" />
        <div class="timeline-card">
          <div class="card-head">
            <div>
              <p class="card-date">{{ formatDate(archive.createdAt) }}</p>
              <h2>{{ archive.adviceToSelf || 'Untitled branch' }}</h2>
            </div>
            <span class="card-tag"
              >{{ archive.tests.length }} test{{ archive.tests.length === 1 ? '' : 's' }}</span
            >
          </div>
          <p class="card-copy">{{ archive.evidence }}</p>

          <div v-if="archive.tests.length" class="tests">
            <div v-for="(test, index) in archive.tests" :key="index" class="test-item">
              <p class="test-metric">{{ test.metric }}</p>
              <p class="test-description">{{ test.description }}</p>
              <p v-if="test.result" class="test-result">Outcome: {{ test.result }}</p>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Archive {
  id: string
  branchId: string
  tests: Array<{ description: string; metric: string; result?: string }>
  evidence: string
  adviceToSelf: string
  createdAt: string
}

interface SparkRun {
  id: string
  prompt: string
  coreIdeas: Array<{ text: string }>
  createdAt: string
}

const archives = ref<Archive[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
interface ThreadCard {
  id: string
  prompt: string
  createdAt: string
  previewIdeas: string[]
}

const threadCards = ref<ThreadCard[]>([])
const threadsLoading = ref(true)
const threadsError = ref<string | null>(null)

onMounted(async () => {
  await Promise.all([fetchArchives(), fetchThreads()])
})

async function fetchArchives() {
  try {
    const data = await $fetch<{ archives: Archive[] }>('/api/archives')
    archives.value = data.archives
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load history'
  } finally {
    loading.value = false
  }
}

async function fetchThreads() {
  try {
    const data = await $fetch<{ runs: SparkRun[] }>('/api/spark-history')
    threadCards.value = data.runs.map(run => ({
      id: run.id,
      prompt: run.prompt,
      createdAt: run.createdAt,
      previewIdeas: run.coreIdeas?.slice(0, 3).map(idea => idea.text) ?? []
    }))
  } catch (e) {
    threadsError.value = e instanceof Error ? e.message : 'Failed to load idea threads'
  } finally {
    threadsLoading.value = false
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatThreadDate(value: string) {
  return new Date(value).toLocaleString('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
}

function resumeThread(id: string) {
  navigateTo({
    path: '/spark',
    query: {
      resume: id
    }
  })
}
</script>

<style scoped>
.history-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem;
}

.history-hero {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}

.hero-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9b7455;
  font-size: 0.8rem;
}

.history-hero h1 {
  margin: 0.25rem 0 0.75rem;
  color: #2b1610;
}

.history-hero p {
  margin: 0;
  color: #5b463a;
  line-height: 1.6;
}

.hero-meta {
  min-width: 220px;
  background: #fff8f1;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  padding: 1rem;
  color: #7b5844;
}

.thread-section {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: #fff8f1;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 15px 35px rgba(47, 24, 15, 0.08);
}

.thread-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.thread-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #aa7a5f;
  margin: 0 0 0.35rem;
}

.thread-button {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  background: #f6c1ff;
  color: #6d256f;
  font-weight: 600;
  cursor: pointer;
}

.thread-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.thread-card {
  background: white;
  border-radius: 18px;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.thread-date {
  margin: 0;
  font-size: 0.85rem;
  color: #a07c63;
}

.thread-card h3 {
  margin: 0;
  color: #3a1f18;
  font-size: 1.05rem;
}

.thread-card ul {
  list-style: disc;
  margin: 0 0 0 1rem;
  padding: 0;
  color: #5d4032;
}

.thread-link {
  align-self: flex-start;
  border: none;
  background: none;
  color: #c0667f;
  font-weight: 600;
  cursor: pointer;
}

.history-state {
  text-align: center;
  padding: 4rem 1rem;
  color: #7b7b7b;
}

.history-state.error {
  color: #c23b3b;
}

.history-state.substate {
  padding: 2rem 1rem;
}

.history-state .hint {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.history-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 2px solid rgba(0, 0, 0, 0.08);
}

.history-timeline li {
  position: relative;
  padding-left: 2.5rem;
  margin-bottom: 2rem;
}

.timeline-dot {
  position: absolute;
  left: -7px;
  top: 14px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f6af7f, #ec6ad6);
  box-shadow: 0 0 0 4px rgba(236, 106, 214, 0.15);
}

.timeline-card {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  box-shadow: 0 12px 30px rgba(47, 24, 15, 0.08);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-date {
  margin: 0;
  font-weight: 600;
  color: #a07c63;
}

.card-head h2 {
  margin: 0.25rem 0 0;
  font-size: 1.3rem;
  color: #2f150f;
}

.card-tag {
  background: #f0f4ff;
  color: #465a9c;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-copy {
  margin: 0 0 1rem;
  color: #4a3830;
  line-height: 1.5;
}

.tests {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.test-item {
  background: #f9f9fb;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.test-metric {
  margin: 0;
  font-weight: 600;
  color: #39466f;
}

.test-description,
.test-result {
  margin: 0.25rem 0 0;
  color: #5c4a42;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .history-page {
    padding: 2rem 1rem;
  }

  .history-timeline {
    border-left: none;
  }

  .history-timeline li {
    padding-left: 0;
  }

  .timeline-dot {
    display: none;
  }
}
</style>
