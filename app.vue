<template>
  <div class="app-layout">
    <AppNav />
    <main class="app-main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
:root {
  --color-bg: #1a1816;
  --color-surface: #242120;
  --color-surface-raised: #2d2926;

  --color-text: #e8e4e0;
  --color-text-secondary: rgba(232, 228, 224, 0.7);
  --color-text-tertiary: #9a9590;

  --color-primary: #d4a574;
  --color-primary-hover: #e0b585;
  --color-primary-subtle: rgba(212, 165, 116, 0.15);
  --color-primary-ring: rgba(212, 165, 116, 0.25);

  --color-border: rgba(232, 228, 224, 0.08);
  --color-border-strong: rgba(232, 228, 224, 0.15);

  --color-success: #6b9b7a;
  --color-success-subtle: rgba(107, 155, 122, 0.25);
  --color-success-bg: rgba(107, 155, 122, 0.1);
  --color-warning: #d4a574;
  --color-error: #c27a74;
  --color-error-subtle: rgba(194, 122, 116, 0.25);
  --color-error-bg: rgba(194, 122, 116, 0.1);
  --color-info: #7eb8c9;
  --color-info-subtle: rgba(126, 184, 201, 0.25);

  --color-cauldron: #9575cd;
  --color-oracle: #7eb8c9;
  --color-spark: #d4a574;

  --color-glow-amber: rgba(212, 165, 116, 0.4);
  --color-glow-purple: rgba(149, 117, 205, 0.4);
  --color-glow-teal: rgba(126, 184, 201, 0.4);

  --color-oracle-subtle: rgba(126, 184, 201, 0.15);
  --color-cauldron-subtle: rgba(149, 117, 205, 0.15);

  --color-surface-translucent: rgba(36, 33, 32, 0.95);
  --color-border-subtle: rgba(232, 228, 224, 0.04);
  --color-hover-bg: rgba(232, 228, 224, 0.06);

  --text-xl: 1.5rem;
  --text-lg: 1.125rem;
  --text-base: 1rem;
  --text-sm: 0.875rem;
  --text-xs: 0.75rem;

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

  --nav-width: 56px;

  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 450ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-mystical: cubic-bezier(0.4, 0, 0.2, 1);

  --font-body: 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
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
  z-index: 9999;
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
</style>
