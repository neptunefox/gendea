<template>
  <div class="canvas-page">
    <div v-if="isLoading" class="loading-state">
      <p>Loading canvas...</p>
    </div>

    <div v-else class="canvas-container" @drop="handleDrop" @dragover="handleDragOver" @dragleave="handleDragLeave">
      <VueFlow
        v-model="elements"
        :default-viewport="viewport"
        :min-zoom="0.1"
        :max-zoom="4"
        :selection-key-code="null"
        :multi-selection-key-code="'Shift'"
        :pan-on-scroll="true"
        :selection-mode="SelectionMode.Partial"
        @viewport-change="handleViewportChange"
        @selection-end="handleSelectionEnd"
      >
        <svg>
          <defs>
            <marker
              id="arrow-leads-to"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#d4756f" />
            </marker>
            <marker
              id="arrow-requires"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b7a75" />
            </marker>
            <marker
              id="arrow-blocks"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c26660" />
            </marker>
            <marker
              id="arrow-relates-to"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#b8a8a3" />
            </marker>
          </defs>
        </svg>

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
        <template #node-section="nodeProps">
          <SectionNode v-bind="nodeProps" />
        </template>

        <template #edge-relationship="edgeProps">
          <RelationshipEdge v-bind="edgeProps" />
        </template>
      </VueFlow>

      <div v-if="selectedNodes.length > 1" class="selection-toolbar">
        <button class="group-btn" @click="groupSelectedNodes" title="Group selected nodes">
          <Group :size="18" />
          <span>Group ({{ selectedNodes.length }})</span>
        </button>
      </div>

      <NodePalette />

      <div v-if="isDragOver" class="drop-indicator">
        <p>{{ draggedType === 'idea' ? 'Drop idea to add to canvas' : 'Drop to add node' }}</p>
      </div>

      <button class="toggle-view-btn" @click="navigateToCoach" title="Switch to Coach">
        <Hammer :size="18" />
        <span>Coach</span>
      </button>

      <div class="ideas-panel" :class="{ collapsed: isIdeasPanelCollapsed }">
        <button class="panel-toggle" @click="isIdeasPanelCollapsed = !isIdeasPanelCollapsed">
          <ChevronRight v-if="isIdeasPanelCollapsed" :size="16" />
          <ChevronLeft v-else :size="16" />
        </button>
        <div v-if="!isIdeasPanelCollapsed" class="panel-content">
          <div class="panel-header">
            <Lightbulb :size="16" />
            <span>Saved Ideas</span>
          </div>
          <div v-if="savedIdeas.length === 0" class="panel-empty">
            <p>No saved ideas yet</p>
          </div>
          <div v-else class="ideas-list">
            <div
              v-for="idea in savedIdeas"
              :key="idea.id"
              class="idea-item"
              :class="{ cauldron: idea.isCauldronOutput }"
              draggable="true"
              @dragstart="(e) => handleIdeaDragStart(e, idea)"
              @dragend="handleIdeaDragEnd"
            >
              <Sparkles v-if="idea.isCauldronOutput" :size="12" class="cauldron-icon" />
              <p>{{ idea.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { VueFlow, useVueFlow, SelectionMode, type Viewport, type Node } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Hammer, Group, ChevronLeft, ChevronRight, Lightbulb, Sparkles } from 'lucide-vue-next'
import {
  StickyNoteNode,
  ShapeNode,
  TextBlockNode,
  InputNode,
  ToolNode,
  TaskNode,
  IdeaNode,
  GoalNode,
  SectionNode
} from '~/components/canvas/nodes'
import RelationshipEdge from '~/components/canvas/RelationshipEdge.vue'
import NodePalette from '~/components/canvas/NodePalette.vue'
import { useDragAndDrop } from '~/composables/useDragAndDrop'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.id as string)

const { isDragOver, draggedType, onDragOver, onDragLeave, onDrop, onDragStartSavedIdea, onDragEnd } = useDragAndDrop()

interface SavedIdea {
  id: string
  text: string
  isCauldronOutput?: number
  tags?: string[]
}

const savedIdeas = ref<SavedIdea[]>([])
const isIdeasPanelCollapsed = ref(false)

function handleIdeaDragStart(event: DragEvent, idea: SavedIdea) {
  onDragStartSavedIdea(event, {
    id: idea.id,
    text: idea.text,
    isCauldronOutput: !!idea.isCauldronOutput,
    tags: idea.tags
  })
}

function handleIdeaDragEnd() {
  onDragEnd()
}

async function fetchSavedIdeas() {
  try {
    const response = await $fetch<{ ideas: SavedIdea[] }>('/api/saved-ideas')
    savedIdeas.value = response.ideas
  } catch (error) {
    console.error('Failed to fetch saved ideas:', error)
  }
}

function handleDragOver(event: DragEvent) {
  onDragOver(event)
}

function handleDragLeave() {
  onDragLeave()
}

function handleDrop(event: DragEvent) {
  onDrop(event, projectId.value)
}

