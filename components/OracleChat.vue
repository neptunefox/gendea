<template>
  <div class="oracle-chat">
    <div ref="messagesContainer" class="messages-container">
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

        <OraclePendulum v-if="isLoading" :active="isLoading" />
      </div>
    </div>

    <div class="input-area">
      <div class="input-wrapper">
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
          <ArrowUp :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUp } from 'lucide-vue-next'
import { ref, computed, watch, nextTick, onMounted } from 'vue'

import OracleMessage from '~/components/OracleMessage.vue'
import OraclePendulum from '~/components/OraclePendulum.vue'
import { useSound } from '~/composables/useSound'
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

const { play: playSound } = useSound()

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

    playSound('whisper')

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
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
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
  min-height: 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding-top: var(--space-8);
  padding-bottom: 140px;
  min-height: 0;
  scrollbar-width: none;
}

.messages-container::-webkit-scrollbar {
  display: none;
}

.context-intro {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  margin-bottom: var(--space-8);
  position: relative;
}

.context-intro::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(126, 184, 201, 0.3), transparent);
}

.context-label {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-text-tertiary);
}

.context-text {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  font-weight: 400;
  font-style: italic;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.input-area {
  position: fixed;
  bottom: 0;
  left: var(--nav-width);
  right: 0;
  padding: var(--space-5) var(--space-6) var(--space-8);
  background: var(--color-bg);
  display: flex;
  justify-content: center;
}

.input-area::before {
  content: '';
  position: absolute;
  top: -30px;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(transparent, var(--color-bg));
  pointer-events: none;
}

.input-wrapper {
  position: relative;
  width: 100%;
  max-width: 520px;
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: var(--text-base);
  font-family: inherit;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  line-height: 1.6;
  overflow-y: hidden;
  outline: none;
  padding: var(--space-3) 0;
  border-bottom: 1px solid rgba(126, 184, 201, 0.2);
  transition: all 0.4s var(--ease-out);
}

.message-input:focus {
  border-color: var(--color-oracle);
  box-shadow: 0 4px 20px rgba(126, 184, 201, 0.1);
}

.message-input::placeholder {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.send-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s var(--ease-out);
  margin-bottom: var(--space-1);
}

.send-btn.ready {
  color: var(--color-oracle);
}

.send-btn:hover:not(:disabled) {
  color: var(--color-text);
  transform: translateY(-2px);
}

.send-btn:disabled {
  cursor: default;
}

@media (max-width: 768px) {
  .oracle-chat {
    padding: 0 var(--space-4);
  }

  .messages-container {
    padding-bottom: 140px;
  }

  .input-area {
    left: 0;
    padding-bottom: calc(var(--space-5) + 64px);
  }
}
</style>
