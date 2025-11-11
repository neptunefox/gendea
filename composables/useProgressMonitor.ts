import { ref, onMounted, onUnmounted } from 'vue'

interface PendingLog {
  branchId: string
  nodeId: string
  testWindow: Date
  action: string
}

export const useProgressMonitor = () => {
  const pendingLogs = ref<PendingLog[]>([])
  const loading = ref(false)
  let intervalId: NodeJS.Timeout | null = null

  const checkTestWindows = async () => {
    loading.value = true
    try {
      await $fetch('/api/plan-missed-check', { method: 'POST' })

      const response = await $fetch<{ pendingLogs: PendingLog[] }>('/api/progress-monitor')
      pendingLogs.value = response.pendingLogs
    } catch (error) {
      console.error('Failed to check test windows:', error)
    } finally {
      loading.value = false
    }
  }

  const startMonitoring = (intervalMinutes: number = 5) => {
    checkTestWindows()
    intervalId = setInterval(checkTestWindows, intervalMinutes * 60 * 1000)
  }

  const stopMonitoring = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  onMounted(() => {
    startMonitoring()
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    pendingLogs: readonly(pendingLogs),
    loading: readonly(loading),
    checkTestWindows,
    startMonitoring,
    stopMonitoring
  }
}
