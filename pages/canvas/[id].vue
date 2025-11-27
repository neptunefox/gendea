<template>
  <div class="canvas-page">
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
        <Background variant="dots" :gap="20" :size="1" />
        <Controls position="bottom-left" />

        <template #node-sticky-note="nodeProps">
          <StickyNoteNode v-bind="nodeProps" />
        </template>
        <template #node-shape="nodeProps">
          <ShapeNode v-bind="nodeProps" />
        </template>
        <template #node-text-block="nodeProps">
          <TextBlockNode v-bind="nodeProps" />
        </template>
        <template #node-input="nodeProps">
          <InputNode v-bind="nodeProps" />
        </template>
        <template #node-tool="nodeProps">
          <ToolNode v-bind="nodeProps" />
        </template>
        <template #node-task="nodeProps">
          <TaskNode v-bind="nodeProps" />
        </template>
        <template #node-idea="nodeProps">
          <IdeaNode v-bind="nodeProps" />
        </template>
        <template #node-goal="nodeProps">
          <GoalNode v-bind="nodeProps" />
        </template>

        <template #edge-relationship="edgeProps">
          <RelationshipEdge v-bind="edgeProps" />
        </template>
      </VueFlow>

      <button class="toggle-view-btn" @click="navigateToCoach" title="Switch to Coach">
        <Hammer :size="18" />
        <span>Coach</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VueFlow, type Viewport } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Hammer } from 'lucide-vue-next'
import {
  StickyNoteNode,
  ShapeNode,
  TextBlockNode,
  InputNode,
  ToolNode,
  TaskNode,
  IdeaNode,
  GoalNode
} from '~/components/canvas/nodes'
import RelationshipEdge from '~/components/canvas/RelationshipEdge.vue'

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
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
}

.loading-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b7a75;
  font-size: 0.9375rem;
}

.canvas-container {
  height: 100%;
  width: 100%;
  position: relative;
}

.toggle-view-btn {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  color: #40312b;
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.toggle-view-btn:hover {
  background: white;
  border-color: #d4756f;
  color: #d4756f;
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.2);
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
