<template>
  <div class="canvas-page">
    <FlowGuidanceBanner
      :suggestion="flowGuidance.currentSuggestion.value"
      :is-visible="flowGuidance.isVisible.value"
      class="canvas-flow-banner"
      @dismiss="flowGuidance.dismissSuggestion()"
      @action="handleFlowGuidanceAction"
    />

    <div v-if="isLoading" class="loading-state">
      <p>Loading canvas...</p>
    </div>

    <div
      v-else
      class="canvas-container"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
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
        @connect="handleConnect"
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

        <template #edge-relationship="edgeProps">
          <RelationshipEdge v-bind="edgeProps" />
        </template>
      </VueFlow>

      <div v-if="selectedNodes.length > 1" class="selection-toolbar">
        <button
          class="ai-tidy-btn"
          :disabled="isTidying"
          title="AI organize nodes"
          @click="handleTidyUp"
        >
          <Loader2 v-if="isTidying" :size="18" class="spin" />
          <Wand2 v-else :size="18" />
          <span>Tidy Up</span>
        </button>
      </div>

      <NodeAIToolbar
        v-if="singleSelectedNode"
        :selected-node="singleSelectedNode"
        :project-id="projectId"
        :viewport="viewport"
        @nodes-created="handleAINodesCreated"
        @error="handleAIError"
        @delete-node="handleDeleteNode"
      />

      <AISuggestionPanel
        v-if="currentSuggestion"
        :suggestion="currentSuggestion"
        :project-id="projectId"
        :is-applying="isTidying"
        @dismiss="dismissSuggestion"
        @apply="applySuggestion"
      />

      <NodePalette />

      <div v-if="isDragOver" class="drop-indicator">
        <p>{{ draggedType === 'idea' ? 'Drop idea to add to canvas' : 'Drop to add node' }}</p>
      </div>

      <div
        v-if="isTestingState || isStalledState || isReviewingState"
        class="workflow-state-indicator"
        :class="workflowStateClass"
      >
        <FlaskConical v-if="isTestingState" :size="16" />
        <AlertTriangle v-else-if="isStalledState" :size="16" />
        <CheckCircle2 v-else-if="isReviewingState" :size="16" />
        <span>{{ workflowStateLabel }}</span>
      </div>

      <div class="canvas-toolbar">
        <div class="history-controls">
          <button
            class="toolbar-btn"
            :disabled="!canvasHistory.canUndo.value"
            title="Undo (Ctrl+Z)"
            @click="handleUndo"
          >
            <Undo2 :size="16" />
          </button>
          <button
            class="toolbar-btn"
            :disabled="!canvasHistory.canRedo.value"
            title="Redo (Ctrl+Y)"
            @click="handleRedo"
          >
            <Redo2 :size="16" />
          </button>
        </div>
        <div class="toolbar-divider" />
        <button
          class="toolbar-btn shortcuts-btn"
          title="Keyboard shortcuts"
          @click="showShortcuts = !showShortcuts"
        >
          <Keyboard :size="16" />
        </button>
        <div class="toolbar-divider" />
        <button class="toggle-view-btn" title="Switch to Coach" @click="navigateToCoach">
          <Hammer :size="18" />
          <span>Coach</span>
        </button>
      </div>

      <div v-if="showShortcuts" class="shortcuts-panel">
        <div class="shortcuts-header">
          <span>Keyboard Shortcuts</span>
          <button class="close-shortcuts" @click="showShortcuts = false">×</button>
        </div>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>Z</kbd>
            <span>Undo</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>Y</kbd>
            <span>Redo</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>A</kbd>
            <span>Select all</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>0</kbd>
            <span>Fit view</span>
          </div>
          <div class="shortcut-item">
            <kbd>Delete</kbd>
            <span>Delete selected</span>
          </div>
          <div class="shortcut-item">
            <kbd>Esc</kbd>
            <span>Deselect all</span>
          </div>
          <div class="shortcut-item">
            <kbd>Shift</kbd> + Click
            <span>Multi-select</span>
          </div>
        </div>
      </div>

      <ConflictResolutionModal
        v-if="hasConflict && conflict"
        :conflict="conflict"
        @resolve="resolveConflict"
        @dismiss="dismissConflict"
      />

      <EdgeSuggestionPopup
        v-if="edgeSuggestion"
        :is-visible="!!edgeSuggestion"
        :position="edgeSuggestion.position"
        :suggested-type="edgeSuggestion.suggestedType"
        :suggested-label="edgeSuggestion.suggestedLabel"
        :edge-id="edgeSuggestion.edgeId"
        @accept="handleEdgeSuggestionAccept"
        @dismiss="handleEdgeSuggestionDismiss"
      />

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
              @dragstart="e => handleIdeaDragStart(e, idea)"
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
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import {
  VueFlow,
  useVueFlow,
  SelectionMode,
  type Viewport,
  type Node,
  type Connection
} from '@vue-flow/core'
import {
  Hammer,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Sparkles,
  Wand2,
  Loader2,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Undo2,
  Redo2,
  Keyboard
} from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted, provide, watch, reactive } from 'vue'

