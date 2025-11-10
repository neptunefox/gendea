<template>
  <nav class="app-nav">
    <div class="nav-container">
      <NuxtLink to="/" class="logo">Gendea</NuxtLink>

      <div class="nav-links">
        <NuxtLink to="/" class="nav-link">Workspace</NuxtLink>
        <NuxtLink to="/archives" class="nav-link">Archives</NuxtLink>
        <NuxtLink to="/metrics" class="nav-link">Metrics</NuxtLink>
        <NuxtLink to="/settings" class="nav-link">Settings</NuxtLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #3b82f6;
}
</style>
