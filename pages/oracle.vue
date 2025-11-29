<template>
  <div class="oracle-page">
    <div v-if="isLoading" class="loading-state">
      <Loader :size="32" class="spin" />
      <p>Starting Oracle...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="retry">Try again</button>
    </div>

    <template v-else>
      <div class="oracle-header" v-if="ideaContext">
        <p class="idea-context">{{ ideaContext }}</p>
      </div>

      <OracleChat
        v-if="sessionId"
        :session-id="sessionId"
        :initial-idea-text="ideaContext"
        @spark="handleSpark"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { Loader } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OracleChat from '~/components/OracleChat.vue'

const route = useRoute()
const router = useRouter()

const sessionId = ref<string | null>(null)
const ideaContext = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const VISITOR_ID = 'default-visitor'

async function createSession(ideaId?: string) {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await $fetch<{ sessionId: string; ideaText?: string }>('/api/oracle/session', {
      method: 'POST',
      body: {
        visitorId: VISITOR_ID,
        ideaId: ideaId || undefined
      }
    })

    sessionId.value = response.sessionId
    ideaContext.value = response.ideaText || null
  } catch (err) {
    console.error('Failed to create Oracle session:', err)
    error.value = 'Could not start Oracle session.'
  } finally {
    isLoading.value = false
  }
}

function retry() {
  const ideaId = route.query.idea as string | undefined
  createSession(ideaId)
}

function handleSpark(question: string) {
  router.push({
    path: '/',
    query: { prefill: question }
  })
}

onMounted(async () => {
  const ideaId = route.query.idea as string | undefined
  await createSession(ideaId)
})
</script>

<style scoped>
.oracle-page {
  min-height: 100vh;
  background: #1C1917;
  color: #FAFAF9;
  display: flex;
  flex-direction: column;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: #A8A29E;
}

.loading-state p {
  margin: 0;
  font-size: var(--text-sm);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.oracle-header {
  padding: var(--space-6) var(--space-6) 0;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}

.idea-context {
  margin: 0;
  padding: var(--space-4);
  background: #292524;
  border-radius: var(--radius-lg);
  color: #A8A29E;
  font-size: var(--text-sm);
  line-height: 1.6;
  border-left: 3px solid #d4756f;
}

.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  color: #A8A29E;
  text-align: center;
  padding: var(--space-6);
}

.error-state p {
  margin: 0;
}

.retry-btn {
  padding: var(--space-2) var(--space-4);
  background: #d4756f;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.retry-btn:hover {
  background: #C26660;
}

@media (max-width: 768px) {
  .oracle-header {
    padding: var(--space-4) var(--space-4) 0;
  }
}
</style>
