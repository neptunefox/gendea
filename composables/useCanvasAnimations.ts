import { ref, computed } from 'vue'

export interface AnimationConfig {
  duration: number
  easing: string
}

const defaultConfig: AnimationConfig = {
  duration: 200,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
}

const deletingNodes = ref<Set<string>>(new Set())
const appearingNodes = ref<Set<string>>(new Set())
const staggeredNodes = ref<Map<string, number>>(new Map())

export function useCanvasAnimations() {
  function markNodeDeleting(nodeId: string): Promise<void> {
    return new Promise(resolve => {
      deletingNodes.value.add(nodeId)
      setTimeout(() => {
        deletingNodes.value.delete(nodeId)
        resolve()
      }, defaultConfig.duration)
    })
  }

  function markNodeAppearing(nodeId: string): void {
    appearingNodes.value.add(nodeId)
    setTimeout(() => {
      appearingNodes.value.delete(nodeId)
    }, defaultConfig.duration)
  }

  function markNodesStaggered(nodeIds: string[], baseDelay: number = 50): void {
    nodeIds.forEach((id, index) => {
      staggeredNodes.value.set(id, index * baseDelay)
      setTimeout(
        () => {
          staggeredNodes.value.delete(id)
        },
        defaultConfig.duration + index * baseDelay
      )
    })
  }

  function isNodeDeleting(nodeId: string): boolean {
    return deletingNodes.value.has(nodeId)
  }

  function isNodeAppearing(nodeId: string): boolean {
    return appearingNodes.value.has(nodeId)
  }

  function getStaggerDelay(nodeId: string): number {
    return staggeredNodes.value.get(nodeId) || 0
  }

  function getNodeAnimationClass(nodeId: string): string {
    if (deletingNodes.value.has(nodeId)) return 'node-deleting'
    if (appearingNodes.value.has(nodeId)) return 'node-appearing'
    if (staggeredNodes.value.has(nodeId)) return 'node-staggered'
    return ''
  }

  function getNodeAnimationStyle(nodeId: string): Record<string, string> {
    const delay = staggeredNodes.value.get(nodeId)
    if (delay !== undefined) {
      return { animationDelay: `${delay}ms` }
    }
    return {}
  }

  function animateAIGeneratedNodes(nodeIds: string[]): void {
    markNodesStaggered(nodeIds, 80)
  }

  function markNodeStaggered(nodeId: string, index: number, baseDelay: number = 80): void {
    const delay = index * baseDelay
    staggeredNodes.value.set(nodeId, delay)
    setTimeout(() => {
      staggeredNodes.value.delete(nodeId)
    }, defaultConfig.duration + delay)
  }

  return {
    markNodeStaggered,
    markNodeDeleting,
    markNodeAppearing,
    markNodesStaggered,
    animateAIGeneratedNodes,
    isNodeDeleting,
    isNodeAppearing,
    getStaggerDelay,
    getNodeAnimationClass,
    getNodeAnimationStyle,
    deletingNodes: computed(() => deletingNodes.value),
    appearingNodes: computed(() => appearingNodes.value),
    staggeredNodes: computed(() => staggeredNodes.value)
  }
}
