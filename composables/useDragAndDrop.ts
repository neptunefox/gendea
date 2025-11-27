import { ref, computed } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { CanvasNodeType } from '~/components/canvas/nodes'

const isDragging = ref(false)
const isDragOver = ref(false)
const draggedType = ref<CanvasNodeType | null>(null)

export function useDragAndDrop() {
  const { screenToFlowCoordinate, addNodes, getNodes } = useVueFlow()

  function onDragStart(event: DragEvent, type: CanvasNodeType) {
    if (!event.dataTransfer) return

    isDragging.value = true
    draggedType.value = type
    event.dataTransfer.setData('application/vueflow', type)
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

  async function onDrop(event: DragEvent, projectId: string) {
    if (!event.dataTransfer) return

    const type = event.dataTransfer.getData('application/vueflow') as CanvasNodeType
    if (!type) return

    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY
    })

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
    } catch (error) {
      console.error('Failed to create node:', error)
    }

    isDragOver.value = false
    isDragging.value = false
    draggedType.value = null
  }

  return {
    isDragging: computed(() => isDragging.value),
    isDragOver: computed(() => isDragOver.value),
    draggedType: computed(() => draggedType.value),
    onDragStart,
    onDragOver,
    onDragLeave,
    onDragEnd,
    onDrop
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
