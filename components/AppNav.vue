<template>
  <nav class="app-nav">
    <NuxtLink to="/" class="logo">
      <img src="/favicon.svg" alt="Gendea" class="logo-icon" />
      <span>Gendea</span>
    </NuxtLink>

    <div class="nav-links">
      <NuxtLink to="/" class="nav-link" title="Ideas">
        <Sparkles :size="20" />
      </NuxtLink>
      <NuxtLink to="/cauldron" class="nav-link" title="Cauldron">
        <Wand :size="20" />
      </NuxtLink>
      <NuxtLink to="/history" class="nav-link" title="History">
        <Clock :size="20" />
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Sparkles, Wand, Clock } from 'lucide-vue-next'
</script>

<style scoped>
.app-nav {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 0.75rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(212, 117, 111, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  opacity: 0.6;
  transition: all 0.3s ease;
}

.app-nav:hover {
  opacity: 1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1rem;
  font-weight: 700;
  color: #d4756f;
  text-decoration: none;
  transition: color 0.2s;
}

.logo:hover {
  color: #c26660;
}

.logo-icon {
  width: 20px;
  height: 20px;
}

.logo span {
  font-size: 0.9375rem;
}

.nav-links {
  display: flex;
  gap: 0.25rem;
  padding-left: 0.5rem;
  border-left: 1px solid rgba(212, 117, 111, 0.2);
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #8a7566;
  text-decoration: none;
  border-radius: 50%;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #d4756f;
  background: rgba(212, 117, 111, 0.1);
}

.nav-link.router-link-active {
  color: #d4756f;
  background: rgba(212, 117, 111, 0.15);
}

@media (max-width: 768px) {
  .app-nav {
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }

  .logo span {
    display: none;
  }

  .nav-links {
    padding-left: 0.25rem;
  }

  .nav-link {
    width: 32px;
    height: 32px;
  }
}
</style>
