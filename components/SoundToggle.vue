<template>
  <ClientOnly>
    <button
      class="sound-toggle"
      :class="{ enabled: enabled }"
      :title="enabled ? 'Sound on' : 'Sound off'"
      @click="toggle"
    >
      <Volume2 v-if="enabled" :size="16" />
      <VolumeX v-else :size="16" />
    </button>
    <template #fallback>
      <button class="sound-toggle" title="Sound off">
        <VolumeX :size="16" />
      </button>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Volume2, VolumeX } from 'lucide-vue-next'
import { useSound } from '~/composables/useSound'

const { enabled, toggle } = useSound()
</script>

<style scoped>
.sound-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.3s var(--ease-out);
  border-radius: var(--radius-md);
}

.sound-toggle:hover {
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.05);
}

.sound-toggle.enabled {
  color: var(--color-primary);
}

.sound-toggle.enabled:hover {
  color: var(--color-primary);
}
</style>
