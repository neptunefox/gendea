<template>
  <div class="premortem-tool">
    <p class="tool-intro">Imagine it's 2 months from now and this failed. What happened?</p>

    <textarea v-model="failureReason" placeholder="Most likely reason it didn't work..." rows="3" />

    <p class="tool-prompt">What's one test that would surface that risk early?</p>

    <input v-model="earlyTest" type="text" placeholder="Smallest test to check this..." />

    <div class="tool-footer">
      <p class="tool-research">
        Research: Pre-mortems reduce overconfidence and surface risks 30% better than standard
        planning.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SavedIdea {
  id: string
  text: string
}

defineProps<{
  idea: SavedIdea
}>()

const failureReason = ref('')
const earlyTest = ref('')
</script>

<style scoped>
.premortem-tool {
  padding-top: 1rem;
}

.tool-intro {
  font-size: 0.9375rem;
  color: #40312b;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  font-weight: 500;
}

.tool-prompt {
  font-size: 0.875rem;
  color: #8a7566;
  margin: 1rem 0 0.5rem 0;
  font-weight: 600;
}

textarea,
input[type='text'] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #f0e5e0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
}

textarea:focus,
input[type='text']:focus {
  outline: none;
  border-color: #d4756f;
  box-shadow: 0 0 0 2px rgba(212, 117, 111, 0.1);
}

.tool-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(212, 117, 111, 0.1);
}

.tool-research {
  font-size: 0.8125rem;
  color: #b8a89d;
  margin: 0;
  line-height: 1.5;
  font-style: italic;
}
</style>
