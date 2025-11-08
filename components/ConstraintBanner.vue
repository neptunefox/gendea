<template>
  <div v-if="show" class="constraint-banner">
    <div class="banner-content">
      <span class="icon">💡</span>
      <p class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  hasConstraints: boolean
}>()

const show = computed(() => true)

const message = computed(() => {
  if (props.hasConstraints) {
    return 'Constraint applied — this raises your creativity odds'
  }
  return 'Moderate meaningful constraints help originality'
})
</script>

<style scoped>
.constraint-banner {
  padding: 0.75rem 1rem;
  background-color: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.message {
  font-size: 0.875rem;
  color: #92400e;
  margin: 0;
}
</style>