import AISuggestionPanel from '~/components/canvas/AISuggestionPanel.vue'
import ConflictResolutionModal from '~/components/canvas/ConflictResolutionModal.vue'
import EdgeSuggestionPopup from '~/components/canvas/EdgeSuggestionPopup.vue'
import NodeAIToolbar from '~/components/canvas/NodeAIToolbar.vue'
import NodePalette from '~/components/canvas/NodePalette.vue'
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
import FlowGuidanceBanner from '~/components/FlowGuidanceBanner.vue'
import { useCanvas, type ConflictInfo } from '~/composables/useCanvas'
import { useCanvasAnimations } from '~/composables/useCanvasAnimations'
import { useCanvasHistory } from '~/composables/useCanvasHistory'
import { useDragAndDrop } from '~/composables/useDragAndDrop'
import { useFlowGuidance } from '~/composables/useFlowGuidance'
import type { EdgeRelationshipType } from '~/types/canvas'
import type { WorkflowState } from '~/types/workflow'

const route = useRoute()
const router = useRouter()
const flowGuidance = useFlowGuidance()

const projectId = computed(() => route.params.id as string)

const {
  isDragOver,
  draggedType,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStartSavedIdea,
  onDragEnd
} = useDragAndDrop()
const canvasAnimations = useCanvasAnimations()
const { conflict, hasConflict, resolveConflict, dismissConflict } = useCanvas(projectId)
const canvasHistory = useCanvasHistory(projectId)

provide('canvasAnimations', canvasAnimations)
provide('canvasHistory', canvasHistory)

const workflowState = ref<WorkflowState>('Seeded')
const lastWorkflowStateChange = ref<number>(Date.now())

const isTestingState = computed(() => workflowState.value === 'Testing')
const isStalledState = computed(
  () => workflowState.value === 'Stalled' || workflowState.value === 'Action crisis'
)
const isReviewingState = computed(() => workflowState.value === 'Reviewing')

function isTestRelatedNode(nodeType: string, nodeData: Record<string, unknown>): boolean {
  if (nodeType === 'task' && nodeData.coachOrigin) return true
  if (nodeType === 'task' && nodeData.testCommitmentId) return true
  const text = String(nodeData.text || '').toLowerCase()
  return text.includes('test') || text.includes('experiment') || text.includes('validate')
}

function isBlockedNode(nodeId: string): boolean {
  const edges = elements.value.filter((e: any) => e.source)
  return edges.some((e: any) => e.target === nodeId && e.data?.relationshipType === 'blocks')
}

function isIncompleteNode(nodeType: string, nodeData: Record<string, unknown>): boolean {
  if (nodeType === 'task') return !nodeData.completed
  if (nodeType === 'goal') return !nodeData.achieved
  return false
}

function isCompletedNode(nodeType: string, nodeData: Record<string, unknown>): boolean {
  if (nodeType === 'task') return !!nodeData.completed
  if (nodeType === 'goal') return !!nodeData.achieved
  return false
}

