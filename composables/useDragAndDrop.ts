import { ref, computed, inject } from 'vue'
import { useVueFlow, type Node } from '@vue-flow/core'
import type { CanvasNodeType } from '~/components/canvas/nodes'
import { useCanvasAnimations } from './useCanvasAnimations'

interface SavedIdeaDragData {
  id: string
  text: string
  isCauldronOutput: boolean
  tags?: string[]
}

const isDragging = ref(false)
const isDragOver = ref(false)
const draggedType = ref<CanvasNodeType | null>(null)

const NODE_WIDTH = 200
const NODE_HEIGHT = 120
const COLLISION_PADDING = 20
const GRID_GAP = 30

export function useDragAndDrop() {
  const { screenToFlowCoordinate, addNodes, getNodes } = useVueFlow()
  const { markNodeAppearing, markNodesStaggered } = useCanvasAnimations()

  function onDragStart(event: DragEvent, type: CanvasNodeType) {
    if (!event.dataTransfer) return

    isDragging.value = true
    draggedType.value = type
    event.dataTransfer.setData('application/vueflow', type)
    event.dataTransfer.effectAllowed = 'move'
  }

  function onDragStartSavedIdea(event: DragEvent, idea: SavedIdeaDragData) {
    if (!event.dataTransfer) return

    isDragging.value = true
    draggedType.value = 'idea'
    event.dataTransfer.setData('application/saved-idea', JSON.stringify(idea))
    event.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    isDragOver.value = true
  }

  function onDragLeave() {
    isDragOver.value = false
  }

  function onDragEnd() {
    isDragging.value = false
    isDragOver.value = false
    draggedType.value = null
  }

  function findNonCollidingPosition(
    basePosition: { x: number; y: number },
    existingNodes: Node[]
  ): { x: number; y: number } {
    let position = { ...basePosition }
    let attempts = 0
    const maxAttempts = 50

    while (attempts < maxAttempts) {
      const hasCollision = existingNodes.some(node => {
        const nodeWidth = node.dimensions?.width || NODE_WIDTH
        const nodeHeight = node.dimensions?.height || NODE_HEIGHT

        return (
          position.x < node.position.x + nodeWidth + COLLISION_PADDING &&
          position.x + NODE_WIDTH + COLLISION_PADDING > node.position.x &&
          position.y < node.position.y + nodeHeight + COLLISION_PADDING &&
          position.y + NODE_HEIGHT + COLLISION_PADDING > node.position.y
        )
      })

      if (!hasCollision) return position

      const spiralAngle = attempts * 0.5
      const spiralRadius = 50 + attempts * 15
      position = {
        x: basePosition.x + Math.cos(spiralAngle) * spiralRadius,
        y: basePosition.y + Math.sin(spiralAngle) * spiralRadius
      }
      attempts++
    }

    return position
  }

  function calculateGridPositions(
    basePosition: { x: number; y: number },
    count: number,
    existingNodes: Node[]
  ): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = []
    const cols = Math.ceil(Math.sqrt(count))

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      const gridPosition = {
        x: basePosition.x + col * (NODE_WIDTH + GRID_GAP),
        y: basePosition.y + row * (NODE_HEIGHT + GRID_GAP)
      }
      const safePosition = findNonCollidingPosition(gridPosition, [...existingNodes, ...positions.map((p, idx) => ({
        id: `temp-${idx}`,
        position: p,
        data: {},
        dimensions: { width: NODE_WIDTH, height: NODE_HEIGHT }
      } as unknown as Node))])
      positions.push(safePosition)
    }

    return positions
  }

  async function onDrop(event: DragEvent, projectId: string) {
    if (!event.dataTransfer) return

    const savedIdeaData = event.dataTransfer.getData('application/saved-idea')
    if (savedIdeaData) {
      await handleSavedIdeaDrop(event, projectId, savedIdeaData)
      return
    }

    const type = event.dataTransfer.getData('application/vueflow') as CanvasNodeType
    if (!type) return

    const basePosition = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY
    })

    const existingNodes = getNodes.value
    const position = findNonCollidingPosition(basePosition, existingNodes)

    const nodeData = getDefaultNodeData(type)

    try {
      const { node } = await $fetch('/api/canvas/nodes', {
        method: 'POST',
        body: {
          projectId,
          type,
          position,
          data: nodeData
        }
      })

      const newNode: any = {
        id: node.id,
        type,
        position,
        data: nodeData
      }

      if (type === 'section') {
        newNode.zIndex = -1
      }

      addNodes(newNode)
      markNodeAppearing(node.id)
    } catch (error) {
      console.error('Failed to create node:', error)
    }

    isDragOver.value = false
    isDragging.value = false
    draggedType.value = null
  }

  async function handleSavedIdeaDrop(event: DragEvent, projectId: string, savedIdeaData: string) {
    try {
      const idea: SavedIdeaDragData = JSON.parse(savedIdeaData)

      const basePosition = screenToFlowCoordinate({
        x: event.clientX,
        y: event.clientY
      })

      const existingNodes = getNodes.value
      const position = findNonCollidingPosition(basePosition, existingNodes)

      const nodeData = {
        text: idea.text,
        isCauldronOutput: idea.isCauldronOutput,
        tags: idea.tags || [],
        savedIdeaId: idea.id
      }

      const { node } = await $fetch('/api/canvas/nodes', {
        method: 'POST',
        body: {
          projectId,
          type: 'idea',
          position,
          data: nodeData
        }
      })

      addNodes({
        id: node.id,
        type: 'idea',
        position,
        data: nodeData
      })
      markNodeAppearing(node.id)
    } catch (error) {
      console.error('Failed to create node from saved idea:', error)
    }

    isDragOver.value = false
    isDragging.value = false
    draggedType.value = null
  }

  async function importMultipleSavedIdeas(
    projectId: string,
    ideas: SavedIdeaDragData[],
    basePosition: { x: number; y: number }
  ) {
    const existingNodes = getNodes.value
    const positions = calculateGridPositions(basePosition, ideas.length, existingNodes)

    const createdNodes: any[] = []

    for (let i = 0; i < ideas.length; i++) {
      const idea = ideas[i]
      const position = positions[i]

      const nodeData = {
        text: idea.text,
        isCauldronOutput: idea.isCauldronOutput,
        tags: idea.tags || [],
        savedIdeaId: idea.id
      }

      try {
        const { node } = await $fetch('/api/canvas/nodes', {
          method: 'POST',
          body: {
            projectId,
            type: 'idea',
            position,
            data: nodeData
          }
        })

        createdNodes.push({
          id: node.id,
          type: 'idea',
          position,
          data: nodeData
        })
      } catch (error) {
        console.error('Failed to create node from saved idea:', error)
      }
    }

    if (createdNodes.length > 0) {
      addNodes(createdNodes)
      markNodesStaggered(createdNodes.map(n => n.id))
    }

    return createdNodes
  }

  return {
    isDragging: computed(() => isDragging.value),
    isDragOver: computed(() => isDragOver.value),
    draggedType: computed(() => draggedType.value),
    onDragStart,
    onDragStartSavedIdea,
    onDragOver,
    onDragLeave,
    onDragEnd,
    onDrop,
    importMultipleSavedIdeas,
    findNonCollidingPosition,
    calculateGridPositions
  }
}

function getDefaultNodeData(type: CanvasNodeType): Record<string, any> {
  switch (type) {
    case 'sticky-note':
      return { text: '', color: '#fff9c4' }
    case 'shape':
      return { shape: 'rectangle', color: '#d4756f', width: 100, height: 80 }
    case 'text-block':
      return { text: 'Text block', fontSize: 14 }
    case 'input':
      return { question: 'What would you like to explore?', answer: '' }
    case 'tool':
      return { name: 'Tool', url: '', description: '' }
    case 'task':
      return { title: 'New task', completed: false }
    case 'idea':
      return { text: 'New idea' }
    case 'goal':
      return { title: 'New goal', description: '' }
    case 'section':
      return { label: 'New Section', width: 400, height: 300 }
    default:
      return {}
  }
}
