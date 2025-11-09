import { ref } from 'vue'

interface BranchContext {
  branch: {
    id: string
    state: string
    missedPlans: number
  }
  northStar: {
    id: string
    branchId: string
    text: string
  } | null
  ladderSteps: Array<{
    id: string
    branchId: string
    text: string
    order: number
  }>
  plan: {
    id: string
    branchId: string
    description: string
    constraints: {
      timeCap?: boolean
      moneyCap?: boolean
      skillsOnHand?: boolean
    }
    metric: string
    passThreshold: string
    failThreshold: string
  } | null
}

export function useBranchContext(branchId: string) {
  const context = ref<BranchContext | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchContext() {
    if (!branchId) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch<BranchContext>(`/api/branch/${branchId}`)
      context.value = response
    } catch (e) {
      error.value = e as Error
      console.error('Failed to fetch branch context:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    context,
    loading,
    error,
    fetchContext
  }
}