function getNodeWorkflowClass(
  nodeId: string,
  nodeType: string,
  nodeData: Record<string, unknown>
): string {
  const classes: string[] = []

  if (isTestingState.value && isTestRelatedNode(nodeType, nodeData)) {
    classes.push('workflow-testing-highlight')
  }

  if (isStalledState.value) {
    if (isBlockedNode(nodeId)) {
      classes.push('workflow-blocked')
    } else if (isIncompleteNode(nodeType, nodeData)) {
      classes.push('workflow-incomplete')
    }
  }

  if (isReviewingState.value && isCompletedNode(nodeType, nodeData)) {
    classes.push('workflow-completed')
  }

  return classes.join(' ')
}

const workflowHighlights = reactive({
  getNodeClass: getNodeWorkflowClass
})

provide('workflowHighlights', workflowHighlights)

const workflowStateLabel = computed(() => {
  if (isTestingState.value) return 'Testing'
  if (isStalledState.value)
    return workflowState.value === 'Action crisis' ? 'Action Crisis' : 'Stalled'
  if (isReviewingState.value) return 'Reviewing'
  return ''
})

const workflowStateClass = computed(() => {
  if (isTestingState.value) return 'state-testing'
  if (isStalledState.value) return 'state-stalled'
  if (isReviewingState.value) return 'state-reviewing'
  return ''
})

interface SavedIdea {
  id: string
  text: string
  isCauldronOutput?: number
  tags?: string[]
}

const savedIdeas = ref<SavedIdea[]>([])
const isIdeasPanelCollapsed = ref(false)
const showShortcuts = ref(false)

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
let syncInterval: NodeJS.Timeout | null = null

const {
  getSelectedNodes,
  addNodes,
  updateNode,
  addEdges,
  setViewport,
  onPaneReady,
  onNodeDragStop,
  fitView
} = useVueFlow()

const selectedNodes = computed(() => getSelectedNodes.value)

const singleSelectedNode = computed(() => {
  const nodes = selectedNodes.value
  if (nodes.length !== 1) return null
  const node = nodes[0]
  return {
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data as Record<string, unknown>
  }
})

interface Suggestion {
  type: 'clusters' | 'intermediate' | 'incomplete'
  message: string
  action?: string
  actionLabel?: string
  clusters?: Array<{ nodeIds: string[]; theme: string }>
  steps?: string[]
  nodeId?: string
}

const currentSuggestion = ref<Suggestion | null>(null)
const isTidying = ref(false)
const dismissedSuggestions = ref<Set<string>>(new Set())

interface EdgeSuggestion {
  edgeId: string
  suggestedType: EdgeRelationshipType
  suggestedLabel: string
  position: { x: number; y: number }
}
const edgeSuggestion = ref<EdgeSuggestion | null>(null)
const isLoadingEdgeSuggestion = ref(false)

let pendingViewport: Viewport | null = null
let paneReady = false
const dragStartPositions = ref<Map<string, { x: number; y: number }>>(new Map())

onPaneReady(() => {
  paneReady = true
  if (pendingViewport) {
    setViewport(pendingViewport)
    pendingViewport = null
  }
})

const { onNodeDragStart } = useVueFlow()

onNodeDragStart(({ node }) => {
  dragStartPositions.value.set(node.id, { x: node.position.x, y: node.position.y })
})

onNodeDragStop(async ({ node }) => {
  if (!projectId.value) return

  const startPos = dragStartPositions.value.get(node.id)
  const newPos = { x: Math.round(node.position.x), y: Math.round(node.position.y) }

  if (startPos && (startPos.x !== newPos.x || startPos.y !== newPos.y)) {
    canvasHistory.recordNodeMove(node.id, startPos, newPos)
  }
  dragStartPositions.value.delete(node.id)

  try {
    const nodeData = node.data as Record<string, unknown>
    const response = await $fetch(`/api/canvas/nodes/${node.id}`, {
      method: 'PATCH',
      body: {
        position: newPos,
        version: nodeData?.version
      }
    })
    if (response.node?.version) {
      updateNode(node.id, { data: { ...nodeData, version: response.node.version } })
    }
  } catch (error: any) {
    if (error?.statusCode === 409) {
      await loadCanvas()
    }
    console.error('Failed to save node position:', error)
  }
})