const elements = ref<any[]>([])
const isLoading = ref(true)

const viewport = ref<Viewport>({
  x: 0,
  y: 0,
  zoom: 1
})

let viewportSaveTimeout: NodeJS.Timeout | null = null

const { getSelectedNodes, addNodes, updateNode } = useVueFlow()

const selectedNodes = computed(() => getSelectedNodes.value.filter(n => n.type !== 'section'))

async function loadCanvas() {
  if (!projectId.value) return

  try {
    const data = await $fetch(`/api/canvas/${projectId.value}`)

    const sectionNodes = data.nodes
      .filter((node: any) => node.type === 'section')
      .map((node: any) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        zIndex: -1
      }))

    const childNodes = data.nodes
      .filter((node: any) => node.type !== 'section')
      .map((node: any) => {
        const nodeData: any = {
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data
        }
        if (node.parentNodeId) {
          nodeData.parentNode = node.parentNodeId
          nodeData.extent = 'parent'
        }
        return nodeData
      })

    const nodes = [...sectionNodes, ...childNodes]

    const edges = data.edges.map((edge: any) => {
      const relationshipType = edge.style?.relationshipType || edge.type || 'relates-to'
      return {
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        type: 'relationship',
        label: edge.label,
        data: {
          relationshipType
        }
      }
    })

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

function handleSelectionEnd() {
  // Selection box completed - nodes are automatically selected by Vue Flow
}

async function groupSelectedNodes() {
  const nodes = selectedNodes.value
  if (nodes.length < 2) return

  const bounds = calculateBounds(nodes)
  const padding = 40

  const sectionId = `section-${Date.now()}`
  const sectionNode = {
    id: sectionId,
    type: 'section',
    position: {
      x: bounds.minX - padding,
      y: bounds.minY - padding - 40
    },
    data: {
      label: 'New Section',
      width: bounds.maxX - bounds.minX + padding * 2,
      height: bounds.maxY - bounds.minY + padding * 2 + 40
    },
    zIndex: -1
  }

  try {
    const { node: created } = await $fetch('/api/canvas/nodes', {
      method: 'POST',
      body: {
        projectId: projectId.value,
        type: sectionNode.type,
        position: sectionNode.position,
        data: sectionNode.data
      }
    })

    addNodes({
      ...sectionNode,
      id: created.id
    })

    for (const node of nodes) {
      const relativePosition = {
        x: node.position.x - sectionNode.position.x,
        y: node.position.y - sectionNode.position.y
      }

      await $fetch(`/api/canvas/nodes/${node.id}`, {
        method: 'PATCH',
        body: {
          position: relativePosition,
          parentNode: created.id
        }
      })

      updateNode(node.id, {
        position: relativePosition,
        parentNode: created.id,
        extent: 'parent'
      })
    }
  } catch (error) {
    console.error('Failed to group nodes:', error)
  }
}

function calculateBounds(nodes: Node[]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of nodes) {
    const width = node.dimensions?.width || 200
    const height = node.dimensions?.height || 100

    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + width)
    maxY = Math.max(maxY, node.position.y + height)
  }

  return { minX, minY, maxX, maxY }
}

onMounted(() => {
  loadCanvas()
  fetchSavedIdeas()
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

.selection-toolbar {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.group-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #d4756f 0%, #c26660 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.3);
}

.drop-indicator {
  position: absolute;
  inset: 0;
  background: rgba(212, 117, 111, 0.08);
  border: 2px dashed #d4756f;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 5;
}

.drop-indicator p {
  background: white;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  color: #d4756f;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ideas-panel {
  position: fixed;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}

.ideas-panel.collapsed {
  padding: 0;
}

.panel-toggle {
  position: absolute;
  top: 50%;
  left: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: white;
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8b7a75;
  transition: all 0.2s ease;
}

.panel-toggle:hover {
  background: #d4756f;
  color: white;
  border-color: #d4756f;
}

.panel-content {
  padding: 0.75rem;
  width: 220px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b7a75;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding: 0 0.25rem;
}

.panel-empty {
  padding: 1rem;
  text-align: center;
  color: #8b7a75;
  font-size: 0.8125rem;
}

.ideas-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  max-height: calc(60vh - 60px);
}

.idea-item {
  padding: 0.625rem 0.75rem;
  background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%);
  border: 1px solid #f0e5e0;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  position: relative;
}

.idea-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateX(-2px);
}

.idea-item:active {
  cursor: grabbing;
}

.idea-item.cauldron {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border-color: rgba(186, 104, 200, 0.3);
}

.idea-item .cauldron-icon {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: #ba68c8;
}

.idea-item p {
  margin: 0;
  font-size: 0.8125rem;
  color: #40312b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
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

.vue-flow__selection {
  background: rgba(212, 117, 111, 0.08);
  border: 2px dashed #d4756f;
  border-radius: 4px;
}

.vue-flow__nodesselection-rect {
  background: rgba(212, 117, 111, 0.05);
  border: 2px solid #d4756f;
  border-radius: 8px;
}
</style>
