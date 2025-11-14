<template>
  <transition name="emerge" @after-enter="handleEmergenceComplete">
    <div v-if="show" class="cauldron-output">
      <div class="steam-container">
        <div v-for="i in 6" :key="i" class="steam" :style="getSteamStyle(i)"></div>
      </div>

      <div class="output-card">
        <div class="card-content">
          <h3 class="output-title">Your synthesized idea</h3>
          <p class="output-text">{{ output }}</p>
          <div class="output-actions">
            <button class="action-btn primary" @click="$emit('save')">
              <Save :size="18" />
              Save to collection
            </button>
            <button class="action-btn secondary" @click="$emit('reset')">
              <RotateCcw :size="18" />
              Start fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { Save, RotateCcw } from 'lucide-vue-next'
import { ref, watch } from 'vue'

interface Props {
  output: string | null
}

const props = defineProps<Props>()

defineEmits<{
  save: []
  reset: []
}>()

const show = ref(false)

watch(
  () => props.output,
  newOutput => {
    if (newOutput) {
      show.value = true
    } else {
      show.value = false
    }
  },
  { immediate: true }
)

function handleEmergenceComplete() {
  // Animation complete
}

function getSteamStyle(index: number) {
  const offset = (index - 1) * 15
  return {
    '--offset': `${offset - 30}px`,
    '--delay': `${index * 0.1}s`,
    '--duration': `${2 + Math.random() * 0.5}s`
  }
}
</script>

<style scoped>
.cauldron-output {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  z-index: 10;
}

.steam-container {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 80px;
  pointer-events: none;
  z-index: 1;
}

.steam {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 30px;
  height: 30px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(212, 117, 111, 0.2) 50%,
    transparent 100%
  );
  border-radius: 50%;
  transform: translateX(var(--offset, 0));
  animation: steam-rise var(--duration, 2s) ease-out infinite;
  animation-delay: var(--delay, 0s);
}

@keyframes steam-rise {
  0% {
    transform: translateX(var(--offset, 0)) translateY(0) scale(0.7);
    opacity: 0;
    filter: blur(2px);
  }
  25% {
    opacity: 0.7;
    filter: blur(3px);
  }
  100% {
    transform: translateX(var(--offset, 0)) translateY(-90px) scale(1.8);
    opacity: 0;
    filter: blur(5px);
  }
}

.output-card {
  position: relative;
  background: linear-gradient(135deg, #fef3f0 0%, #fce8e3 100%);
  border: 3px solid #d4756f;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
  box-shadow:
    0 12px 40px rgba(212, 117, 111, 0.25),
    0 0 60px rgba(212, 117, 111, 0.15);
  z-index: 2;
}

.card-content {
  position: relative;
  z-index: 1;
}

.output-title {
  margin: 0 0 1.25rem 0;
  color: #40312b;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(135deg, #d4756f 0%, #c26660 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.output-text {
  color: #40312b;
  font-size: 1.125rem;
  line-height: 1.7;
  margin: 0 0 2rem 0;
  text-align: center;
}

.output-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, #d4756f 0%, #c26660 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.3);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #c26660 0%, #b85850 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(212, 117, 111, 0.4);
}

.action-btn.secondary {
  background: rgba(212, 117, 111, 0.08);
  color: #d4756f;
  border: 2px solid rgba(212, 117, 111, 0.25);
}

.action-btn.secondary:hover {
  background: rgba(212, 117, 111, 0.15);
  border-color: #d4756f;
  transform: translateY(-2px);
}

.emerge-enter-active {
  animation: emerge 1.2s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.emerge-leave-active {
  animation: fade-out 0.3s ease-out;
}

@keyframes emerge {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.85);
    filter: blur(4px);
  }
  50% {
    opacity: 0.7;
    filter: blur(1px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0px);
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .cauldron-output {
    padding: 1rem;
  }

  .output-card {
    padding: 2rem 1.5rem;
  }

  .output-title {
    font-size: 1.25rem;
  }

  .output-text {
    font-size: 1rem;
  }

  .output-actions {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