async function handleConnect(connection: Connection) {
  if (!connection.source || !connection.target) return

  const sourceNode = elements.value.find((e: any) => e.id === connection.source && !e.source)
  const targetNode = elements.value.find((e: any) => e.id === connection.target && !e.source)

  const sourceContent = sourceNode ? getNodeContent(sourceNode) : ''
  const targetContent = targetNode ? getNodeContent(targetNode) : ''

  try {
    const { edge } = await $fetch('/api/canvas/edges', {
      method: 'POST',
      body: {
        projectId: projectId.value,
        sourceId: connection.source,
        targetId: connection.target,
        type: 'relationship',
        relationshipType: 'relates-to'
      }
    })

    addEdges({
      id: edge.id,
      source: connection.source,
      target: connection.target,
      type: 'relationship',
      data: {
        relationshipType: 'relates-to',
        version: edge.version
      }
    })

    canvasHistory.recordEdgeAdd(edge.id, {
      source: connection.source,
      target: connection.target,
      type: 'relationship',
      label: null
    })

    if (sourceContent && targetContent) {
      fetchEdgeSuggestion(edge.id, sourceContent, targetContent, sourceNode, targetNode)
    }
  } catch (error) {
    console.error('Failed to create edge:', error)
  }
}

async function fetchEdgeSuggestion(
  edgeId: string,
  sourceContent: string,
  targetContent: string,
  sourceNode: any,
  targetNode: any
) {
  isLoadingEdgeSuggestion.value = true
  try {
    const result = await $fetch('/api/canvas/ai/suggest-label', {
      method: 'POST',
      body: { sourceContent, targetContent }
    })

    const midX = (sourceNode.position.x + targetNode.position.x) / 2
    const midY = (sourceNode.position.y + targetNode.position.y) / 2

    const canvasRect = document.querySelector('.vue-flow')?.getBoundingClientRect()
    const screenX = canvasRect
      ? canvasRect.left + (midX * viewport.value.zoom + viewport.value.x)
      : midX
    const screenY = canvasRect
      ? canvasRect.top + (midY * viewport.value.zoom + viewport.value.y)
      : midY

    edgeSuggestion.value = {
      edgeId,
      suggestedType: result.relationship as EdgeRelationshipType,
      suggestedLabel: result.label,
      position: { x: screenX, y: screenY }
    }
  } catch (error) {
    console.error('Failed to get edge suggestion:', error)
  } finally {
    isLoadingEdgeSuggestion.value = false
  }
}

async function handleEdgeSuggestionAccept(
  edgeId: string,
  type: EdgeRelationshipType,
  label: string | null
) {
  try {
    await $fetch(`/api/canvas/edges/${edgeId}`, {
      method: 'PATCH',
      body: {
        type: 'relationship',
        label: label,
        style: { relationshipType: type }
      }
    })

    const edgeIndex = elements.value.findIndex((e: any) => e.id === edgeId)
    if (edgeIndex !== -1) {
      const edge = elements.value[edgeIndex]
      elements.value[edgeIndex] = {
        ...edge,
        label: label || undefined,
        data: {
          ...edge.data,
          relationshipType: type
        }
      }
    }
  } catch (error) {
    console.error('Failed to update edge:', error)
  } finally {
    edgeSuggestion.value = null
  }
}

function handleEdgeSuggestionDismiss() {
  edgeSuggestion.value = null
}

async function checkConnectionRelatedness(sourceId: string, targetId: string) {
  const suggestionKey = `intermediate-${sourceId}-${targetId}`
  if (dismissedSuggestions.value.has(suggestionKey)) return

  const sourceNode = elements.value.find((e: any) => e.id === sourceId && !e.source)
  const targetNode = elements.value.find((e: any) => e.id === targetId && !e.source)

  if (!sourceNode || !targetNode) return

  const sourceContent = getNodeContent(sourceNode)
  const targetContent = getNodeContent(targetNode)

  if (!sourceContent || !targetContent) return

  try {
    const result = await $fetch('/api/canvas/ai/detect-unrelated', {
      method: 'POST',
      body: { sourceContent, targetContent }
    })

    if (result.areUnrelated && result.suggestedIntermediateSteps?.length) {
      currentSuggestion.value = {
        type: 'intermediate',
        message: result.reasoning || 'These nodes might benefit from intermediate steps.',
        steps: result.suggestedIntermediateSteps,
        nodeId: sourceId
      }
    }
  } catch (error) {
    console.error('Failed to check connection relatedness:', error)
  }
}

