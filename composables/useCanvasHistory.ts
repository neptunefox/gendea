import { ref, computed, type Ref } from 'vue'

interface HistoryEntry {
  type:
    | 'node-add'
    | 'node-delete'
    | 'node-move'
    | 'node-update'
    | 'edge-add'
    | 'edge-delete'
    | 'edge-update'
    | 'group'
  timestamp: number
  data: any
  undo: () => Promise<void>
  redo: () => Promise<void>
}

const history = ref<HistoryEntry[]>([])
const historyIndex = ref(-1)
const maxHistorySize = 50

export function useCanvasHistory(projectId: Ref<string>) {
  const canUndo = computed(() => historyIndex.value >= 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  function pushEntry(entry: Omit<HistoryEntry, 'timestamp'>) {
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    history.value.push({
      ...entry,
      timestamp: Date.now()
    })

    if (history.value.length > maxHistorySize) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  async function undo() {
    if (!canUndo.value) return

    const entry = history.value[historyIndex.value]
    await entry.undo()
    historyIndex.value--
  }

  async function redo() {
    if (!canRedo.value) return

    historyIndex.value++
    const entry = history.value[historyIndex.value]
    await entry.redo()
  }

  function recordNodeAdd(nodeId: string, nodeData: any) {
    pushEntry({
      type: 'node-add',
      data: { nodeId, nodeData },
      undo: async () => {
        await $fetch(`/api/canvas/nodes/${nodeId}`, { method: 'DELETE' })
      },
      redo: async () => {
        await $fetch('/api/canvas/nodes', {
          method: 'POST',
          body: {
            projectId: projectId.value,
            id: nodeId,
            ...nodeData
          }
        })
      }
    })
  }

  function recordNodeDelete(nodeId: string, nodeData: any, connectedEdges: any[]) {
    pushEntry({
      type: 'node-delete',
      data: { nodeId, nodeData, connectedEdges },
      undo: async () => {
        await $fetch('/api/canvas/nodes', {
          method: 'POST',
          body: {
            projectId: projectId.value,
            type: nodeData.type,
            position: nodeData.position,
            data: nodeData.data
          }
        })
        for (const edge of connectedEdges) {
          await $fetch('/api/canvas/edges', {
            method: 'POST',
            body: {
              projectId: projectId.value,
              sourceId: edge.source,
              targetId: edge.target,
              type: edge.type,
              label: edge.label
            }
          })
        }
      },
      redo: async () => {
        await $fetch(`/api/canvas/nodes/${nodeId}`, { method: 'DELETE' })
      }
    })
  }

  function recordNodeMove(
    nodeId: string,
    oldPosition: { x: number; y: number },
    newPosition: { x: number; y: number }
  ) {
    pushEntry({
      type: 'node-move',
      data: { nodeId, oldPosition, newPosition },
      undo: async () => {
        await $fetch(`/api/canvas/nodes/${nodeId}`, {
          method: 'PATCH',
          body: { position: oldPosition }
        })
      },
      redo: async () => {
        await $fetch(`/api/canvas/nodes/${nodeId}`, {
          method: 'PATCH',
          body: { position: newPosition }
        })
      }
    })
  }

  function recordEdgeAdd(edgeId: string, edgeData: any) {
    pushEntry({
      type: 'edge-add',
      data: { edgeId, edgeData },
      undo: async () => {
        await $fetch(`/api/canvas/edges/${edgeId}`, { method: 'DELETE' })
      },
      redo: async () => {
        await $fetch('/api/canvas/edges', {
          method: 'POST',
          body: {
            projectId: projectId.value,
            sourceId: edgeData.source,
            targetId: edgeData.target,
            type: edgeData.type,
            label: edgeData.label
          }
        })
      }
    })
  }

  function recordEdgeDelete(edgeId: string, edgeData: any) {
    pushEntry({
      type: 'edge-delete',
      data: { edgeId, edgeData },
      undo: async () => {
        await $fetch('/api/canvas/edges', {
          method: 'POST',
          body: {
            projectId: projectId.value,
            sourceId: edgeData.source,
            targetId: edgeData.target,
            type: edgeData.type,
            label: edgeData.label
          }
        })
      },
      redo: async () => {
        await $fetch(`/api/canvas/edges/${edgeId}`, { method: 'DELETE' })
      }
    })
  }

  function clearHistory() {
    history.value = []
    historyIndex.value = -1
  }

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    recordNodeAdd,
    recordNodeDelete,
    recordNodeMove,
    recordEdgeAdd,
    recordEdgeDelete,
    clearHistory,
    historyLength: computed(() => history.value.length),
    currentIndex: computed(() => historyIndex.value)
  }
}
