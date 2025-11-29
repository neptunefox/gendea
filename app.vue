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
  --color-bg: #FAFAF9;
  --color-surface: #FFFFFF;
  --color-border: rgba(0, 0, 0, 0.06);
  --color-border-strong: rgba(0, 0, 0, 0.1);
  --color-text: #1C1917;
  --color-text-secondary: rgba(28, 25, 23, 0.6);
  --color-text-tertiary: #9CA3AF;

  --color-primary: #D4756F;
  --color-primary-hover: #C26660;
  --color-primary-subtle: rgba(212, 117, 111, 0.1);
  --color-primary-ring: rgba(212, 117, 111, 0.2);

  --color-success: #4A7C59;
  --color-success-subtle: rgba(74, 124, 89, 0.2);
  --color-success-bg: rgba(74, 124, 89, 0.05);
  --color-warning: #B45309;
  --color-error: #C26660;
  --color-error-subtle: rgba(194, 102, 96, 0.2);
  --color-error-bg: rgba(194, 102, 96, 0.05);
  --color-info: #1976d2;
  --color-info-subtle: rgba(33, 150, 243, 0.2);
  --color-cauldron: #9575cd;

  --color-surface-translucent: rgba(255, 255, 255, 0.95);
  --color-border-subtle: rgba(0, 0, 0, 0.04);

  --text-xl: 1.5rem;
  --text-lg: 1.125rem;
  --text-base: 0.9375rem;
  --text-sm: 0.8125rem;
  --text-xs: 0.6875rem;

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

  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-bg);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: 'ss01' on, 'ss02' on;
}

body {
  margin: 0;
  font-family: inherit;
  color: inherit;
  background-color: inherit;
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
