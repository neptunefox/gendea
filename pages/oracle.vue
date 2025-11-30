<template>
  <div class="oracle-page">
    <FlowGuidanceBanner
      :visible="showGuidance && !ideaContext && sessionId !== null"
      message="Get unstuck by exploring your ideas through questions"
      hint="The Oracle asks questions to help you think deeper. Type your idea or question below."
      variant="oracle"
      @dismiss="dismissGuidance"
    />

    <div v-if="isLoading" class="loading-state">
      <div class="loading-pulse" />
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="retry">Try again</button>
    </div>

    <template v-else>
      <OracleChat v-if="sessionId" :session-id="sessionId" :initial-idea-text="ideaContext" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import FlowGuidanceBanner from '~/components/FlowGuidanceBanner.vue'
import OracleChat from '~/components/OracleChat.vue'

const route = useRoute()

const sessionId = ref<string | null>(null)
const ideaContext = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const showGuidance = ref(true)

const VISITOR_ID = 'default-visitor'
const GUIDANCE_DISMISSED_KEY = 'oracle-guidance-dismissed'

function dismissGuidance() {
  showGuidance.value = false
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(GUIDANCE_DISMISSED_KEY, 'true')
  }
}

function checkGuidanceDismissed() {
  if (typeof window !== 'undefined') {
    const dismissed = window.localStorage.getItem(GUIDANCE_DISMISSED_KEY)
    if (dismissed) {
      showGuidance.value = false
    }
  }
}

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
  checkGuidanceDismissed()
  const ideaId = route.query.idea as string | undefined
  await createSession(ideaId)
})
</script>

<style scoped>
.oracle-page {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  position: relative;
}

.oracle-page > :deep(.flow-guidance-banner) {
  position: fixed;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  max-width: 480px;
  width: calc(100% - var(--space-8));
}

.oracle-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 50% 30% at 50% 100%, rgba(126, 184, 201, 0.06) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(126, 184, 201, 0.03) 0%, transparent 40%);
  pointer-events: none;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
}

.loading-pulse {
  width: 6px;
  height: 6px;
  background: var(--color-oracle);
  border-radius: 50%;
  animation: oraclePulse 3s ease-in-out infinite;
  box-shadow: 0 0 30px var(--color-glow-teal);
}

@keyframes oraclePulse {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
    box-shadow: 0 0 20px var(--color-glow-teal);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.8);
    box-shadow: 0 0 40px var(--color-glow-teal);
  }
}

.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  color: var(--color-text-tertiary);
  text-align: center;
  padding: var(--space-8);
}

.error-state p {
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--text-base);
  font-style: italic;
}

.retry-btn {
  padding: var(--space-3) var(--space-6);
  background: transparent;
  color: var(--color-oracle);
  border: 1px solid rgba(126, 184, 201, 0.4);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 400;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.4s var(--ease-out);
}

.retry-btn:hover {
  border-color: var(--color-oracle);
  background: rgba(126, 184, 201, 0.1);
  box-shadow: 0 0 25px rgba(126, 184, 201, 0.15);
}
</style>
