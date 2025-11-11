<template>
  <div class="critique-card">
    <h3 class="critique-title">Coach Feedback</h3>

    <div class="critique-section">
      <h4 class="section-label">The Bar</h4>
      <p class="section-content">{{ critique.bar }}</p>
    </div>

    <div class="critique-section">
      <h4 class="section-label">You Can Do This</h4>
      <p class="section-content">{{ critique.affirmation }}</p>
    </div>

    <div class="critique-section">
      <h4 class="section-label">Process Changes</h4>
      <ul class="process-list">
        <li v-for="(change, index) in critique.processChanges" :key="index" class="process-item">
          {{ change }}
        </li>
      </ul>
    </div>

    <div v-if="critique.focusAreas && critique.focusAreas.length > 0" class="critique-section">
      <h4 class="section-label">Focus Areas</h4>
      <ul class="focus-list">
        <li v-for="(area, index) in critique.focusAreas" :key="index" class="focus-item">
          {{ area }}
        </li>
      </ul>
    </div>

    <button v-if="dismissable" class="dismiss-button" @click="$emit('dismiss')">Got it</button>
  </div>
</template>

<script setup lang="ts">
interface Critique {
  bar: string
  affirmation: string
  processChanges: string[]
  focusAreas?: string[]
}

defineProps<{
  critique: Critique
  dismissable?: boolean
}>()

defineEmits<{
  dismiss: []
}>()
</script>

<style scoped>
.critique-card {
  padding: 1.5rem;
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}

.critique-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 1.25rem 0;
}

.critique-section {
  margin-bottom: 1.25rem;
}

.critique-section:last-of-type {
  margin-bottom: 0;
}

.section-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #78350f;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-content {
  font-size: 0.9375rem;
  color: #451a03;
  line-height: 1.6;
  margin: 0;
}

.process-list,
.focus-list {
  margin: 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.process-item,
.focus-item {
  font-size: 0.9375rem;
  color: #451a03;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.process-item:last-child,
.focus-item:last-child {
  margin-bottom: 0;
}

.dismiss-button {
  width: 100%;
  padding: 0.75rem;
  background: #92400e;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1.25rem;
}

.dismiss-button:hover {
  background: #78350f;
}
</style>