function getNodeContent(node: any): string {
  const data = node.data || {}
  return data.text || data.question || data.name || ''
}

async function loadCanvas() {
  if (!projectId.value) return

  try {
    const data = await $fetch(`/api/canvas/${projectId.value}`)

    const nodes = data.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: { ...node.data, version: node.version }
    }))

    const edges = data.edges.map((edge: any) => {
      const relationshipType = edge.style?.relationshipType || edge.type || 'relates-to'
      return {
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        type: 'relationship',
        label: edge.label,
        data: {
          relationshipType,
          version: edge.version
        }
      }
    })

    elements.value = [...nodes, ...edges]

    if (data.workflowState) {
      const newState = data.workflowState as WorkflowState
      if (workflowState.value !== newState) {
        workflowState.value = newState
        lastWorkflowStateChange.value = Date.now()
      }
    }

    if (data.state) {
      const restoredViewport = {
        x: data.state.viewportX,
        y: data.state.viewportY,
        zoom: data.state.zoom
      }
      viewport.value = restoredViewport

      if (paneReady) {
        setViewport(restoredViewport)
      } else {
        pendingViewport = restoredViewport
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

async function navigateToCoach() {
  if (projectId.value) {
    try {
      await $fetch(`/api/saved-ideas/${projectId.value}`, {
        method: 'PATCH',
        body: { lastActiveView: 'coach' }
      })
    } catch (error) {
      console.error('Failed to save view preference:', error)
    }
    router.push(`/coach/${projectId.value}`)
  }
}

function handleFlowGuidanceAction() {
  const suggestion = flowGuidance.currentSuggestion.value
  if (suggestion?.icon === 'coach') {
    flowGuidance.hideSuggestion()
    navigateToCoach()
  }
}

function handleSelectionEnd() {
  // Selection box completed - nodes are automatically selected by Vue Flow
}

function handleAINodesCreated(nodes: any[], edges: any[]) {
  for (const node of nodes) {
    addNodes({
      id: node.id,
      type: node.type,
      position: node.position,
      data: { ...node.data, version: node.version }
    })
    canvasAnimations.markNodeStaggered(node.id, nodes.indexOf(node))
  }

  for (const edge of edges) {
    addEdges({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: 'relationship',
      data: {
        relationshipType: edge.type || 'relates-to',
        version: edge.version
      }
    })
  }
}

function handleAIError(message: string) {
  console.warn('AI action:', message)
}

async function handleDeleteNode(nodeId: string) {
  try {
    const nodeToDelete = elements.value.find((e: any) => e.id === nodeId && !e.source)
    const connectedEdges = elements.value.filter(
      (e: any) => e.source === nodeId || e.target === nodeId
    )

    if (nodeToDelete) {
      canvasHistory.recordNodeDelete(
        nodeId,
        {
          type: nodeToDelete.type,
          position: nodeToDelete.position,
          data: nodeToDelete.data
        },
        connectedEdges
      )
    }

    await canvasAnimations.markNodeDeleting(nodeId)
    await $fetch(`/api/canvas/nodes/${nodeId}`, { method: 'DELETE' })
    elements.value = elements.value.filter((e: any) => {
      if (e.id === nodeId) return false
      if (e.source === nodeId || e.target === nodeId) return false
      return true
    })
  } catch (error) {
    console.error('Failed to delete node:', error)
  }
}

async function handleDeleteSelectedNodes() {
  const nodes = selectedNodes.value
  if (nodes.length === 0) return

  for (const node of nodes) {
    await handleDeleteNode(node.id)
  }
}

async function handleKeyDown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  const isEditing =
    target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (isEditing) return
    event.preventDefault()
    handleDeleteSelectedNodes()
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    if (isEditing) return
    event.preventDefault()
    if (canvasHistory.canUndo.value) {
      await canvasHistory.undo()
      await loadCanvas()
    }
    return
  }

  if (
    (event.ctrlKey || event.metaKey) &&
    (event.key === 'y' || (event.key === 'z' && event.shiftKey))
  ) {
    if (isEditing) return
    event.preventDefault()
    if (canvasHistory.canRedo.value) {
      await canvasHistory.redo()
      await loadCanvas()
    }
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
    if (isEditing) return
    event.preventDefault()
    selectAllNodes()
    return
  }

  if (event.key === 'Escape') {
    if (isEditing) return
    deselectAll()
    return
  }

  if (event.key === '0' && (event.ctrlKey || event.metaKey)) {
    if (isEditing) return
    event.preventDefault()
    fitView()
    return
  }
}

