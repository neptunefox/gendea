import type { WorkflowState } from '~/types/workflow'

interface Branch {
  id: string
  state: WorkflowState
  missedPlans: number
  createdAt: Date
  updatedAt: Date
}

export const useBranchState = (branchId: string) => {
  const branch = ref<Branch | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchBranchState = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ branch: Branch }>(`/api/branch/${branchId}`)
      branch.value = response.branch
    } catch (e) {
      error.value = e as Error
      console.error('Failed to fetch branch state:', e)
    } finally {
      loading.value = false
    }
  }

  const canTransitionTo = (targetState: WorkflowState): boolean => {
    if (!branch.value) return false

    const currentState = branch.value.state

    const transitions: Record<WorkflowState, WorkflowState[]> = {
      Seeded: ['Diverging'],
      Diverging: ['Clarifying'],
      Clarifying: ['Planning'],
      Planning: ['Testing'],
      Testing: ['Reviewing', 'Stalled'],
      Reviewing: ['Stalled', 'Archived'],
      Stalled: ['Action crisis'],
      'Action crisis': ['Archived'],
      Archived: []
    }

    return transitions[currentState]?.includes(targetState) ?? false
  }

  const isInState = (state: WorkflowState): boolean => {
    return branch.value?.state === state
  }

  const hasReachedState = (state: WorkflowState): boolean => {
    if (!branch.value) return false

    const stateOrder: WorkflowState[] = [
      'Seeded',
      'Diverging',
      'Clarifying',
      'Planning',
      'Testing',
      'Reviewing',
      'Stalled',
      'Action crisis',
      'Archived'
    ]

    const currentIndex = stateOrder.indexOf(branch.value.state)
    const targetIndex = stateOrder.indexOf(state)

    return currentIndex >= targetIndex
  }

  onMounted(() => {
    fetchBranchState()
  })

  return {
    branch: readonly(branch),
    loading: readonly(loading),
    error: readonly(error),
    fetchBranchState,
    canTransitionTo,
    isInState,
    hasReachedState
  }
}
