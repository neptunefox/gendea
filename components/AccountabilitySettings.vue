<template>
  <div class="accountability-settings">
    <h4 class="section-title">Optional: Accountability Reporting</h4>
    <p class="section-description">
      Get a weekly summary of your progress and learnings. No streaks or likes—just clear progress
      lines and learning notes.
    </p>

    <div class="settings-form">
      <div class="toggle-group">
        <label class="toggle-label">
          <input v-model="settings.enabled" type="checkbox" class="toggle-input" >
          <span class="toggle-text">Enable weekly accountability reports</span>
        </label>
      </div>

      <div v-if="settings.enabled" class="email-group">
        <label class="form-label">Send report to (optional)</label>
        <input
          v-model="settings.recipientEmail"
          type="email"
          class="form-input"
          placeholder="your@email.com or partner@email.com"
        >
        <p class="help-text">Leave blank to send to yourself only</p>
      </div>

      <div v-if="settings.enabled" class="preview-section">
        <p class="preview-label">Your weekly report will include:</p>
        <ul class="preview-list">
          <li>Recorded outcomes from your tests</li>
          <li>What you learned each time</li>
          <li>Your next steps</li>
          <li>Energy and expectancy trends</li>
        </ul>
        <p class="preview-note">No gamification—just your real progress and insights.</p>
      </div>

      <button class="save-button" :disabled="saving" @click="saveSettings">
        {{ saving ? 'Saving...' : 'Save Settings' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const settings = ref({
  enabled: false,
  recipientEmail: '',
  frequency: 'weekly' as const
})

const saving = ref(false)

onMounted(async () => {
  try {
    const response = await $fetch<{
      settings: { enabled: number; recipientEmail: string | null; frequency: string }
    }>('/api/accountability-settings')
    settings.value = {
      enabled: response.settings.enabled === 1,
      recipientEmail: response.settings.recipientEmail || '',
      frequency: 'weekly'
    }
  } catch (error) {
    console.error('Failed to load accountability settings:', error)
  }
})

async function saveSettings() {
  saving.value = true
  try {
    await $fetch('/api/accountability-settings', {
      method: 'PUT',
      body: {
        enabled: settings.value.enabled,
        recipientEmail: settings.value.recipientEmail || undefined,
        frequency: settings.value.frequency
      }
    })
  } catch (error) {
    console.error('Failed to save accountability settings:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.accountability-settings {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f0f9ff;
  border-radius: 0.75rem;
  border: 1px solid #bae6fd;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.section-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.toggle-group {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle-input {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.toggle-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #374151;
}

.email-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  background: white;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.preview-section {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.preview-list {
  margin: 0 0 0.75rem 1.25rem;
  padding: 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
}

.preview-list li {
  margin-bottom: 0.25rem;
}

.preview-note {
  font-size: 0.8125rem;
  color: #6b7280;
  font-style: italic;
  margin: 0;
}

.save-button {
  padding: 0.75rem;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #0284c7;
}

.save-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
