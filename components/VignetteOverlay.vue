<script setup lang="ts">
interface Props {
  color?: 'spark' | 'cauldron' | 'oracle' | 'history' | 'purple' | 'teal' | 'amber'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'spark'
})

const colorMap: Record<string, string> = {
  spark: 'var(--color-spark)',
  amber: 'var(--color-spark)',
  cauldron: 'var(--color-cauldron)',
  purple: 'var(--color-cauldron)',
  oracle: 'var(--color-oracle)',
  teal: 'var(--color-oracle)',
  history: 'var(--color-history)'
}

const currentColor = computed(() => colorMap[props.color])
</script>

<template>
  <div class="vignette-overlay" :style="{ '--vignette-color': currentColor }">
    <div class="vignette-corner vignette-top-left" />
    <div class="vignette-corner vignette-top-right" />
    <div class="vignette-corner vignette-bottom-left" />
    <div class="vignette-corner vignette-bottom-right" />
  </div>
</template>

<style scoped>
.vignette-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  transition: --vignette-color 300ms var(--ease-mystical);
}

.vignette-corner {
  position: absolute;
  width: 50%;
  height: 50%;
  transition: background 300ms var(--ease-mystical);
}

.vignette-top-left {
  top: 0;
  left: 0;
  background: radial-gradient(
    ellipse at top left,
    color-mix(in srgb, var(--vignette-color) 18%, transparent) 0%,
    transparent 70%
  );
}

.vignette-top-right {
  top: 0;
  right: 0;
  background: radial-gradient(
    ellipse at top right,
    color-mix(in srgb, var(--vignette-color) 18%, transparent) 0%,
    transparent 70%
  );
}

.vignette-bottom-left {
  bottom: 0;
  left: 0;
  background: radial-gradient(
    ellipse at bottom left,
    color-mix(in srgb, var(--vignette-color) 18%, transparent) 0%,
    transparent 70%
  );
}

.vignette-bottom-right {
  bottom: 0;
  right: 0;
  background: radial-gradient(
    ellipse at bottom right,
    color-mix(in srgb, var(--vignette-color) 18%, transparent) 0%,
    transparent 70%
  );
}
</style>
