<template>
  <nav class="app-nav">
    <div class="nav-container">
      <NuxtLink to="/spark" class="logo">
        <Lightbulb :size="24" />
        <span>Gendea</span>
      </NuxtLink>

      <div class="nav-links">
        <NuxtLink to="/spark" class="nav-link">
          <Sparkles :size="18" />
          <span>Ideas</span>
        </NuxtLink>
        <NuxtLink to="/saved" class="nav-link">
          <LayoutGrid :size="18" />
          <span>Board</span>
        </NuxtLink>
        <NuxtLink to="/history" class="nav-link">
          <Archive :size="18" />
          <span>History</span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Lightbulb, Sparkles, LayoutGrid, Archive } from 'lucide-vue-next'
</script>

<style scoped>
.app-nav {
  background: white;
  border-bottom: 1px solid #e8ddd4;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4756f;
  text-decoration: none;
  transition: transform 0.2s;
}

.logo:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  color: #666;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #d4756f;
  background: #fef5f4;
}

.nav-link.router-link-active {
  color: #d4756f;
  background: #fef5f4;
}

@media (max-width: 768px) {
  .app-nav {
    padding: 0.75rem 1rem;
  }

  .nav-links {
    gap: 0.25rem;
  }

  .nav-link span {
    display: none;
  }

  .nav-link {
    padding: 0.625rem;
  }

  .logo span {
    display: none;
  }
}
</style>
