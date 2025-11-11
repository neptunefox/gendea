<template>
  <div>
    <AppNav />
    <NuxtPage />
  </div>
</template>

<style>
:root {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  line-height: 1.5;
  color: #1f2937;
  background-color: #f9fafb;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
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

button,
.button,
[role='button'] {
  min-width: 44px;
  min-height: 44px;
  touch-action: manipulation;
}

.view-transition {
  animation: viewFadeIn 0.3s ease-out;
}

@keyframes viewFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cta-bottom-right {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
}

@media (max-width: 640px) {
  .cta-bottom-right {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
