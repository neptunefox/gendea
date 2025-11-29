<template>
  <div class="oracle-message" :class="[role, { sparked: !!sparkedAt }]">
    <div class="message-bubble">
      <p class="message-content">{{ content }}</p>
      <button
        v-if="role === 'oracle'"
        class="spark-btn"
        :class="{ sparked: !!sparkedAt }"
        @click="$emit('spark')"
      >
        <Sparkles :size="14" />
        {{ sparkedAt ? 'Sparked' : 'Spark →' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

interface Props {
  role: 'user' | 'oracle'
  content: string
  sparkedAt?: string | null
}

defineProps<Props>()

defineEmits<{
  spark: []
}>()
</script>

<style scoped>
.oracle-message {
  display: flex;
  animation: messageAppear var(--duration-normal) var(--ease-out);
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.oracle-message.user {
  justify-content: flex-start;
}

.oracle-message.oracle {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 85%;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.oracle-message.user .message-bubble {
  background: #292524;
  border-bottom-left-radius: var(--radius-sm);
}

.oracle-message.oracle .message-bubble {
  background: #3f3a36;
  border-bottom-right-radius: var(--radius-sm);
}

.message-content {
  margin: 0;
  color: #FAFAF9;
  font-size: var(--text-base);
  line-height: 1.6;
}

.spark-btn {
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: 1px solid #d4756f;
  border-radius: var(--radius-md);
  background: transparent;
  color: #d4756f;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.spark-btn:hover:not(.sparked) {
  background: rgba(212, 117, 111, 0.1);
  transform: translateY(-2px);
}

.spark-btn.sparked {
  border-color: #A8A29E;
  color: #A8A29E;
  cursor: default;
}

@media (max-width: 768px) {
  .message-bubble {
    max-width: 90%;
  }
}
</style>
