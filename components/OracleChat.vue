<template>
  <div class="oracle-chat">
    <div class="messages-container" ref="messagesContainer">
      <div class="messages-list">
        <OracleMessage
          v-for="message in messages"
          :key="message.id"
          :role="message.role"
          :content="message.content"
          :sparked-at="message.sparkedAt"
          @spark="() => handleSparkMessage(message)"
        />

        <div v-if="isLoading" class="loading-indicator">
          <Loader :size="20" class="spin" />
        </div>
      </div>
    </div>

    <div class="input-container">
      <div class="input-wrapper">
        <textarea
          ref="inputField"
          v-model="inputText"
          class="message-input"
          rows="1"
          placeholder="Share what's on your mind..."
          @keydown.enter.exact.prevent="handleSend"
        />
        <button
          class="send-btn"
          :disabled="!canSend || isLoading"
          @click="handleSend"
        >
          <Send :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader, Send } from 'lucide-vue-next'
import { ref, computed, watch, nextTick, onMounted } from 'vue'

import OracleMessage from '~/components/OracleMessage.vue'
import type { OracleMessage as OracleMessageType } from '~/types/oracle'

interface Props {
  sessionId: string
  initialIdeaText?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  spark: [question: string]
}>()

interface DisplayMessage {
  id: string
  role: 'user' | 'oracle'
  content: string
  sparkedAt?: string | null
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
      content: m.content,
      sparkedAt: m.sparkedAt ? String(m.sparkedAt) : null
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

async function handleSparkMessage(message: DisplayMessage) {
  try {
    await $fetch('/api/oracle/spark', {
      method: 'POST',
      body: { messageId: message.id }
    })

    message.sparkedAt = new Date().toISOString()
  } catch (error) {
    console.error('Failed to spark message:', error)
  }

  emit('spark', message.content)
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
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
  padding-bottom: 120px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.loading-indicator {
  display: flex;
  justify-content: flex-end;
  padding: var(--space-4);
  color: #A8A29E;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.input-container {
  position: fixed;
  bottom: 0;
  left: var(--nav-width);
  right: 0;
  padding: var(--space-4) var(--space-6);
  background: linear-gradient(transparent, #1C1917 20%);
}

.input-wrapper {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  gap: var(--space-2);
  background: #292524;
  border: 1px solid #3f3a36;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.input-wrapper:focus-within {
  border-color: #d4756f;
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  color: #FAFAF9;
  font-size: var(--text-base);
  font-family: inherit;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  line-height: 1.5;
  overflow-y: hidden;
  outline: none;
}

.message-input::placeholder {
  color: #A8A29E;
}

.send-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: #d4756f;
  color: white;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}

.send-btn:hover:not(:disabled) {
  background: #C26660;
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .messages-container {
    padding: var(--space-4);
    padding-bottom: 140px;
  }

  .input-container {
    left: 0;
    padding: var(--space-4);
    padding-bottom: calc(var(--space-4) + 64px);
  }
}
</style>
