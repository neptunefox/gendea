<template>
  <div class="canvas-page">
    <header class="canvas-header">
      <div class="canvas-title">
        <h1>Canvas</h1>
        <span v-if="projectId" class="project-id">Project: {{ projectId }}</span>
      </div>
      <div class="canvas-actions">
        <button class="toggle-view-btn" @click="navigateToCoach">
          Switch to Coach
        </button>
      </div>
    </header>

    <div class="canvas-container">
      <VueFlow
        v-model="elements"
        :default-viewport="viewport"
        :min-zoom="0.1"
        :max-zoom="4"
        @viewport-change="handleViewportChange"
      >
        <Background pattern-color="#f0e5e0" :gap="16" />
        <Controls />
      </VueFlow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, type Viewport } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.id as string)

const elements = ref([])

const viewport = ref<Viewport>({
  x: 0,
  y: 0,
  zoom: 1
})

function handleViewportChange(newViewport: Viewport) {
  viewport.value = newViewport
}

function navigateToCoach() {
  if (projectId.value) {
    router.push(`/coach/${projectId.value}`)
  }
}
</script>

<style scoped>
.canvas-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fff5f0 0%, #fef8f5 100%);
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #f0e5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.canvas-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.canvas-title h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #40312b;
  margin: 0;
}

.project-id {
  font-size: 0.875rem;
  color: #8b7a75;
  background: rgba(212, 117, 111, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.canvas-actions {
  display: flex;
  gap: 0.75rem;
}

.toggle-view-btn {
  padding: 0.5rem 1rem;
  background: #d4756f;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-view-btn:hover {
  background: #c26660;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(212, 117, 111, 0.3);
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/background/dist/style.css';

.vue-flow {
  background: linear-gradient(135deg, #fff5f0 0%, #fef8f5 100%);
}

.vue-flow__controls {
  bottom: 1rem;
  left: 1rem;
}

.vue-flow__controls-button {
  background: white;
  border: 1px solid #f0e5e0;
  color: #40312b;
  transition: all 0.2s ease;
}

.vue-flow__controls-button:hover {
  background: rgba(212, 117, 111, 0.1);
  border-color: #d4756f;
  transform: scale(1.05);
}
</style>
