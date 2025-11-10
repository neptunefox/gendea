import { ref } from 'vue'

export function useApi<T>(url: string, options?: RequestInit) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      data.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error')
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    execute
  }
}
