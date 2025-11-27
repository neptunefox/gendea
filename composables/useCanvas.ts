import type { Ref } from 'vue'

interface CanvasNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
  version?: number
}

interface CanvasEdge {
  id: string
  source: string
  target: string
  type?: string
  label?: string
  style?: Record<string, unknown>
  version?: number
}

interface CanvasState {
  viewportX: number
  viewportY: number
  zoom: number
  version?: number
}

export interface ConflictInfo {
  type: 'node' | 'edge' | 'state'
  id: string
  localData: CanvasNode | CanvasEdge | CanvasState
  serverData: CanvasNode | CanvasEdge | CanvasState
  currentVersion: number
}

export function useCanvas(projectId: Ref<string>) {
  const nodes = ref<CanvasNode[]>([])
  const edges = ref<CanvasEdge[]>([])
  const state = ref<CanvasState | null>(null)
  const isLoading = ref(true)
  const conflict = ref<ConflictInfo | null>(null)
  const hasConflict = computed(() => conflict.value !== null)

  async function loadCanvas() {
    if (!projectId.value) return

    try {
      const data = await $fetch(`/api/canvas/${projectId.value}`)

      nodes.value = data.nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        version: node.version
      }))

      edges.value = data.edges.map((edge: any) => ({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        type: edge.type,
        label: edge.label,
        style: edge.style,
        version: edge.version
      }))

      state.value = data.state
        ? {
            viewportX: data.state.viewportX,
            viewportY: data.state.viewportY,
            zoom: data.state.zoom,
            version: data.state.version
          }
        : null
    } catch (error) {
      console.error('Failed to load canvas:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function createNode(node: Omit<CanvasNode, 'id'>) {
    try {
      const { node: created } = await $fetch('/api/canvas/nodes', {
        method: 'POST',
        body: {
          projectId: projectId.value,
          ...node
        }
      })

      nodes.value.push({
        id: created.id,
        type: created.type,
        position: created.position,
        data: created.data,
        version: created.version
      })

      return created
    } catch (error) {
      console.error('Failed to create node:', error)
      throw error
    }
  }

  async function updateNode(id: string, updates: Partial<Omit<CanvasNode, 'id'>>) {
    const existingNode = nodes.value.find(n => n.id === id)

    try {
      const { node: updated } = await $fetch(`/api/canvas/nodes/${id}`, {
        method: 'PATCH',
        body: {
          ...updates,
          version: existingNode?.version
        }
      })

      const index = nodes.value.findIndex(n => n.id === id)
      if (index !== -1) {
        nodes.value[index] = {
          id: updated.id,
          type: updated.type,
          position: updated.position,
          data: updated.data,
          version: updated.version
        }
      }

      return updated
    } catch (error: any) {
      if (error?.statusCode === 409 && error?.data) {
        const serverData = error.data.currentData
        conflict.value = {
          type: 'node',
          id,
          localData: existingNode || ({ id, ...updates } as CanvasNode),
          serverData: {
            id: serverData.id,
            type: serverData.type,
            position: serverData.position,
            data: serverData.data,
            version: serverData.version
          },
          currentVersion: error.data.currentVersion
        }
      }
      console.error('Failed to update node:', error)
      throw error
    }
  }

  async function deleteNode(id: string, animate: boolean = true) {
    try {
      if (animate) {
        const { useCanvasAnimations } = await import('./useCanvasAnimations')
        const { markNodeDeleting } = useCanvasAnimations()
        await markNodeDeleting(id)
      }

      await $fetch(`/api/canvas/nodes/${id}`, {
        method: 'DELETE'
      })

      nodes.value = nodes.value.filter(n => n.id !== id)
      edges.value = edges.value.filter(e => e.source !== id && e.target !== id)
    } catch (error) {
      console.error('Failed to delete node:', error)
      throw error
    }
  }

  async function createEdge(edge: Omit<CanvasEdge, 'id'>) {
    try {
      const { edge: created } = await $fetch('/api/canvas/edges', {
        method: 'POST',
        body: {
          projectId: projectId.value,
          sourceId: edge.source,
          targetId: edge.target,
          type: edge.type,
          label: edge.label,
          style: edge.style
        }
      })

      edges.value.push({
        id: created.id,
        source: created.sourceId,
        target: created.targetId,
        type: created.type,
        label: created.label,
        style: created.style,
        version: created.version
      })

      return created
    } catch (error) {
      console.error('Failed to create edge:', error)
      throw error
    }
  }

  async function updateEdge(
    id: string,
    updates: Partial<Omit<CanvasEdge, 'id' | 'source' | 'target'>>
  ) {
    const existingEdge = edges.value.find(e => e.id === id)

    try {
      const { edge: updated } = await $fetch(`/api/canvas/edges/${id}`, {
        method: 'PATCH',
        body: {
          ...updates,
          version: existingEdge?.version
        }
      })

      const index = edges.value.findIndex(e => e.id === id)
      if (index !== -1) {
        edges.value[index] = {
          id: updated.id,
          source: updated.sourceId,
          target: updated.targetId,
          type: updated.type,
          label: updated.label,
          style: updated.style,
          version: updated.version
        }
      }

      return updated
    } catch (error: any) {
      if (error?.statusCode === 409 && error?.data) {
        const serverData = error.data.currentData
        conflict.value = {
          type: 'edge',
          id,
          localData: existingEdge || ({ id, ...updates } as CanvasEdge),
          serverData: {
            id: serverData.id,
            source: serverData.sourceId,
            target: serverData.targetId,
            type: serverData.type,
            label: serverData.label,
            style: serverData.style,
            version: serverData.version
          },
          currentVersion: error.data.currentVersion
        }
      }
      console.error('Failed to update edge:', error)
      throw error
    }
  }

  async function deleteEdge(id: string) {
    try {
      await $fetch(`/api/canvas/edges/${id}`, {
        method: 'DELETE'
      })

      edges.value = edges.value.filter(e => e.id !== id)
    } catch (error) {
      console.error('Failed to delete edge:', error)
      throw error
    }
  }

  async function saveViewport(viewport: CanvasState) {
    try {
      const { state: updated } = await $fetch('/api/canvas/state', {
        method: 'PUT',
        body: {
          projectId: projectId.value,
          ...viewport,
          version: state.value?.version
        }
      })

      state.value = {
        viewportX: updated.viewportX,
        viewportY: updated.viewportY,
        zoom: updated.zoom,
        version: updated.version
      }
    } catch (error: any) {
      if (error?.statusCode === 409 && error?.data) {
        const serverData = error.data.currentData
        conflict.value = {
          type: 'state',
          id: projectId.value,
          localData: viewport,
          serverData: {
            viewportX: serverData.viewportX,
            viewportY: serverData.viewportY,
            zoom: serverData.zoom,
            version: serverData.version
          },
          currentVersion: error.data.currentVersion
        }
      }
      console.error('Failed to save viewport:', error)
      throw error
    }
  }

  async function resolveConflict(resolution: 'keep-local' | 'use-server' | 'reload') {
    if (!conflict.value) return

    const currentConflict = conflict.value

    if (resolution === 'reload') {
      conflict.value = null
      await loadCanvas()
      return
    }

    if (resolution === 'use-server') {
      if (currentConflict.type === 'node') {
        const serverNode = currentConflict.serverData as CanvasNode
        const index = nodes.value.findIndex(n => n.id === currentConflict.id)
        if (index !== -1) {
          nodes.value[index] = serverNode
        }
      } else if (currentConflict.type === 'edge') {
        const serverEdge = currentConflict.serverData as CanvasEdge
        const index = edges.value.findIndex(e => e.id === currentConflict.id)
        if (index !== -1) {
          edges.value[index] = serverEdge
        }
      } else if (currentConflict.type === 'state') {
        state.value = currentConflict.serverData as CanvasState
      }
      conflict.value = null
      return
    }

    if (resolution === 'keep-local') {
      if (currentConflict.type === 'node') {
        const localNode = currentConflict.localData as CanvasNode
        const index = nodes.value.findIndex(n => n.id === currentConflict.id)
        if (index !== -1) {
          nodes.value[index].version = currentConflict.currentVersion
        }
        await updateNode(currentConflict.id, {
          position: localNode.position,
          data: localNode.data,
          type: localNode.type
        })
      } else if (currentConflict.type === 'edge') {
        const localEdge = currentConflict.localData as CanvasEdge
        const index = edges.value.findIndex(e => e.id === currentConflict.id)
        if (index !== -1) {
          edges.value[index].version = currentConflict.currentVersion
        }
        await updateEdge(currentConflict.id, {
          type: localEdge.type,
          label: localEdge.label,
          style: localEdge.style
        })
      } else if (currentConflict.type === 'state') {
        const localState = currentConflict.localData as CanvasState
        state.value = { ...localState, version: currentConflict.currentVersion }
        await saveViewport(localState)
      }
      conflict.value = null
    }
  }

  function dismissConflict() {
    conflict.value = null
  }

  return {
    nodes,
    edges,
    state,
    isLoading,
    conflict,
    hasConflict,
    loadCanvas,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    updateEdge,
    deleteEdge,
    saveViewport,
    resolveConflict,
    dismissConflict
  }
}
