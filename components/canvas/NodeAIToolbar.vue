<template>
  <div v-if="visible" class="node-ai-toolbar" :style="toolbarPosition">
    <button
      class="ai-btn"
      :class="{ loading: isExpanding }"
      :disabled="isExpanding"
      @click="handleExpand"
      title="Generate related ideas"
    >
      <Loader2 v-if="isExpanding" :size="16" class="spin" />
      <Sparkles v-else :size="16" />
      <span>Expand</span>
    </button>

    <button
      class="ai-btn"
      :class="{ loading: isSuggestingTools }"
      :disabled="isSuggestingTools"
      @click="handleSuggestTools"
      title="Suggest helpful tools"
    >
      <Loader2 v-if="isSuggestingTools" :size="16" class="spin" />
      <Wrench v-else :size="16" />
      <span>Tools</span>
    </button>

    <button
      class="ai-btn"
      :class="{ loading: isAddingContext }"
      :disabled="isAddingContext"
      @click="handleAddContext"
      title="Add clarifying questions"
    >
      <Loader2 v-if="isAddingContext" :size="16" class="spin" />
      <HelpCircle v-else :size="16" />
      <span>Context</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, Wrench, HelpCircle, Loader2 } from 'lucide-vue-next'

interface SelectedNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

const props = defineProps<{
  selectedNode: SelectedNode | null
  projectId: string
  viewport: { x: number; y: number; zoom: number }
}>()

const emit = defineEmits<{
  (e: 'nodes-created', nodes: any[], edges: any[]): void
  (e: 'error', message: string): void
}>()

const isExpanding = ref(false)
const isSuggestingTools = ref(false)
const isAddingContext = ref(false)

const visible = computed(() => props.selectedNode !== null)

const toolbarPosition = computed(() => {
  if (!props.selectedNode) return {}
  const x = (props.selectedNode.position.x * props.viewport.zoom) + props.viewport.x
  const y = (props.selectedNode.position.y * props.viewport.zoom) + props.viewport.y - 60
  return {
    left: `${x}px`,
    top: `${y}px`
  }
})

function getNodeContent(node: SelectedNode): string {
  const data = node.data
  return (data.text as string) || (data.question as string) || (data.name as string) || ''
}

async function handleExpand() {
  if (!props.selectedNode || isExpanding.value) return
  isExpanding.value = true

  try {
    const content = getNodeContent(props.selectedNode)
    if (!content) {
      emit('error', 'Node has no content to expand')
      return
    }

    const result = await $fetch('/api/canvas/ai/expand', {
      method: 'POST',
      body: {
        projectId: props.projectId,
        nodeId: props.selectedNode.id,
        nodeContent: content,
        nodeType: props.selectedNode.type
      }
    })

    emit('nodes-created', result.nodes, result.edges)
  } catch (error) {
    console.error('Failed to expand node:', error)
    emit('error', 'Failed to expand node')
  } finally {
    isExpanding.value = false
  }
}

async function handleSuggestTools() {
  if (!props.selectedNode || isSuggestingTools.value) return
  isSuggestingTools.value = true

  try {
    const content = getNodeContent(props.selectedNode)
    if (!content) {
      emit('error', 'Node has no content to analyze')
      return
    }

    const result = await $fetch('/api/canvas/ai/detect-vague', {
      method: 'POST',
      body: {
        projectId: props.projectId,
        nodeId: props.selectedNode.id,
        nodeContent: content,
        nodeType: props.selectedNode.type
      }
    })

    if (result.nodes.length > 0 || result.edges.length > 0) {
      emit('nodes-created', result.nodes, result.edges)
    } else {
      emit('error', 'No tools suggested for this node')
    }
  } catch (error) {
    console.error('Failed to suggest tools:', error)
    emit('error', 'Failed to suggest tools')
  } finally {
    isSuggestingTools.value = false
  }
}

async function handleAddContext() {
  if (!props.selectedNode || isAddingContext.value) return
  isAddingContext.value = true

  try {
    const content = getNodeContent(props.selectedNode)
    if (!content) {
      emit('error', 'Node has no content to analyze')
      return
    }

    const result = await $fetch('/api/canvas/ai/detect-incomplete', {
      method: 'POST',
      body: {
        nodeContent: content,
        nodeType: props.selectedNode.type
      }
    })

    if (result.isIncomplete && result.suggestedQuestion) {
      const nodeResult = await $fetch('/api/canvas/nodes', {
        method: 'POST',
        body: {
          projectId: props.projectId,
          type: 'input',
          position: {
            x: props.selectedNode.position.x + 250,
            y: props.selectedNode.position.y
          },
          data: {
            question: result.suggestedQuestion,
            missingElements: result.missingElements
          }
        }
      })

      const edgeResult = await $fetch('/api/canvas/edges', {
        method: 'POST',
        body: {
          projectId: props.projectId,
          sourceId: props.selectedNode.id,
          targetId: nodeResult.node.id,
          type: 'relationship',
          relationshipType: 'requires'
        }
      })

      emit('nodes-created', [nodeResult.node], [edgeResult.edge])
    } else {
      emit('error', 'Node appears complete')
    }
  } catch (error) {
    console.error('Failed to add context:', error)
    emit('error', 'Failed to add context')
  } finally {
    isAddingContext.value = false
  }
}
</script>

<style scoped>
.node-ai-toolbar {
  position: absolute;
  display: flex;
  gap: 0.375rem;
  padding: 0.375rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 117, 111, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transform: translateX(-50%);
}

.ai-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #fffdf6 0%, #fff9f0 100%);
  border: 1px solid #f0e5e0;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #40312b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ai-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d4756f 0%, #c26660 100%);
  border-color: #d4756f;
  color: white;
}

.ai-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-btn.loading {
  background: rgba(212, 117, 111, 0.1);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
