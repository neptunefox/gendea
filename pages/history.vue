<template>
  <div class="graveyard-page">
    <div class="mist-layer"></div>

    <header class="graveyard-hero">
      <p class="hero-label">Archives</p>
      <h1>Past Explorations</h1>
      <p class="hero-subtitle">Pick up where you left off</p>
      <div class="hero-divider">
        <span class="divider-line"></span>
        <span class="divider-symbol">✦</span>
        <span class="divider-line"></span>
      </div>
    </header>

    <div v-if="threadsLoading" class="graveyard-state">
      <div class="loading-spirit"></div>
    </div>
    <div v-else-if="threadsError" class="graveyard-state error">{{ threadsError }}</div>
    <div v-else-if="threadCards.length === 0" class="graveyard-state empty">
      <div class="empty-sigil">✦</div>
      <p>Nothing here yet</p>
      <p class="hint">Your past explorations will appear here</p>
      <div class="empty-divider">
        <span class="divider-line"></span>
        <span class="divider-dot"></span>
        <span class="divider-line"></span>
      </div>
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
            <span class="idea-count">{{ thread.totalIdeas }} ideas</span>
          </div>
        </div>
        <button class="resurrect-btn" @click.stop="resumeThread(thread.id)">Continue</button>
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
    radial-gradient(ellipse 100% 50% at 50% 100%, hsla(260, 15%, 50%, 0.1) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, hsla(260, 15%, 50%, 0.06) 0%, transparent 40%),
    radial-gradient(circle at 80% 90%, hsla(260, 15%, 50%, 0.05) 0%, transparent 35%);
  opacity: 0.6;
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
  letter-spacing: 0.2em;
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  margin: 0 0 var(--space-3);
}

.graveyard-hero h1 {
  margin: 0 0 var(--space-3);
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 400;
  letter-spacing: 0.03em;
}

.hero-subtitle {
  margin: 0 0 var(--space-5);
  color: var(--color-text-tertiary);
  font-size: var(--text-base);
  font-style: italic;
}

.hero-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.divider-line {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, hsla(200, 15%, 50%, 0.4), transparent);
}

.divider-symbol {
  color: var(--color-text-tertiary);
  font-size: 10px;
  opacity: 0.5;
}

.tombstone-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-8);
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.tombstone {
  position: relative;
  cursor: pointer;
  transition: all 0.4s var(--ease-out);
}

.tombstone:hover {
  transform: translateY(-8px);
}

.tombstone-top {
  height: 50px;
  background: linear-gradient(180deg, hsla(220, 18%, 16%, 0.95) 0%, hsla(220, 18%, 12%, 0.98) 100%);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  border: 2px solid hsla(200, 15%, 50%, 0.2);
  border-bottom: none;
  position: relative;
}

.tombstone-top::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 30px;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  border: 1px solid hsla(200, 15%, 50%, 0.15);
  border-bottom: none;
}

.tombstone-top::after {
  content: '✦';
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-tertiary);
  font-size: 10px;
  opacity: 0.4;
}

.tombstone-body {
  background: linear-gradient(180deg, hsla(220, 18%, 12%, 0.98) 0%, hsla(220, 18%, 15%, 0.95) 100%);
  border: 2px solid hsla(200, 15%, 50%, 0.2);
  border-top: none;
  padding: var(--space-6) var(--space-5);
  min-height: 180px;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    inset 0 0 60px hsla(200, 15%, 50%, 0.02);
}

.tombstone:hover .tombstone-body {
  border-color: hsla(200, 15%, 50%, 0.35);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 40px hsla(200, 15%, 50%, 0.1),
    inset 0 0 80px hsla(200, 15%, 50%, 0.03);
}

.tombstone:hover .tombstone-top {
  border-color: hsla(200, 15%, 50%, 0.35);
}

.epitaph {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-3) 0;
}

.thread-prompt {
  margin: 0;
  color: var(--color-text);
  font-size: var(--text-sm);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
}

.tombstone-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid hsla(200, 15%, 50%, 0.15);
}

.death-date {
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  letter-spacing: 0.05em;
}

.idea-count {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  opacity: 0.6;
}

.resurrect-btn {
  position: absolute;
  bottom: var(--space-5);
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  padding: var(--space-2) var(--space-5);
  background: transparent;
  color: var(--color-primary);
  border: 1px solid hsla(165, 75%, 58%, 0.4);
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: 400;
  letter-spacing: 0.08em;
  cursor: pointer;
  opacity: 0;
  transition: all 0.4s var(--ease-out);
}

.tombstone:hover .resurrect-btn {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.resurrect-btn:hover {
  background: hsla(165, 75%, 58%, 0.15);
  border-color: var(--color-primary);
  box-shadow: 0 0 25px hsla(165, 75%, 58%, 0.2);
}

.graveyard-state {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--color-text-tertiary);
  position: relative;
  z-index: 1;
}

.graveyard-state p {
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-style: italic;
}

.graveyard-state.error {
  color: var(--color-error);
}

.graveyard-state .hint {
  margin-top: var(--space-3);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  opacity: 0.6;
  font-style: normal;
}

.graveyard-state.empty {
  padding: var(--space-12) var(--space-4);
}

.empty-sigil {
  font-size: 2rem;
  color: var(--color-text-tertiary);
  opacity: 0.3;
  margin-bottom: var(--space-6);
  animation: sigilPulse 4s ease-in-out infinite;
}

@keyframes sigilPulse {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.1);
  }
}

.empty-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.empty-divider .divider-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, hsla(200, 15%, 50%, 0.3), transparent);
}

.empty-divider .divider-dot {
  width: 4px;
  height: 4px;
  background: var(--color-text-tertiary);
  border-radius: 50%;
  opacity: 0.3;
}

.loading-spirit {
  width: 6px;
  height: 6px;
  background: var(--color-text-tertiary);
  border-radius: 50%;
  margin: 0 auto;
  animation: spiritFloat 3s ease-in-out infinite;
  box-shadow: 0 0 15px hsla(200, 15%, 50%, 0.3);
}

@keyframes spiritFloat {
  0%,
  100% {
    opacity: 0.2;
    transform: translateY(0);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-15px);
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
    font-size: 1.75rem;
  }

  .tombstone-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-6);
  }

  .tombstone-body {
    min-height: 160px;
  }

  .resurrect-btn {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
