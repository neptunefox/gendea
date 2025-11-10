<template>
  <div class="archives-page">
    <h1>Learning Archive</h1>

    <div v-if="loading" class="loading">Loading archives...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="archives.length === 0" class="empty">
      <p>No archived branches yet.</p>
      <p class="hint">Complete a branch to create your first archive entry.</p>
    </div>

    <div v-else class="archives-list">
      <ArchivePage
        v-for="archive in archives"
        :key="archive.id"
        :archive-id="archive.id"
        :branch-id="archive.branchId"
        :tests="archive.tests"
        :evidence="archive.evidence"
        :advice-to-self="archive.adviceToSelf"
        :created-at="archive.createdAt"
      />
    </div>
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

const archives = ref<Archive[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const response = await fetch('/api/archives')
    const data = (await response.json()) as { archives: Archive[] }
    archives.value = data.archives
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load archives'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.archives-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #111827;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 3rem;
  font-size: 1.125rem;
}

.error {
  color: #dc2626;
}

.empty {
  color: #6b7280;
}

.hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.archives-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
