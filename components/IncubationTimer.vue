<template>
  <div class="timer-container">
    <div class="timer-card">
      <h2 class="timer-title">Take a Break</h2>
      <p class="timer-description">
        Go for a short walk or do a light activity. We'll bring you back to this idea when the timer
        ends.
      </p>

      <div class="timer-display">
        <div class="time-circle">
          <span class="time-text">{{ formattedTime }}</span>
        </div>
      </div>

      <div class="timer-actions">
        <button class="skip-button" @click="skipTimer">Skip Break</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  branchId: string
}>()

const emit = defineEmits<{
  complete: []
}>()

const TIMER_DURATION = 10 * 60
const remainingSeconds = ref(TIMER_DURATION)
let intervalId: NodeJS.Timeout | null = null

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

onMounted(() => {
  intervalId = setInterval(() => {
    remainingSeconds.value--

    if (remainingSeconds.value <= 0) {
      completeTimer()
    }
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

const completeTimer = async () => {
  if (intervalId) {
    clearInterval(intervalId)
  }

  await $fetch('/api/workflow/transition', {
    method: 'POST',
    body: {
      branchId: props.branchId,
      event: { type: 'TIMER_ENDED' }
    }
  })

  emit('complete')
}

const skipTimer = () => {
  completeTimer()
}
</script>

<style scoped>
.timer-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.timer-card {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.timer-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.timer-description {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.timer-display {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.time-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.time-text {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  font-variant-numeric: tabular-nums;
}

.timer-actions {
  display: flex;
  justify-content: center;
}

.skip-button {
  padding: 0.75rem 2rem;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.skip-button:hover {
  background-color: #e5e7eb;
}
</style>
