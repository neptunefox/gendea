<template>
  <div class="archive-page">
    <h2>Learning Archive</h2>

    <section v-if="displayArchive" class="archive-content">
      <div class="section">
        <h3>Tests Conducted</h3>
        <ul v-if="displayArchive.tests.length > 0">
          <li v-for="(test, index) in displayArchive.tests" :key="index">
            <strong>{{ test.description }}</strong>
            <p>Metric: {{ test.metric }}</p>
            <p v-if="test.result">Result: {{ test.result }}</p>
          </li>
        </ul>
        <p v-else>No tests recorded</p>
      </div>

      <div class="section">
        <h3>Evidence</h3>
        <p class="evidence">{{ displayArchive.evidence || 'No evidence recorded' }}</p>
      </div>

      <div class="section">
        <h3>Advice to Future Self</h3>
        <p class="advice">{{ displayArchive.adviceToSelf }}</p>
      </div>
    </section>

    <div v-else class="loading">Loading archive...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Archive {
  id: string
  branchId: string
  tests: Array<{
    description: string
    metric: string
    result?: string
  }>
  evidence: string
  adviceToSelf: string
  createdAt: Date
}

const props = defineProps<{
  archive?: Archive | null
  branchId?: string
}>()

const fetchedArchive = ref<Archive | null>(null)

const displayArchive = computed(() => props.archive || fetchedArchive.value)

onMounted(async () => {
  if (!props.archive && props.branchId) {
    try {
      const response = await fetch(`/api/archive/${props.branchId}`)
      const data = (await response.json()) as { archive: Archive }
      fetchedArchive.value = data.archive
    } catch (error) {
      console.error('Failed to load archive:', error)
    }
  }
})
</script>

<style scoped>
.archive-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 2rem;
}

.archive-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}

.section h3 {
  margin-bottom: 1rem;
}

.section ul {
  list-style: none;
  padding: 0;
}

.section li {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
}

.section li p {
  margin: 0.5rem 0 0 0;
  color: #666;
}

.evidence,
.advice {
  white-space: pre-wrap;
  line-height: 1.6;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
