<template>
  <div class="graveyard-page">
    <div class="mist-layer"></div>

    <header class="graveyard-hero">
      <p class="hero-label">Archives</p>
      <h1>Ideas at Rest</h1>
      <p>Resurrect past explorations from the beyond.</p>
    </header>

    <div v-if="threadsLoading" class="graveyard-state">
      <div class="loading-spirit"></div>
    </div>
    <div v-else-if="threadsError" class="graveyard-state error">{{ threadsError }}</div>
    <div v-else-if="threadCards.length === 0" class="graveyard-state">
      <p>The graveyard stands empty.</p>
      <p class="hint">Your explorations will be laid to rest here.</p>
    </div>
    <div v-else class="tombstone-grid">
      <article
        v-for="thread in threadCards"
        :key="thread.id"
        class="tombstone"
        @click="resumeThread(thread.id)"
      >
        <div class="tombstone-top"></div>
        <div class="tombstone-body">
          <div class="epitaph">
            <p class="thread-prompt">{{ thread.prompt }}</p>
          </div>
          <div class="tombstone-footer">
            <span class="death-date">{{ formatThreadDate(thread.createdAt) }}</span>
            <span class="idea-count">{{ thread.totalIdeas }} spirits</span>
          </div>
        </div>
        <button class="resurrect-btn" @click.stop="resumeThread(thread.id)">
          Resurrect
        </button>
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
    year: 'numeric'
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
.graveyard-page {
  min-height: 100vh;
  padding: var(--space-8) var(--space-6);
  position: relative;
  overflow: hidden;
}

.mist-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 100% 40% at 50% 100%, rgba(122, 117, 112, 0.15) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(122, 117, 112, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 80% 90%, rgba(122, 117, 112, 0.08) 0%, transparent 35%);
  animation: mistDrift 20s ease-in-out infinite;
}

@keyframes mistDrift {
  0%, 100% { opacity: 0.6; transform: translateX(0); }
  50% { opacity: 0.8; transform: translateX(-20px); }
}

.graveyard-hero {
  max-width: 600px;
  margin: 0 auto var(--space-8);
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-label {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  margin: 0 0 var(--space-3);
}

.graveyard-hero h1 {
  margin: 0 0 var(--space-3);
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.graveyard-hero > p {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: var(--text-base);
  font-style: italic;
}

.tombstone-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-6);
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.tombstone {
  position: relative;
  cursor: pointer;
  transition: transform var(--duration-normal) var(--ease-out);
}

.tombstone:hover {
  transform: translateY(-4px);
}

.tombstone-top {
  height: 40px;
  background: linear-gradient(180deg, var(--color-surface-raised) 0%, var(--color-surface) 100%);
  border-radius: 50% 50% 0 0 / 80% 80% 0 0;
  border: 1px solid var(--color-border-strong);
  border-bottom: none;
  position: relative;
}

.tombstone-top::after {
  content: '✦';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -30%);
  color: var(--color-text-tertiary);
  font-size: 12px;
  opacity: 0.6;
}

.tombstone-body {
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-raised) 100%);
  border: 1px solid var(--color-border-strong);
  border-top: none;
  padding: var(--space-5) var(--space-4);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(232, 228, 224, 0.03);
}

.tombstone:hover .tombstone-body {
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(122, 117, 112, 0.15),
    inset 0 1px 0 rgba(232, 228, 224, 0.05);
}

.epitaph {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-2) 0;
}

.thread-prompt {
  margin: 0;
  color: var(--color-text);
  font-size: var(--text-sm);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tombstone-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.death-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  letter-spacing: 0.02em;
}

.idea-count {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  opacity: 0.7;
}

.resurrect-btn {
  position: absolute;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.05em;
  cursor: pointer;
  opacity: 0;
  transition: all var(--duration-normal) var(--ease-out);
}

.tombstone:hover .resurrect-btn {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.resurrect-btn:hover {
  background: var(--color-primary);
  color: var(--color-bg);
  box-shadow: 0 0 20px var(--color-glow-amber);
}

.graveyard-state {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-tertiary);
  position: relative;
  z-index: 1;
}

.graveyard-state p {
  margin: 0;
  font-style: italic;
}

.graveyard-state.error {
  color: var(--color-error);
}

.graveyard-state .hint {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  opacity: 0.7;
}

.loading-spirit {
  width: 8px;
  height: 8px;
  background: var(--color-text-tertiary);
  border-radius: 50%;
  margin: 0 auto;
  animation: spiritFloat 2s ease-in-out infinite;
}

@keyframes spiritFloat {
  0%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mist-layer,
  .loading-spirit {
    animation: none;
  }
}

@media (max-width: 640px) {
  .graveyard-page {
    padding: var(--space-6) var(--space-4);
  }

  .graveyard-hero h1 {
    font-size: 1.5rem;
  }

  .tombstone-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--space-4);
  }

  .tombstone-body {
    min-height: 140px;
  }

  .resurrect-btn {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