function selectAllNodes() {
  const nodes = elements.value.filter((e: any) => !e.source)
  nodes.forEach((node: any) => {
    updateNode(node.id, { selected: true })
  })
}

function deselectAll() {
  const nodes = elements.value.filter((e: any) => !e.source)
  nodes.forEach((node: any) => {
    updateNode(node.id, { selected: false })
  })
}

async function handleUndo() {
  if (canvasHistory.canUndo.value) {
    await canvasHistory.undo()
    await loadCanvas()
  }
}

async function handleRedo() {
  if (canvasHistory.canRedo.value) {
    await canvasHistory.redo()
    await loadCanvas()
  }
}

async function handleTidyUp() {
  if (isTidying.value) return
  isTidying.value = true

  try {
    const nodeIds = selectedNodes.value.map(n => n.id)
    const result = await $fetch('/api/canvas/ai/tidy-up', {
      method: 'POST',
      body: {
        projectId: projectId.value,
        nodeIds
      }
    })

    if (result.updatedPositions) {
      for (const [nodeId, position] of Object.entries(result.updatedPositions)) {
        updateNode(nodeId, { position: position as { x: number; y: number } })
      }
    }
  } catch (error) {
    console.error('Failed to tidy up nodes:', error)
  } finally {
    isTidying.value = false
  }
}

function dismissSuggestion() {
  if (currentSuggestion.value) {
    const key = `${currentSuggestion.value.type}-${currentSuggestion.value.nodeId || 'global'}`
    dismissedSuggestions.value.add(key)

    if (currentSuggestion.value.nodeId) {
      $fetch('/api/canvas/ai/dismiss-suggestion', {
        method: 'POST',
        body: {
          nodeId: currentSuggestion.value.nodeId,
          suggestionType: currentSuggestion.value.type
        }
      }).catch(console.error)
    }
  }
  currentSuggestion.value = null
}

async function applySuggestion(action: string) {
  if (!currentSuggestion.value) return

  if (action === 'tidy' && currentSuggestion.value.clusters) {
    isTidying.value = true
    try {
      const result = await $fetch('/api/canvas/ai/tidy-up', {
        method: 'POST',
        body: { projectId: projectId.value }
      })

      if (result.updatedPositions) {
        for (const [nodeId, position] of Object.entries(result.updatedPositions)) {
          updateNode(nodeId, { position: position as { x: number; y: number } })
        }
      }
    } catch (error) {
      console.error('Failed to apply suggestion:', error)
    } finally {
      isTidying.value = false
    }
  }

  currentSuggestion.value = null
}

async function checkForDisconnectedClusters() {
  const nodes = elements.value.filter((e: any) => !e.source)
  if (nodes.length < 4) return

  const suggestionKey = 'clusters-global'
  if (dismissedSuggestions.value.has(suggestionKey)) return

  try {
    const result = await $fetch('/api/canvas/ai/detect-clusters', {
      method: 'POST',
      body: { projectId: projectId.value }
    })

    if (result.hasDisconnectedClusters && result.clusters && result.clusters.length > 1) {
      currentSuggestion.value = {
        type: 'clusters',
        message: `Found ${result.clusters.length} disconnected groups of nodes. Would you like to organize them?`,
        action: 'tidy',
        actionLabel: 'Organize Canvas',
        clusters: result.clusters
      }
    }
  } catch (error) {
    console.error('Failed to check for clusters:', error)
  }
}

