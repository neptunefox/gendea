<template>
  <nav class="app-nav">
    <NuxtLink to="/" class="logo">
      <img src="/favicon.svg" alt="Gendea" class="logo-icon" />
    </NuxtLink>

    <div class="nav-links">
      <NuxtLink
        to="/"
        class="nav-link"
        title="Spark — Generate many ideas from one"
        @mouseenter="handleNavHover($event, 'spark')"
      >
        <Flame :size="18" />
        <span class="nav-label">Spark</span>
      </NuxtLink>
      <NuxtLink
        to="/cauldron"
        class="nav-link cauldron"
        title="Brew — Combine ideas into one"
        @mouseenter="handleNavHover($event, 'cauldron')"
      >
        <FlaskRound :size="18" />
        <span class="nav-label">Brew</span>
      </NuxtLink>
      <NuxtLink
        to="/oracle"
        class="nav-link oracle"
        title="Consult — Talk through what's blocking you"
        @mouseenter="handleNavHover($event, 'oracle')"
      >
        <Eye :size="18" />
        <span class="nav-label">Consult</span>
      </NuxtLink>
      <NuxtLink
        to="/history"
        class="nav-link history"
        title="History — Past explorations"
        @mouseenter="handleNavHover($event, 'history')"
      >
        <Scroll :size="18" />
        <span class="nav-label">History</span>
      </NuxtLink>
    </div>

    <div class="nav-footer">
      <SoundToggle />
    </div>

    <Teleport to="body">
      <div class="nav-particles-container">
        <div
          v-for="particle in navParticles"
          :key="particle.id"
          class="nav-particle"
          :style="{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity
          }"
        />
      </div>
    </Teleport>
  </nav>

  <nav class="app-nav-mobile">
    <NuxtLink to="/" class="nav-link" title="Spark">
      <Flame :size="20" />
      <span class="nav-label">Spark</span>
    </NuxtLink>
    <NuxtLink to="/cauldron" class="nav-link cauldron" title="Brew">
      <FlaskRound :size="20" />
      <span class="nav-label">Brew</span>
    </NuxtLink>
    <NuxtLink to="/oracle" class="nav-link oracle" title="Consult">
      <Eye :size="20" />
      <span class="nav-label">Consult</span>
    </NuxtLink>
    <NuxtLink to="/history" class="nav-link history" title="History">
      <Scroll :size="20" />
      <span class="nav-label">History</span>
    </NuxtLink>
    <SoundToggle class="mobile-sound-toggle" />
  </nav>
</template>

<script setup lang="ts">
import { Flame, FlaskRound, Eye, Scroll } from 'lucide-vue-next'
import { ref, onUnmounted } from 'vue'

import SoundToggle from '~/components/SoundToggle.vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

interface NavParticle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  color: string
}

const prefersReducedMotion = useReducedMotion()
const navParticles = ref<NavParticle[]>([])
let particleIdCounter = 0
let cleanupTimeout: ReturnType<typeof setTimeout> | null = null

function handleNavHover(event: MouseEvent, variant: 'spark' | 'cauldron' | 'oracle' | 'history') {
  if (prefersReducedMotion.value) return

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()

  const colors: Record<string, string> = {
    spark: 'hsla(165, 75%, 58%, 0.6)',
    cauldron: 'hsla(140, 60%, 45%, 0.6)',
    oracle: 'hsla(200, 70%, 72%, 0.6)',
    history: 'hsla(260, 15%, 55%, 0.5)'
  }

  const count = 3
  for (let i = 0; i < count; i++) {
    navParticles.value.push({
      id: particleIdCounter++,
      x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 20,
      y: rect.top + rect.height / 2 + (Math.random() - 0.5) * 10,
      size: 3 + Math.random() * 3,
      opacity: 0.6 + Math.random() * 0.4,
      color: colors[variant]
    })
  }

  if (cleanupTimeout) clearTimeout(cleanupTimeout)
  cleanupTimeout = setTimeout(() => {
    navParticles.value = []
  }, 800)
}

onUnmounted(() => {
  if (cleanupTimeout) clearTimeout(cleanupTimeout)
})
</script>

<style scoped>
.app-nav {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--nav-width);
  background: linear-gradient(180deg, var(--color-surface) 0%, hsla(220, 20%, 6%, 0.98) 100%);
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
  filter: drop-shadow(0 0 12px var(--color-glow-spark));
}

.logo-icon {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 0 8px var(--color-glow-spark));
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.nav-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: var(--space-4);
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  width: 64px;
  height: 52px;
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: all 0.3s var(--ease-out);
  position: relative;
}

.nav-label {
  font-size: 9px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.03em;
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
  border-color: hsla(200, 25%, 94%, 0.1);
}

.nav-link.router-link-active:not(.cauldron):not(.oracle):not(.history) {
  color: var(--color-primary);
}

.nav-link.router-link-active:not(.cauldron):not(.oracle):not(.history)::before {
  border-color: hsla(165, 75%, 58%, 0.3);
  box-shadow: 0 0 20px var(--color-glow-spark);
}

.nav-link.cauldron.router-link-active {
  color: var(--color-cauldron);
}

.nav-link.cauldron.router-link-active::before {
  border-color: hsla(140, 60%, 45%, 0.3);
  box-shadow: 0 0 20px var(--color-glow-cauldron);
}

.nav-link.oracle.router-link-active {
  color: var(--color-oracle);
}

.nav-link.oracle.router-link-active::before {
  border-color: hsla(200, 70%, 72%, 0.3);
  box-shadow: 0 0 20px var(--color-glow-oracle);
}

.nav-link.history.router-link-active {
  color: var(--color-history);
}

.nav-link.history.router-link-active::before {
  border-color: hsla(260, 15%, 55%, 0.3);
  box-shadow: 0 0 15px var(--color-glow-history);
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
    background: linear-gradient(0deg, var(--color-surface) 0%, hsla(220, 18%, 10%, 0.98) 100%);
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
    font-size: 9px;
    font-weight: var(--weight-medium);
    letter-spacing: 0.03em;
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
    border-color: hsla(165, 75%, 58%, 0.3);
    box-shadow: 0 0 20px var(--color-glow-spark);
  }

  .app-nav-mobile .nav-link.cauldron.router-link-active {
    color: var(--color-cauldron);
  }

  .app-nav-mobile .nav-link.cauldron.router-link-active::before {
    border-color: hsla(140, 60%, 45%, 0.3);
    box-shadow: 0 0 20px var(--color-glow-cauldron);
  }

  .app-nav-mobile .nav-link.oracle.router-link-active {
    color: var(--color-oracle);
  }

  .app-nav-mobile .nav-link.oracle.router-link-active::before {
    border-color: hsla(200, 70%, 72%, 0.3);
    box-shadow: 0 0 20px var(--color-glow-oracle);
  }

  .app-nav-mobile .nav-link.history.router-link-active {
    color: var(--color-history);
  }

  .app-nav-mobile .nav-link.history.router-link-active::before {
    border-color: hsla(260, 15%, 55%, 0.3);
    box-shadow: 0 0 15px var(--color-glow-history);
  }

  .app-nav-mobile .mobile-sound-toggle {
    width: 44px;
    height: 44px;
  }
}

.nav-particles-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99;
}

.nav-particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  animation: nav-particle-float 0.8s ease-out forwards;
}

@keyframes nav-particle-float {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, calc(-50% - 20px)) scale(0);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-particle {
    display: none;
  }
}
</style>
