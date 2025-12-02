<template>
  <div class="oracle-pendulum" :class="{ active, reduced: reducedMotion }">
    <div class="pendulum-arm">
      <div class="pendulum-bob" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  active: boolean
}

defineProps<Props>()

const reducedMotion = useReducedMotion()
</script>

<style scoped>
.oracle-pendulum {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: var(--space-8) 0;
  height: 60px;
}

.pendulum-arm {
  width: 2px;
  height: 40px;
  background: linear-gradient(
    to bottom,
    transparent,
    hsla(200, 70%, 72%, 0.3) 20%,
    hsla(200, 70%, 72%, 0.5)
  );
  transform-origin: top center;
  position: relative;
  will-change: transform;
}

.active .pendulum-arm {
  animation: pendulumSwing var(--duration-pendulum, 2s) ease-in-out infinite;
}

.pendulum-bob {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: radial-gradient(circle at 30% 30%, var(--color-oracle), hsla(200, 70%, 72%, 0.6));
  border-radius: 50%;
  box-shadow:
    0 0 12px var(--color-glow-oracle),
    0 0 24px hsla(200, 70%, 72%, 0.3);
}

.active .pendulum-bob {
  animation: pendulumGlow var(--duration-pendulum, 2s) ease-in-out infinite;
}

.reduced .pendulum-arm {
  animation: none;
}

.reduced .pendulum-bob {
  animation: pendulumPulse var(--duration-pendulum, 2s) ease-in-out infinite;
}

@keyframes pendulumSwing {
  0% {
    transform: rotate(25deg);
  }
  50% {
    transform: rotate(-25deg);
  }
  100% {
    transform: rotate(25deg);
  }
}

@keyframes pendulumGlow {
  0% {
    box-shadow:
      0 0 12px var(--color-glow-oracle),
      0 0 24px hsla(200, 70%, 72%, 0.3),
      -8px 0 16px hsla(200, 70%, 72%, 0.2);
  }
  50% {
    box-shadow:
      0 0 12px var(--color-glow-oracle),
      0 0 24px hsla(200, 70%, 72%, 0.3),
      8px 0 16px hsla(200, 70%, 72%, 0.2);
  }
  100% {
    box-shadow:
      0 0 12px var(--color-glow-oracle),
      0 0 24px hsla(200, 70%, 72%, 0.3),
      -8px 0 16px hsla(200, 70%, 72%, 0.2);
  }
}

@keyframes pendulumPulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
