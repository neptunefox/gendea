import { ref, computed } from 'vue'

export type FlowSuggestion = {
  id: string
  message: string
  action: string
  route?: string
  icon: 'cauldron' | 'build' | 'canvas' | 'coach'
}

const DISMISSED_KEY = 'flow-guidance-dismissed'

function getDismissedSuggestions(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(DISMISSED_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function saveDismissedSuggestions(dismissed: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]))
}

export function useFlowGuidance() {
  const dismissedSuggestions = ref<Set<string>>(new Set())
  const currentSuggestion = ref<FlowSuggestion | null>(null)
  const isVisible = ref(false)

  function initialize() {
    dismissedSuggestions.value = getDismissedSuggestions()
  }

  function showSuggestion(suggestion: FlowSuggestion) {
    if (dismissedSuggestions.value.has(suggestion.id)) return
    currentSuggestion.value = suggestion
    isVisible.value = true
  }

  function dismissSuggestion() {
    if (currentSuggestion.value) {
      dismissedSuggestions.value.add(currentSuggestion.value.id)
      saveDismissedSuggestions(dismissedSuggestions.value)
    }
    isVisible.value = false
    currentSuggestion.value = null
  }

  function hideSuggestion() {
    isVisible.value = false
    currentSuggestion.value = null
  }

  function resetDismissed() {
    dismissedSuggestions.value = new Set()
    saveDismissedSuggestions(dismissedSuggestions.value)
  }

  const suggestions = {
    sparkToCauldron: {
      id: 'spark-to-cauldron',
      message: 'Ready to combine ideas? Try the Cauldron to synthesize them.',
      action: 'Go to Cauldron',
      route: '/cauldron',
      icon: 'cauldron' as const
    },
    cauldronToBuild: {
      id: 'cauldron-to-build',
      message: 'Great synthesis! Ready to start building this idea?',
      action: 'Start building',
      icon: 'build' as const
    },
    buildSetupCanvas: {
      id: 'build-setup-canvas',
      message: 'Plan your project visually on the Canvas.',
      action: 'Open Canvas',
      icon: 'canvas' as const
    },
    canvasToCoach: {
      id: 'canvas-to-coach',
      message: 'Check your progress and set commitments in Coach.',
      action: 'View Coach',
      icon: 'coach' as const
    },
    coachToCanvas: {
      id: 'coach-to-canvas',
      message: 'Plan your next steps visually on the Canvas.',
      action: 'Open Canvas',
      icon: 'canvas' as const
    }
  }

  return {
    currentSuggestion: computed(() => currentSuggestion.value),
    isVisible: computed(() => isVisible.value),
    initialize,
    showSuggestion,
    dismissSuggestion,
    hideSuggestion,
    resetDismissed,
    suggestions
  }
}
