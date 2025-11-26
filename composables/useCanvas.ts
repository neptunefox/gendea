import type { Ref } from 'vue'

interface CanvasNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

interface CanvasEdge {
  id: string
  source: string
  target: string
  type?: string
  label?: string
  style?: Record<string, unknown>
}

interface CanvasState {
  viewportX: number
  viewportY: number
  zoom: number
}

export function useCanvas(projectId: Ref<string>) {
  const nodes = ref<CanvasNode[]>([])
  const edges = ref<CanvasEdge[]>([])
  const state = ref<CanvasState | null>(null)
  const isLoading = ref(true)

  async function loadCanvas() {
    if (!projectId.value) return

    try {
      const data = await $fetch(`/api/canvas/${projectId.value}`)

      nodes.value = data.nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      }))

      edges.value = data.edges.map((edge: any) => ({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        type: edge.type,
        label: edge.label,
        style: edge.style
      }))

      state.value = data.state
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
        data: created.data
      })

      return created
    } catch (error) {
      console.error('Failed to create node:', error)
      throw error
    }
  }

  async function updateNode(id: string, updates: Partial<Omit<CanvasNode, 'id'>>) {
    try {
      const { node: updated } = await $fetch(`/api/canvas/nodes/${id}`, {
        method: 'PATCH',
        body: updates
      })

      const index = nodes.value.findIndex(n => n.id === id)
      if (index !== -1) {
        nodes.value[index] = {
          id: updated.id,
          type: updated.type,
          position: updated.position,
          data: updated.data
        }
      }

      return updated
    } catch (error) {
      console.error('Failed to update node:', error)
      throw error
    }
  }

  async function deleteNode(id: string) {
    try {
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
        style: created.style
      })

      return created
    } catch (error) {
      console.error('Failed to create edge:', error)
      throw error
    }
  }

  async function updateEdge(id: string, updates: Partial<Omit<CanvasEdge, 'id' | 'source' | 'target'>>) {
    try {
      const { edge: updated } = await $fetch(`/api/canvas/edges/${id}`, {
        method: 'PATCH',
        body: updates
      })

      const index = edges.value.findIndex(e => e.id === id)
      if (index !== -1) {
        edges.value[index] = {
          id: updated.id,
          source: updated.sourceId,
          target: updated.targetId,
          type: updated.type,
          label: updated.label,
          style: updated.style
        }
      }

      return updated
    } catch (error) {
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
      await $fetch('/api/canvas/state', {
        method: 'PUT',
        body: {
          projectId: projectId.value,
          ...viewport
        }
      })

      state.value = viewport
    } catch (error) {
      console.error('Failed to save viewport:', error)
      throw error
    }
  }

  return {
    nodes,
    edges,
    state,
    isLoading,
    loadCanvas,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    updateEdge,
    deleteEdge,
    saveViewport
  }
}
