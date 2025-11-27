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

    <div v-if="isLoading" class="loading-state">
      <p>Loading canvas...</p>
    </div>

    <div v-else class="canvas-container">
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
import { ref, onMounted, watch } from 'vue'
import { VueFlow, type Viewport } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.id as string)

const elements = ref([])
const isLoading = ref(true)

const viewport = ref<Viewport>({
  x: 0,
  y: 0,
  zoom: 1
})

let viewportSaveTimeout: NodeJS.Timeout | null = null

async function loadCanvas() {
  if (!projectId.value) return

  try {
    const data = await $fetch(`/api/canvas/${projectId.value}`)
    
    const nodes = data.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data
    }))

    const edges = data.edges.map((edge: any) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: edge.type,
      label: edge.label,
      style: edge.style
    }))

    elements.value = [...nodes, ...edges]

    if (data.state) {
      viewport.value = {
        x: data.state.viewportX,
        y: data.state.viewportY,
        zoom: data.state.zoom
      }
    }
  } catch (error) {
    console.error('Failed to load canvas:', error)
  } finally {
    isLoading.value = false
  }
}

function handleViewportChange(newViewport: Viewport) {
  viewport.value = newViewport

  if (viewportSaveTimeout) {
    clearTimeout(viewportSaveTimeout)
  }

  viewportSaveTimeout = setTimeout(() => {
    saveViewport(newViewport)
  }, 500)
}

async function saveViewport(vp: Viewport) {
  if (!projectId.value) return

  try {
    await $fetch('/api/canvas/state', {
      method: 'PUT',
      body: {
        projectId: projectId.value,
        viewportX: Math.round(vp.x),
        viewportY: Math.round(vp.y),
        zoom: vp.zoom
      }
    })
  } catch (error) {
    console.error('Failed to save viewport:', error)
  }
}

function navigateToCoach() {
  if (projectId.value) {
    router.push(`/coach/${projectId.value}`)
  }
}

onMounted(() => {
  loadCanvas()
})
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

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b7a75;
  font-size: 0.9375rem;
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
