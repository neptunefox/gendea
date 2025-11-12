<template>
  <div class="welcome-page">
    <div class="welcome-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">Spark</span>
          <span class="subtitle-line">Ideas that matter</span>
        </h1>
        <p class="hero-description">
          A research-backed tool for generating ideas and bringing them to life—without the
          pressure.
        </p>
      </div>
    </div>

    <div class="modes-section">
      <div class="mode-card spark-card">
        <div class="mode-icon spark-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h2 class="mode-title">Spark Mode</h2>
        <p class="mode-description">
          Explore possibilities. Type anything vague or concrete, get diverse ideas, save what
          resonates. No pressure to implement.
        </p>
        <ul class="mode-features">
          <li>✨ AI-powered idea generation</li>
          <li>🌿 Branch and explore variations</li>
          <li>❤️ Save ideas to your board</li>
          <li>🎨 Beautiful, calm interface</li>
        </ul>
        <NuxtLink to="/spark" class="mode-button spark-button">
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Start Exploring
        </NuxtLink>
      </div>

      <div class="mode-card build-card">
        <div class="mode-icon build-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h2 class="mode-title">Coach Workspace</h2>
        <p class="mode-description">
          Turn ideas into action with guided support. Clarify your North Star, plan with
          constraints, and track progress—all in one flow.
        </p>
        <ul class="mode-features">
          <li>🎯 Clarify: North Star + ladder steps</li>
          <li>📋 Plan: If-then planning with cues</li>
          <li>📊 Progress: Evidence logging</li>
          <li>✨ AI coaching at every step</li>
        </ul>
        <NuxtLink to="/spark" class="mode-button build-button">
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
          Get Started
        </NuxtLink>
      </div>
    </div>

    <div class="research-note">
      <p>
        Built on cognitive psychology research: incubation, parallel ideation, wise feedback, and
        progress monitoring.
      </p>
    </div>
  </div>
</template>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 4rem 2rem;
}

.welcome-hero {
  max-width: 800px;
  margin: 0 auto 4rem;
  text-align: center;
}

.hero-title {
  margin: 0 0 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gradient-text {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.03em;
}

.subtitle-line {
  font-size: 2rem;
  font-weight: 600;
  color: #374151;
  letter-spacing: -0.01em;
}

.hero-description {
  font-size: 1.25rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

.modes-section {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.mode-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 10px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-8px);
  box-shadow:
    0 8px 12px rgba(0, 0, 0, 0.08),
    0 20px 40px rgba(0, 0, 0, 0.12);
}

.spark-card:hover {
  border-color: #667eea;
}

.build-card:hover {
  border-color: #10b981;
}

.mode-icon {
  width: 80px;
  height: 80px;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.spark-icon {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
}

.spark-icon svg {
  width: 48px;
  height: 48px;
  color: #7c3aed;
  stroke-width: 1.5;
}

.build-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.build-icon svg {
  width: 48px;
  height: 48px;
  color: #059669;
  stroke-width: 1.5;
}

.mode-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.mode-description {
  font-size: 1.0625rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.mode-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.mode-features li {
  font-size: 1rem;
  color: #374151;
  padding: 0.5rem 0;
  line-height: 1.5;
}

.mode-button {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.spark-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.spark-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.build-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.build-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}

.button-icon {
  width: 20px;
  height: 20px;
}

.research-note {
  max-width: 800px;
  margin: 4rem auto 0;
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}

.research-note p {
  margin: 0;
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .welcome-page {
    padding: 2rem 1rem;
  }

  .gradient-text {
    font-size: 3rem;
  }

  .subtitle-line {
    font-size: 1.5rem;
  }

  .hero-description {
    font-size: 1.125rem;
  }

  .modes-section {
    grid-template-columns: 1fr;
  }

  .mode-card {
    padding: 2rem;
  }
}
</style>