let clusterCheckTimeout: NodeJS.Timeout | null = null

watch(
  () => elements.value.length,
  () => {
    if (clusterCheckTimeout) clearTimeout(clusterCheckTimeout)
    clusterCheckTimeout = setTimeout(checkForDisconnectedClusters, 5000)

    const taskNodes = elements.value.filter((e: any) => !e.source && e.type === 'task')
    if (taskNodes.length >= 3) {
      flowGuidance.showSuggestion(flowGuidance.suggestions.canvasToCoach)
    }
  }
)

async function saveLastActiveView() {
  if (!projectId.value) return
  try {
    await $fetch(`/api/saved-ideas/${projectId.value}`, {
      method: 'PATCH',
      body: { lastActiveView: 'canvas' }
    })
  } catch (error) {
    console.error('Failed to save view preference:', error)
  }
}

async function syncCanvasData() {
  if (!projectId.value) return
  try {
    const data = await $fetch(`/api/canvas/${projectId.value}`)

    if (data.workflowState) {
      const newState = data.workflowState as WorkflowState
      if (workflowState.value !== newState) {
        workflowState.value = newState
        lastWorkflowStateChange.value = Date.now()
      }
    }

    const currentNodeIds = new Set(
      elements.value.filter((e: any) => !e.source).map((n: any) => n.id)
    )
    const currentEdgeIds = new Set(
      elements.value.filter((e: any) => e.source).map((e: any) => e.id)
    )

    const serverNodeIds = new Set(data.nodes.map((n: any) => n.id))
    const serverEdgeIds = new Set(data.edges.map((e: any) => e.id))

    const hasNodeChanges =
      data.nodes.some((n: any) => !currentNodeIds.has(n.id)) ||
      [...currentNodeIds].some(id => !serverNodeIds.has(id))
    const hasEdgeChanges =
      data.edges.some((e: any) => !currentEdgeIds.has(e.id)) ||
      [...currentEdgeIds].some(id => !serverEdgeIds.has(id))

    if (hasNodeChanges || hasEdgeChanges) {
      const nodes = data.nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: { ...node.data, version: node.version }
      }))

      const edges = data.edges.map((edge: any) => {
        const relationshipType = edge.style?.relationshipType || edge.type || 'relates-to'
        return {
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          type: 'relationship',
          label: edge.label,
          data: {
            relationshipType,
            version: edge.version
          }
        }
      })

      elements.value = [...nodes, ...edges]
    }
  } catch (error) {
    console.error('Canvas sync failed:', error)
  }
}

function startSync() {
  syncInterval = setInterval(syncCanvasData, 2000)
}

function stopSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

onMounted(() => {
  loadCanvas()
  fetchSavedIdeas()
  saveLastActiveView()
  startSync()
  window.addEventListener('keydown', handleKeyDown)
  flowGuidance.initialize()
})

