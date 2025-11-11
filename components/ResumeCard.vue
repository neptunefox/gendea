<template>
  <div class="resume-overlay">
    <div class="resume-card">
      <h2 class="resume-title">Welcome Back</h2>
      <p class="resume-subtitle">Here's where you left off</p>

      <div class="context-section">
        <div v-if="northStar" class="north-star-display">
          <div class="section-label">North Star</div>
          <p class="north-star-text">{{ northStar }}</p>
        </div>

        <div v-if="ladderSteps.length > 0" class="ladder-display">
          <div class="section-label">Ladder Steps</div>
          <ul class="ladder-list">
            <li v-for="step in ladderSteps" :key="step.id" class="ladder-item">
              {{ step.text }}
            </li>
          </ul>
        </div>

        <div v-if="lastAIBatch.length > 0" class="ai-batch-display">
          <div class="section-label">Last AI Suggestions</div>
          <ul class="ai-batch-list">
            <li v-for="(idea, index) in lastAIBatch" :key="index" class="ai-batch-item">
              <span class="ai-label">{{ idea.label }}</span>
              <span class="ai-text">{{ idea.text }}</span>
            </li>
          </ul>
        </div>

        <div class="pause-info">
          <div class="section-label">Paused</div>
          <p class="pause-time">{{ formattedPauseTime }}</p>
        </div>

        <div class="progress-section">
          <div class="section-label">Progress</div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
          <p class="progress-text">{{ progressStage }}</p>
        </div>
      </div>

      <button class="continue-button" @click="handleContinue">Continue</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AIIdea {
  text: string
  label: string
}

const props = defineProps<{
  northStar: string
  ladderSteps: Array<{ id: string; text: string; order: number }>
  lastAIBatch: AIIdea[]
  pauseTimestamp: number
  progressStage: 'capture' | 'plan' | 'test'
}>()

const emit = defineEmits<{
  continue: []
}>()

const formattedPauseTime = computed(() => {
  const date = new Date(props.pauseTimestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  }

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
})

const progressPercentage = computed(() => {
  const stages = { capture: 33, plan: 66, test: 100 }
  return stages[props.progressStage] || 0
})

function handleContinue() {
  emit('continue')
}
</script>

<style scoped>
.resume-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.resume-card {
  max-width: 600px;
  width: 90%;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.resume-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  text-align: center;
}

.resume-subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
}

.context-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.north-star-display {
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 0.5rem;
}

.north-star-text {
  font-size: 1rem;
  font-weight: 600;
  color: #92400e;
  line-height: 1.5;
}

.ladder-display {
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 0.5rem;
}

.ladder-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ladder-item {
  padding: 0.5rem;
  background: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #166534;
  border-left: 3px solid #22c55e;
}

.ai-batch-display {
  padding: 1rem;
  background: #faf5ff;
  border-radius: 0.5rem;
}

.ai-batch-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ai-batch-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.375rem;
}

.ai-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #a855f7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ai-text {
  font-size: 0.875rem;
  color: #6b21a8;
}

.pause-info {
  padding: 1rem;
  background: #eff6ff;
  border-radius: 0.5rem;
}

.pause-time {
  font-size: 0.875rem;
  color: #1e40af;
  font-weight: 500;
}

.progress-section {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 9999px;
  transition: width 0.6s ease-out;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  text-transform: capitalize;
}

.continue-button {
  width: 100%;
  min-width: 44px;
  min-height: 44px;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}
</style>
