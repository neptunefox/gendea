<template>
  <div class="idea-list-container">
    <div v-if="isGenerating" class="generating-state">
      <div class="generating-animation">
        <div class="pulse-ring" />
        <div class="pulse-ring delay-1" />
        <div class="pulse-ring delay-2" />
      </div>
      <p class="generating-text">Exploring possibilities...</p>
    </div>

    <div v-else-if="ideas.length > 0" class="ideas-grid">
      <transition-group name="idea-fade">
        <IdeaCard
          v-for="(idea, index) in ideas"
          :key="index"
          :idea="idea"
          @save="handleSave"
          @branch="handleBranch"
          @dismiss="handleDismiss(index)"
        />
      </transition-group>
    </div>

    <div v-if="ideas.length > 0 && !isGenerating" class="list-actions">
      <button class="secondary-button" @click="handleGenerateMore">
        <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Generate More
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IdeaCard from './IdeaCard.vue'

interface Idea {
  id?: string
  text: string
  source: 'user' | 'ai' | 'branch'
  isReadyToBuild?: boolean
}

defineProps<{
  isGenerating: boolean
}>()

const emit = defineEmits<{
  save: [idea: Idea]
  branch: [idea: Idea]
  generateMore: []
}>()

const ideas = ref<Idea[]>([])

function handleSave(idea: Idea) {
  emit('save', idea)
}

function handleBranch(idea: Idea) {
  emit('branch', idea)
}

function handleDismiss(index: number) {
  ideas.value.splice(index, 1)
}

function handleGenerateMore() {
  emit('generateMore')
}

function setIdeas(newIdeas: Idea[]) {
  ideas.value = newIdeas
}

defineExpose({
  setIdeas
})
</script>

<style scoped>
.idea-list-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.generating-animation {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  margin: -30px 0 0 -30px;
  border: 3px solid #667eea;
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

.pulse-ring.delay-1 {
  animation-delay: 0.5s;
}

.pulse-ring.delay-2 {
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.generating-text {
  font-size: 1.125rem;
  color: #667eea;
  font-weight: 600;
  margin: 0;
}

.ideas-grid {
  display: grid;
  gap: 1.5rem;
}

.idea-fade-enter-active {
  transition: all 0.4s ease;
}

.idea-fade-leave-active {
  transition: all 0.3s ease;
}

.idea-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.idea-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.list-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.secondary-button {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-button:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.button-icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 640px) {
  .idea-list-container {
    padding: 1rem;
  }

  .ideas-grid {
    gap: 1rem;
  }
}
</style>