onUnmounted(() => {
  stopSync()
  window.removeEventListener('keydown', handleKeyDown)
  if (viewportSaveTimeout) {
    clearTimeout(viewportSaveTimeout)
  }
  if (clusterCheckTimeout) {
    clearTimeout(clusterCheckTimeout)
  }
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

.canvas-flow-banner {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  max-width: 500px;
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

.workflow-state-indicator {
  position: fixed;
  bottom: 4.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
  animation: stateIndicatorAppear 0.3s ease;
}

@keyframes stateIndicatorAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.workflow-state-indicator.state-testing {
  color: #1976d2;
  border: 1px solid rgba(33, 150, 243, 0.3);
  animation:
    stateIndicatorAppear 0.3s ease,
    testingGlow 2s ease-in-out infinite;
}

.workflow-state-indicator.state-stalled {
  color: #c26660;
  border: 1px solid rgba(194, 102, 96, 0.3);
  background: rgba(255, 245, 245, 0.95);
}

.workflow-state-indicator.state-reviewing {
  color: #388e3c;
  border: 1px solid rgba(76, 175, 80, 0.3);
  background: rgba(245, 255, 245, 0.95);
}

@keyframes testingGlow {
  0%,
  100% {
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  }
  50% {
    box-shadow: 0 2px 16px rgba(33, 150, 243, 0.3);
  }
}

.canvas-toolbar {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.history-controls {
  display: flex;
  gap: 0.25rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  color: #40312b;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background: rgba(212, 117, 111, 0.1);
  color: #d4756f;
}

.toolbar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: rgba(212, 117, 111, 0.2);
  margin: 0 0.25rem;
}

.toggle-view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: transparent;
  color: #40312b;
  border: none;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-view-btn:hover {
  background: rgba(212, 117, 111, 0.1);
  color: #d4756f;
}

.shortcuts-panel {
  position: fixed;
  bottom: 5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  z-index: 20;
  min-width: 220px;
  animation: panelAppear 0.15s ease;
}

@keyframes panelAppear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shortcuts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(212, 117, 111, 0.1);
  font-weight: 600;
  font-size: 0.8125rem;
  color: #40312b;
}

.close-shortcuts {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #8b7a75;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-shortcuts:hover {
  color: #d4756f;
}

.shortcuts-list {
  padding: 0.5rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  font-size: 0.8125rem;
  color: #40312b;
}

.shortcut-item span {
  margin-left: auto;
  color: #8b7a75;
}

kbd {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  background: #f5f0ed;
  border: 1px solid #e0d5d0;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #40312b;
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

.ai-tidy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%);
  color: #40312b;
  border: 1px solid #f0e5e0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-tidy-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d4756f 0%, #c26660 100%);
  border-color: #d4756f;
  color: white;
}

.ai-tidy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

@media (max-width: 768px) {
  .canvas-toolbar {
    bottom: 1rem;
    right: 1rem;
    padding: 0.25rem;
  }

  .toggle-view-btn span {
    display: none;
  }

  .toggle-view-btn {
    padding: 0.5rem;
  }

  .shortcuts-btn {
    display: none;
  }

  .shortcuts-panel {
    bottom: 4.5rem;
    right: 1rem;
    min-width: 200px;
  }

  .ideas-panel {
    max-height: 40vh;
    right: 0.5rem;
  }

  .panel-content {
    width: 180px;
    padding: 0.5rem;
  }

  .selection-toolbar {
    bottom: 1rem;
    padding: 0.375rem;
  }

  .ai-tidy-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .workflow-state-indicator {
    bottom: 4rem;
    right: 1rem;
    padding: 0.375rem 0.625rem;
    font-size: 0.6875rem;
  }
}

@media (max-width: 480px) {
  .canvas-flow-banner {
    max-width: calc(100vw - 2rem);
    left: 1rem;
    transform: none;
  }

  .ideas-panel {
    display: none;
  }

  .selection-toolbar {
    left: 1rem;
    right: 1rem;
    transform: none;
    justify-content: center;
  }
}

@media (min-width: 1200px) {
  .ideas-panel {
    max-height: 70vh;
  }

  .panel-content {
    width: 260px;
  }
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
  transition: all 0.15s ease;
}

.vue-flow__controls-button:hover {
  background: rgba(212, 117, 111, 0.1);
  border-color: #d4756f;
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

.vue-flow__node {
  transition: box-shadow 0.15s ease;
  will-change: transform;
}

.vue-flow__node.selected {
  z-index: 100;
}

.vue-flow__node.dragging {
  z-index: 1000 !important;
  cursor: grabbing;
}

.vue-flow__edge {
  transition: opacity 0.15s ease;
}

.vue-flow__edge path {
  transition:
    stroke 0.15s ease,
    stroke-width 0.15s ease;
}

.vue-flow__edge.selected path {
  stroke-width: 3;
}

.vue-flow__handle {
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;
}

.vue-flow__handle:hover {
  transform: scale(1.3);
}

.vue-flow__pane {
  cursor: grab;
}

.vue-flow__pane:active {
  cursor: grabbing;
}

@keyframes nodeAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes nodeDelete {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes nodeStagger {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes edgeDraw {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vue-flow__node,
  .vue-flow__edge,
  .vue-flow__handle {
    transition: none;
  }

  @keyframes nodeAppear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes nodeDelete {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes nodeStagger {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
</style>
