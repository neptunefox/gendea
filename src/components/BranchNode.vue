<template>
  <div :class="['branch-node', `branch-${type}`, { connecting: data.connecting, pruning: data.pruning }]">
    <div class="branch-header">
      <span class="branch-type">{{ type }}</span>
      <span class="branch-time">{{ formattedTime }}</span>
    </div>
    <div class="branch-body">
      {{ data.text }}
    </div>
    <div v-if="data.pruning" class="death-particles">
      <span class="particle">🎃</span>
      <span class="particle">👻</span>
      <span class="particle">💀</span>
      <span class="particle">🦇</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: Object,
  type: String
});

const formattedTime = computed(() => {
  if (!props.data.createdAt) return '';
  return new Date(props.data.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
});
</script>

<style scoped>
.branch-node {
  width: 240px;
  min-height: 100px;
  background: rgba(20, 20, 25, 0.95);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  position: relative;
  overflow: visible;
}

.branch-node:hover {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.branch-node.connecting {
  border-color: rgba(100, 150, 255, 0.8);
  box-shadow: 0 0 20px rgba(100, 150, 255, 0.4);
}

/* Halloween Death Animation */
.branch-node.pruning {
  animation: death-spin 1.5s ease-in-out forwards;
  border-color: rgba(255, 69, 0, 0.8) !important;
  box-shadow: 0 0 30px rgba(255, 69, 0, 0.6), 0 0 60px rgba(139, 0, 139, 0.4);
}

@keyframes death-spin {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  30% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.8;
  }
  60% {
    transform: scale(0.8) rotate(360deg);
    opacity: 0.5;
  }
  100% {
    transform: scale(0) rotate(720deg);
    opacity: 0;
  }
}

.death-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.particle {
  position: absolute;
  font-size: 24px;
  animation: particle-float 1.5s ease-out forwards;
  opacity: 0;
}

.particle:nth-child(1) {
  animation-delay: 0s;
  left: -40px;
  top: -40px;
}

.particle:nth-child(2) {
  animation-delay: 0.2s;
  left: 40px;
  top: -40px;
}

.particle:nth-child(3) {
  animation-delay: 0.4s;
  left: -40px;
  top: 40px;
}

.particle:nth-child(4) {
  animation-delay: 0.6s;
  left: 40px;
  top: 40px;
}

@keyframes particle-float {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(0.5);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx, 0), var(--ty, -100px)) rotate(360deg) scale(1.5);
    opacity: 0;
  }
}

.particle:nth-child(1) { --tx: -60px; --ty: -80px; }
.particle:nth-child(2) { --tx: 60px; --ty: -80px; }
.particle:nth-child(3) { --tx: -60px; --ty: 80px; }
.particle:nth-child(4) { --tx: 60px; --ty: 80px; }

.branch-seed {
  border-color: rgba(255, 122, 36, 0.5);
}

.branch-grow {
  border-color: rgba(100, 200, 150, 0.5);
}

.branch-test {
  border-color: rgba(100, 150, 255, 0.5);
}

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.6;
}

.branch-type {
  font-weight: 600;
}

.branch-time {
  font-size: 10px;
}

.branch-body {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}
</style>
