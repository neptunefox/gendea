<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
</script>

<template>
  <ClientOnly>
    <TresCanvas :clear-color="'#0a0f0f'">
      <TresPerspectiveCamera :position="[0, 2, 5]" :look-at="[0, 0, 0]" />
      <OrbitControls :enable-damping="true" />

      <TresAmbientLight :intensity="0.1" />
      <TresPointLight :position="[0, 2, 0]" :color="'#00ffcc'" :intensity="2" />
    </TresCanvas>
  </ClientOnly>
</template>
