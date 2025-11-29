<template>
  <div class="oracle-page">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-pulse" />
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="retry">Try again</button>
    </div>

    <template v-else>
      <OracleChat
        v-if="sessionId"
        :session-id="sessionId"
        :initial-idea-text="ideaContext"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import OracleChat from '~/components/OracleChat.vue'

const route = useRoute()

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

onMounted(async () => {
  const ideaId = route.query.idea as string | undefined
  await createSession(ideaId)
})
</script>

<style scoped>
.oracle-page {
  min-height: 100vh;
  background: #1a1816;
  color: #e8e4e0;
  display: flex;
  flex-direction: column;
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-pulse {
  width: 8px;
  height: 8px;
  background: #6b6560;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.5);
  }
}

.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  color: #6b6560;
  text-align: center;
  padding: var(--space-8);
}

.error-state p {
  margin: 0;
  font-size: var(--text-base);
}

.retry-btn {
  padding: var(--space-3) var(--space-5);
  background: transparent;
  color: #e8e4e0;
  border: 1px solid #3d3835;
  border-radius: var(--radius-md);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.retry-btn:hover {
  border-color: #6b6560;
  background: rgba(255, 255, 255, 0.03);
}
</style>
