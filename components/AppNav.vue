<template>
  <nav class="app-nav">
    <NuxtLink to="/" class="logo">
      <img src="/favicon.svg" alt="Gendea" class="logo-icon" />
    </NuxtLink>

    <div class="nav-links">
      <NuxtLink to="/" class="nav-link" title="Spark — Generate ideas">
        <Flame :size="18" />
        <span class="nav-label">Spark</span>
      </NuxtLink>
      <NuxtLink to="/cauldron" class="nav-link cauldron" title="Cauldron — Combine ideas">
        <FlaskRound :size="18" />
        <span class="nav-label">Combine</span>
      </NuxtLink>
      <NuxtLink to="/oracle" class="nav-link oracle" title="Oracle — Get unstuck">
        <Eye :size="18" />
        <span class="nav-label">Refine</span>
      </NuxtLink>
      <NuxtLink to="/history" class="nav-link history" title="History — Past explorations">
        <Scroll :size="18" />
        <span class="nav-label">History</span>
      </NuxtLink>
    </div>
  </nav>

  <nav class="app-nav-mobile">
    <NuxtLink to="/" class="nav-link" title="Spark">
      <Flame :size="20" />
      <span class="nav-label">Spark</span>
    </NuxtLink>
    <NuxtLink to="/cauldron" class="nav-link cauldron" title="Cauldron">
      <FlaskRound :size="20" />
      <span class="nav-label">Combine</span>
    </NuxtLink>
    <NuxtLink to="/oracle" class="nav-link oracle" title="Oracle">
      <Eye :size="20" />
      <span class="nav-label">Refine</span>
    </NuxtLink>
    <NuxtLink to="/history" class="nav-link history" title="History">
      <Scroll :size="20" />
      <span class="nav-label">History</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { Flame, FlaskRound, Eye, Scroll } from 'lucide-vue-next'
</script>

<style scoped>
.app-nav {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--nav-width);
  background: linear-gradient(180deg, var(--color-surface) 0%, rgba(26, 24, 22, 0.98) 100%);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-6) 0;
  gap: var(--space-3);
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: var(--space-6);
  text-decoration: none;
  color: var(--color-primary);
  transition: all 0.4s var(--ease-out);
}

.logo:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 12px var(--color-glow-amber));
}

.logo-icon {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 0 8px var(--color-glow-amber));
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  width: 52px;
  height: 52px;
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: all 0.3s var(--ease-out);
  position: relative;
}

.nav-label {
  font-size: 10px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.nav-link::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid transparent;
  transition: all 0.3s var(--ease-out);
}

.nav-link:hover {
  color: var(--color-text-secondary);
}

.nav-link:hover::before {
  border-color: rgba(232, 228, 224, 0.1);
}

/* Spark - amber */
.nav-link.router-link-active:not(.cauldron):not(.oracle):not(.history) {
  color: var(--color-primary);
}

.nav-link.router-link-active:not(.cauldron):not(.oracle):not(.history)::before {
  border-color: rgba(212, 165, 116, 0.3);
  box-shadow: 0 0 20px var(--color-glow-amber);
}

/* Cauldron - purple */
.nav-link.cauldron.router-link-active {
  color: var(--color-cauldron);
}

.nav-link.cauldron.router-link-active::before {
  border-color: rgba(149, 117, 205, 0.3);
  box-shadow: 0 0 20px var(--color-glow-purple);
}

/* Oracle - teal */
.nav-link.oracle.router-link-active {
  color: var(--color-oracle);
}

.nav-link.oracle.router-link-active::before {
  border-color: rgba(126, 184, 201, 0.3);
  box-shadow: 0 0 20px var(--color-glow-teal);
}

/* History - muted */
.nav-link.history.router-link-active {
  color: var(--color-text-secondary);
}

.nav-link.history.router-link-active::before {
  border-color: rgba(232, 228, 224, 0.15);
  box-shadow: 0 0 15px rgba(232, 228, 224, 0.1);
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
    height: 72px;
    background: linear-gradient(0deg, var(--color-surface) 0%, rgba(36, 33, 32, 0.98) 100%);
    border-top: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 var(--space-2);
    z-index: 100;
  }

  .app-nav-mobile .nav-link {
    width: 64px;
    height: 56px;
    color: var(--color-text-tertiary);
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    transition: all 0.3s var(--ease-out);
    position: relative;
  }

  .app-nav-mobile .nav-label {
    font-size: 10px;
    font-weight: var(--weight-medium);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .app-nav-mobile .nav-link::before {
    content: '';
    position: absolute;
    inset: 6px;
    border: 1px solid transparent;
    transition: all 0.3s var(--ease-out);
  }

  .app-nav-mobile .nav-link:hover {
    color: var(--color-text-secondary);
  }

  .app-nav-mobile .nav-link.router-link-active:not(.cauldron):not(.oracle):not(.history) {
    color: var(--color-primary);
  }

  .app-nav-mobile .nav-link.router-link-active:not(.cauldron):not(.oracle):not(.history)::before {
    border-color: rgba(212, 165, 116, 0.3);
    box-shadow: 0 0 20px var(--color-glow-amber);
  }

  .app-nav-mobile .nav-link.cauldron.router-link-active {
    color: var(--color-cauldron);
  }

  .app-nav-mobile .nav-link.cauldron.router-link-active::before {
    border-color: rgba(149, 117, 205, 0.3);
    box-shadow: 0 0 20px var(--color-glow-purple);
  }

  .app-nav-mobile .nav-link.oracle.router-link-active {
    color: var(--color-oracle);
  }

  .app-nav-mobile .nav-link.oracle.router-link-active::before {
    border-color: rgba(126, 184, 201, 0.3);
    box-shadow: 0 0 20px var(--color-glow-teal);
  }

  .app-nav-mobile .nav-link.history.router-link-active {
    color: var(--color-text-secondary);
  }

  .app-nav-mobile .nav-link.history.router-link-active::before {
    border-color: rgba(232, 228, 224, 0.15);
    box-shadow: 0 0 15px rgba(232, 228, 224, 0.1);
  }
}
</style>
