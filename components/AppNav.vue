<template>
  <nav class="app-nav">
    <NuxtLink to="/" class="logo">
      <img src="/favicon.svg" alt="Gendea" class="logo-icon" />
    </NuxtLink>

    <div class="nav-links">
      <NuxtLink to="/" class="nav-link" title="Spark">
        <Lightbulb :size="20" />
      </NuxtLink>
      <NuxtLink to="/cauldron" class="nav-link" title="Cauldron">
        <FlaskConical :size="20" />
      </NuxtLink>
      <NuxtLink to="/oracle" class="nav-link" title="Oracle">
        <HelpCircle :size="20" />
      </NuxtLink>
      <NuxtLink to="/history" class="nav-link" title="History">
        <Clock :size="20" />
      </NuxtLink>
    </div>
  </nav>

  <nav class="app-nav-mobile">
    <NuxtLink to="/" class="nav-link" title="Spark">
      <Lightbulb :size="20" />
    </NuxtLink>
    <NuxtLink to="/cauldron" class="nav-link" title="Cauldron">
      <FlaskConical :size="20" />
    </NuxtLink>
    <NuxtLink to="/oracle" class="nav-link" title="Oracle">
      <HelpCircle :size="20" />
    </NuxtLink>
    <NuxtLink to="/history" class="nav-link" title="History">
      <Clock :size="20" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { Lightbulb, HelpCircle, FlaskConical, Clock } from 'lucide-vue-next'
</script>

<style scoped>
.app-nav {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--nav-width);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4) 0;
  gap: var(--space-2);
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: var(--space-4);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background var(--duration-fast) var(--ease-out);
}

.logo:hover {
  background: var(--color-primary-subtle);
}

.logo-icon {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 0 6px var(--color-glow-amber));
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--color-text-tertiary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}

.nav-link:hover {
  background: var(--color-hover-bg);
  color: var(--color-text-secondary);
}

.nav-link.router-link-active {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  box-shadow: 0 0 12px var(--color-glow-amber);
}

.app-nav-mobile {
  display: none;
}

@media (max-width: 768px) {
  .app-nav {
    display: none;
  }

  .app-nav-mobile {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 var(--space-4);
    z-index: 100;
  }

  .app-nav-mobile .nav-link {
    width: 48px;
    height: 48px;
    color: var(--color-text-tertiary);
    text-decoration: none;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--duration-fast) var(--ease-out);
  }

  .app-nav-mobile .nav-link:hover {
    background: var(--color-hover-bg);
    color: var(--color-text-secondary);
  }

  .app-nav-mobile .nav-link.router-link-active {
    background: var(--color-primary-subtle);
    color: var(--color-primary);
    box-shadow: 0 0 12px var(--color-glow-amber);
  }
}
</style>
