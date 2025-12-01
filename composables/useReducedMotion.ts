export function useReducedMotion(): Ref<boolean> {
  const prefersReducedMotion = ref(false)

  if (import.meta.client) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    const handleChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion.value = event.matches
    }

    mediaQuery.addEventListener('change', handleChange)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  }

  return prefersReducedMotion
}
