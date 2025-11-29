<template>
  <div v-if="visible" class="node-ai-toolbar" :style="toolbarPosition">
    <template v-if="isIdeaNode">
      <button
        class="ai-btn"
        :class="{ loading: isExpanding }"
        :disabled="isExpanding"
        title="Generate related ideas"
        @click="handleExpand"
      >
        <Loader2 v-if="isExpanding" :size="16" class="spin" />
        <Sparkles v-else :size="16" />
        <span>Expand</span>
      </button>

      <button
        class="ai-btn"
        :class="{ loading: isAssisting }"
        :disabled="isAssisting"
        title="Get suggestions and clarifying questions"
        @click="handleAssist"
      >
        <Loader2 v-if="isAssisting" :size="16" class="spin" />
        <Wand2 v-else :size="16" />
        <span>Assist</span>
      </button>

      <div class="toolbar-divider" />
    </template>

    <button
      class="ai-btn delete-btn"
      :class="{ loading: isDeleting }"
      :disabled="isDeleting"
      title="Delete node (Del)"
      @click="handleDelete"
    >
      <Loader2 v-if="isDeleting" :size="16" class="spin" />
      <Trash2 v-else :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, Wand2, Loader2, Trash2 } from 'lucide-vue-next'
import { ref, computed } from 'vue'

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
  (e: 'delete-node', nodeId: string): void
}>()

const isExpanding = ref(false)
const isAssisting = ref(false)
const isDeleting = ref(false)

const visible = computed(() => props.selectedNode !== null)
const isIdeaNode = computed(() => props.selectedNode?.type === 'idea')

const toolbarPosition = computed(() => {
  if (!props.selectedNode) return {}
  const x = props.selectedNode.position.x * props.viewport.zoom + props.viewport.x
  const y = props.selectedNode.position.y * props.viewport.zoom + props.viewport.y - 60
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

async function handleAssist() {
  if (!props.selectedNode || isAssisting.value) return
  isAssisting.value = true

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
      emit('error', 'No suggestions for this node')
    }
  } catch (error) {
    console.error('Failed to assist:', error)
    emit('error', 'Failed to get suggestions')
  } finally {
    isAssisting.value = false
  }
}

function handleDelete() {
  if (!props.selectedNode || isDeleting.value) return
  emit('delete-node', props.selectedNode.id)
}
</script>

<style scoped>
.node-ai-toolbar {
  position: absolute;
  display: flex;
  gap: var(--space-1);
  padding: var(--space-1);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  transform: translateX(-50%);
}

.ai-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.ai-btn:hover:not(:disabled) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.ai-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-btn.loading {
  background: var(--color-primary-subtle);
}

.toolbar-divider {
  width: 1px;
  background: var(--color-border);
  margin: var(--space-1) 0;
}

.delete-btn {
  padding: var(--space-2);
  justify-content: center;
}

.delete-btn:hover:not(:disabled) {
  background: var(--color-error);
  border-color: var(--color-error);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
