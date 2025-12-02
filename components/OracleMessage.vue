<template>
  <div class="oracle-message" :class="role">
    <p class="message-content">{{ content }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  role: 'user' | 'oracle'
  content: string
}

defineProps<Props>()
</script>

<style scoped>
.oracle-message {
  animation: messageAppear var(--duration-slow) var(--ease-out);
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.oracle-message.user {
  padding-right: 20%;
}

.oracle-message.oracle {
  padding-left: 10%;
}

.message-content {
  margin: 0;
  line-height: 1.7;
}

.oracle-message.user .message-content {
  color: var(--color-text-tertiary);
  font-size: var(--text-base);
}

.oracle-message.oracle .message-content {
  color: var(--color-text);
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  text-shadow: 0 0 12px var(--color-glow-oracle);
}

@media (max-width: 768px) {
  .oracle-message.user {
    padding-right: 10%;
  }

  .oracle-message.oracle {
    padding-left: 5%;
  }
}
</style>
