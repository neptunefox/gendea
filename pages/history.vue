<template>
  <div class="history-page">
    <header class="history-hero">
      <p class="hero-label">History</p>
      <h1>Your idea threads, ready to resume.</h1>
      <p>Pick up where you left off or review past sparks without hunting.</p>
    </header>

    <div v-if="threadsLoading" class="history-state">Loading threads…</div>
    <div v-else-if="threadsError" class="history-state error">{{ threadsError }}</div>
    <div v-else-if="threadCards.length === 0" class="history-state">
      <p>No threads saved yet.</p>
      <p class="hint">Generate in Ideas and they'll appear here automatically.</p>
    </div>
    <div v-else class="thread-list">
      <article
        v-for="thread in threadCards"
        :key="thread.id"
        class="thread-item"
        @click="resumeThread(thread.id)"
      >
        <div class="thread-main">
          <h3>{{ thread.prompt }}</h3>
          <p class="thread-meta">
            {{ formatThreadDate(thread.createdAt) }} · {{ thread.totalIdeas }} ideas
          </p>
        </div>
        <button class="resume-button" @click.stop="resumeThread(thread.id)">Resume</button>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface SparkRun {
  id: string
  prompt: string
  coreIdeas: Array<{ text: string }>
  createdAt: string
}

interface ThreadCard {
  id: string
  prompt: string
  createdAt: string
  totalIdeas: number
}

const threadCards = ref<ThreadCard[]>([])
const threadsLoading = ref(true)
const threadsError = ref<string | null>(null)

onMounted(async () => {
  await fetchThreads()
})

async function fetchThreads() {
  try {
    const data = await $fetch<{ runs: SparkRun[] }>('/api/spark-history')
    threadCards.value = data.runs.map(run => ({
      id: run.id,
      prompt: run.prompt,
      createdAt: run.createdAt,
      totalIdeas: run.coreIdeas?.length ?? 0
    }))
  } catch (e) {
    threadsError.value = e instanceof Error ? e.message : 'Failed to load idea threads'
  } finally {
    threadsLoading.value = false
  }
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
    path: '/',
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
  padding: 6rem 1.5rem 3rem;
}

.history-hero {
  margin-bottom: 3rem;
}

.hero-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9b7455;
  font-size: 0.75rem;
  margin: 0 0 0.5rem;
}

.history-hero h1 {
  margin: 0 0 0.75rem;
  color: #2b1610;
  font-size: 2rem;
}

.history-hero p {
  margin: 0;
  color: #5b463a;
  line-height: 1.6;
  max-width: 600px;
}

.thread-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.thread-item {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.thread-item:hover {
  background: rgba(192, 102, 127, 0.03);
}

.thread-main {
  flex: 1;
  min-width: 0;
}

.thread-item h3 {
  margin: 0 0 0.25rem;
  color: #2b1610;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-meta {
  margin: 0;
  font-size: 0.85rem;
  color: #a07c63;
}

.resume-button {
  border: none;
  background: transparent;
  color: #c0667f;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  opacity: 0;
}

.thread-item:hover .resume-button {
  opacity: 1;
}

.resume-button:hover {
  background: rgba(192, 102, 127, 0.1);
}

.history-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #7b7b7b;
}

.history-state.error {
  color: #c23b3b;
}

.history-state .hint {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #9b7b7b;
}

@media (max-width: 640px) {
  .history-page {
    padding: 1.5rem 1rem;
  }

  .history-hero h1 {
    font-size: 1.5rem;
  }

  .thread-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .thread-item h3 {
    white-space: normal;
  }

  .resume-button {
    align-self: flex-end;
  }
}
</style>
