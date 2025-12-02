<script setup lang="ts">
const route = useRoute()

const vignetteColor = computed(() => {
  const path = route.path
  if (path.startsWith('/cauldron')) return 'cauldron'
  if (path.startsWith('/oracle')) return 'oracle'
  if (path.startsWith('/history')) return 'history'
  return 'spark'
})
</script>

<template>
  <div class="app-layout">
    <VignetteOverlay :color="vignetteColor" />
    <AppNav />
    <main class="app-main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
:root {
  --color-bg: hsl(220, 20%, 6%);
  --color-surface: hsl(220, 18%, 10%);
  --color-surface-raised: hsl(220, 16%, 14%);

  --color-text: hsl(200, 25%, 94%);
  --color-text-secondary: hsl(200, 20%, 78%);
  --color-text-tertiary: hsl(200, 12%, 60%);

  --color-primary: hsl(185, 75%, 55%);
  --color-primary-hover: hsl(185, 80%, 62%);
  --color-primary-subtle: hsla(185, 75%, 55%, 0.18);
  --color-primary-ring: hsla(185, 75%, 55%, 0.3);

  --color-border: hsla(200, 25%, 94%, 0.1);
  --color-border-strong: hsla(200, 25%, 94%, 0.18);

  --color-success: hsl(185, 75%, 55%);
  --color-success-subtle: hsla(185, 75%, 55%, 0.25);
  --color-success-bg: hsla(185, 75%, 55%, 0.12);
  --color-warning: hsl(45, 80%, 60%);
  --color-error: hsl(0, 65%, 60%);
  --color-error-subtle: hsla(0, 65%, 60%, 0.25);
  --color-error-bg: hsla(0, 65%, 60%, 0.12);
  --color-info: hsl(200, 70%, 72%);
  --color-info-subtle: hsla(200, 70%, 72%, 0.25);

  --color-cauldron: hsl(140, 60%, 45%);
  --color-oracle: hsl(200, 70%, 72%);
  --color-spark: hsl(185, 75%, 55%);
  --color-history: hsl(260, 15%, 55%);

  --color-glow-spark: hsla(185, 75%, 55%, 0.5);
  --color-glow-cauldron: hsla(140, 60%, 45%, 0.5);
  --color-glow-oracle: hsla(200, 70%, 72%, 0.5);
  --color-glow-history: hsla(260, 15%, 55%, 0.4);

  --color-oracle-subtle: hsla(200, 70%, 72%, 0.18);
  --color-cauldron-subtle: hsla(140, 60%, 45%, 0.18);
  --color-spark-subtle: hsla(185, 75%, 55%, 0.18);
  --color-history-subtle: hsla(260, 15%, 55%, 0.15);

  --color-surface-translucent: hsla(220, 18%, 10%, 0.95);
  --color-border-subtle: hsla(200, 25%, 94%, 0.05);
  --color-hover-bg: hsla(200, 25%, 94%, 0.08);

  --text-2xl: 1.75rem;
  --text-xl: 1.5rem;
  --text-lg: 1.25rem;
  --text-base: 1rem;
  --text-sm: 0.9375rem;
  --text-xs: 0.8125rem;

  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 999px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.12);

  --nav-width: 72px;

  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 450ms;
  --duration-rune-drift: 30s;
  --duration-pendulum: 2s;
  --duration-seal: 600ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-mystical: cubic-bezier(0.4, 0, 0.2, 1);

  --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-heading: 'Cinzel', Georgia, serif;

  font-family: var(--font-body);
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-bg);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  font-feature-settings:
    'ss01' on,
    'ss02' on;
}

body {
  margin: 0;
  font-family: inherit;
  color: inherit;
  background-color: inherit;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.02;
  pointer-events: none;
  z-index: 50;
}

* {
  box-sizing: border-box;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  margin-left: var(--nav-width);
}

button,
.button,
[role='button'] {
  min-width: 44px;
  min-height: 44px;
  touch-action: manipulation;
}

@media (max-width: 768px) {
  :root {
    --nav-width: 0px;
  }

  .app-main {
    margin-left: 0;
    padding-bottom: 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-rune-drift: 0s;
    --duration-pendulum: 0s;
    --duration-seal: 0s;
  }
}
</style>
