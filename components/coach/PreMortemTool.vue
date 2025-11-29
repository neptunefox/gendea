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
  padding-top: var(--space-4);
}

.tool-intro {
  font-size: var(--text-base);
  color: var(--color-text);
  margin: 0 0 var(--space-4) 0;
  line-height: 1.6;
  font-weight: var(--weight-medium);
}

.tool-prompt {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: var(--space-4) 0 var(--space-2) 0;
  font-weight: var(--weight-semibold);
}

textarea,
input[type='text'] {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: inherit;
  resize: vertical;
  transition: all var(--duration-normal) var(--ease-out);
}

textarea:focus,
input[type='text']:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-subtle);
}

.tool-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
}

.tool-research {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: 1.5;
  font-style: italic;
}
</style>
