<template>
  <div class="oracle-chat">
    <div class="messages-container" ref="messagesContainer">
      <div v-if="initialIdeaText && messages.length === 0" class="context-intro">
        <p class="context-label">You're exploring</p>
        <p class="context-text">{{ initialIdeaText }}</p>
      </div>

      <div class="messages-list">
        <OracleMessage
          v-for="message in messages"
          :key="message.id"
          :role="message.role"
          :content="message.content"
        />

        <div v-if="isLoading" class="thinking-indicator">
          <span class="thinking-dot" />
          <span class="thinking-dot" />
          <span class="thinking-dot" />
        </div>
      </div>
    </div>

    <div class="input-area">
      <textarea
        ref="inputField"
        v-model="inputText"
        class="message-input"
        rows="1"
        placeholder="What's on your mind?"
        @keydown.enter.exact.prevent="handleSend"
      />
      <button
        class="send-btn"
        :class="{ ready: canSend && !isLoading }"
        :disabled="!canSend || isLoading"
        @click="handleSend"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M8 3l4 4M8 3L4 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

import OracleMessage from '~/components/OracleMessage.vue'
import type { OracleMessage as OracleMessageType } from '~/types/oracle'

interface Props {
  sessionId: string
  initialIdeaText?: string | null
}

const props = defineProps<Props>()

interface DisplayMessage {
  id: string
  role: 'user' | 'oracle'
  content: string
}

const messages = ref<DisplayMessage[]>([])
const inputText = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const inputField = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(() => inputText.value.trim().length > 0)

async function loadSession() {
  try {
    const response = await $fetch<{
      session: { id: string; ideaId?: string; createdAt: string }
      messages: OracleMessageType[]
      ideaText?: string
    }>(`/api/oracle/session/${props.sessionId}`)

    messages.value = response.messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content
    }))

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load session:', error)
  }
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  const tempId = `temp-${Date.now()}`
  messages.value.push({
    id: tempId,
    role: 'user',
    content: text
  })

  inputText.value = ''
  isLoading.value = true
  adjustInputHeight()

  await nextTick()
  scrollToBottom()

  try {
    const response = await $fetch<{ question: string; messageId: string }>('/api/oracle/message', {
      method: 'POST',
      body: {
        sessionId: props.sessionId,
        message: text
      }
    })

    messages.value.push({
      id: response.messageId,
      role: 'oracle',
      content: response.question
    })

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    messages.value = messages.value.filter(m => m.id !== tempId)
  } finally {
    isLoading.value = false
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function adjustInputHeight() {
  const field = inputField.value
  if (!field) return
  field.style.height = 'auto'
  const scrollHeight = field.scrollHeight
  const maxHeight = 120
  if (scrollHeight > maxHeight) {
    field.style.height = `${maxHeight}px`
    field.style.overflowY = 'auto'
  } else {
    field.style.height = `${scrollHeight}px`
    field.style.overflowY = 'hidden'
  }
}

watch(inputText, () => {
  nextTick(() => adjustInputHeight())
})

onMounted(async () => {
  await loadSession()
  await nextTick()
  adjustInputHeight()
  inputField.value?.focus()
})
</script>

<style scoped>
.oracle-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 580px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-6);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding-top: var(--space-8);
  padding-bottom: 100px;
}

.context-intro {
  text-align: center;
  padding: var(--space-8) 0;
  margin-bottom: var(--space-6);
  border-bottom: 1px solid #2d2926;
}

.context-label {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5c5754;
}

.context-text {
  margin: 0;
  font-size: var(--text-lg);
  color: #a8a29e;
  line-height: 1.5;
  font-style: italic;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.thinking-indicator {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: var(--space-6) 0;
}

.thinking-dot {
  width: 4px;
  height: 4px;
  background: #5c5754;
  border-radius: 50%;
  animation: think 1.4s ease-in-out infinite;
}

.thinking-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes think {
  0%, 80%, 100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}

.input-area {
  position: fixed;
  bottom: var(--space-8);
  left: var(--nav-width);
  right: 0;
  padding: var(--space-5) var(--space-6);
  background: #1a1816;
  display: flex;
  justify-content: center;
}

.input-area::before {
  content: '';
  position: absolute;
  top: -40px;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, #1a1816);
  pointer-events: none;
}

.message-input {
  width: 100%;
  max-width: 520px;
  border: none;
  background: transparent;
  color: #e8e4e0;
  font-size: var(--text-base);
  font-family: inherit;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  line-height: 1.6;
  overflow-y: hidden;
  outline: none;
  padding: var(--space-3) 0;
  border-bottom: 1px solid #2d2926;
  transition: border-color var(--duration-normal) var(--ease-out);
}

.message-input:focus {
  border-color: #5c5754;
}

.message-input::placeholder {
  color: #5c5754;
}

.send-btn {
  position: absolute;
  right: calc(50% - 280px);
  bottom: var(--space-5);
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #3d3835;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-normal) var(--ease-out);
}

.send-btn.ready {
  color: #e8e4e0;
}

.send-btn:hover:not(:disabled) {
  color: #e8e4e0;
}

.send-btn:disabled {
  cursor: default;
}

@media (max-width: 768px) {
  .oracle-chat {
    padding: 0 var(--space-4);
  }

  .messages-container {
    padding-bottom: 120px;
  }

  .input-area {
    left: 0;
    padding-bottom: calc(var(--space-5) + 64px);
  }

  .send-btn {
    right: var(--space-6);
  }
}
</style>
