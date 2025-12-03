const SOUND_STORAGE_KEY = 'gendea-sound-preferences'

interface SoundPreferences {
  enabled: boolean
  volume: number
}

interface SoundAsset {
  id: string
  src: string
  loop: boolean
  volume: number
}

const SOUNDS: Record<string, SoundAsset> = {
  chime: { id: 'chime', src: '/sounds/chimes.mp3', loop: false, volume: 0.7 },
  bubble: { id: 'bubble', src: '/sounds/bubbles.mp3', loop: true, volume: 0.5 },
  crystal: { id: 'crystal', src: '/sounds/crystal.mp3', loop: false, volume: 0.6 },
  cardFlip: { id: 'cardFlip', src: '/sounds/card-flip.mp3', loop: false, volume: 0.8 },
  splash: { id: 'splash', src: '/sounds/splash.mp3', loop: false, volume: 0.65 },
  arrive: { id: 'arrive', src: '/sounds/arrive.mp3', loop: false, volume: 0.7 },
  whoosh: { id: 'whoosh', src: '/sounds/whoosh.mp3', loop: false, volume: 0.55 },
  whisper: { id: 'whisper', src: '/sounds/whisper.mp3', loop: false, volume: 0.6 }
}

const audioElements = new Map<string, HTMLAudioElement>()
const soundEnabled = ref(true)
const soundVolume = ref(0.6)

function loadPreferences(): SoundPreferences {
  if (typeof window === 'undefined') {
    return { enabled: true, volume: 0.6 }
  }
  try {
    const stored = window.localStorage.getItem(SOUND_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore
  }
  return { enabled: true, volume: 0.6 }
}

function savePreferences(prefs: SoundPreferences) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // ignore
  }
}

function getAudio(soundId: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null

  const sound = SOUNDS[soundId]
  if (!sound) return null

  if (audioElements.has(soundId)) {
    return audioElements.get(soundId)!
  }

  const audio = new Audio(sound.src)
  audio.loop = sound.loop
  audio.volume = sound.volume * soundVolume.value
  audio.onerror = () => {
    console.warn(`Failed to load sound: ${sound.src}`)
  }
  audioElements.set(soundId, audio)
  return audio
}

export function useSound() {
  if (import.meta.client) {
    const prefs = loadPreferences()
    soundEnabled.value = prefs.enabled
    soundVolume.value = prefs.volume
  }

  function play(soundId: string) {
    if (!soundEnabled.value) return

    const audio = getAudio(soundId)
    if (!audio) return

    audio.currentTime = 0
    audio.volume = SOUNDS[soundId].volume * soundVolume.value
    audio.play().catch(() => {
      // ignore autoplay restrictions
    })
  }

  function stop(soundId: string) {
    const audio = audioElements.get(soundId)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  function stopAll() {
    audioElements.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
  }

  function toggle() {
    soundEnabled.value = !soundEnabled.value
    if (!soundEnabled.value) {
      stopAll()
    }
    savePreferences({ enabled: soundEnabled.value, volume: soundVolume.value })
  }

  function setEnabled(enabled: boolean) {
    soundEnabled.value = enabled
    if (!enabled) {
      stopAll()
    }
    savePreferences({ enabled, volume: soundVolume.value })
  }

  return {
    enabled: soundEnabled,
    volume: soundVolume,
    play,
    stop,
    stopAll,
    toggle,
    setEnabled
  }
}
