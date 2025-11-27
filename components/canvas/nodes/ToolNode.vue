<template>
  <div class="tool-node" :class="{ selected: props.selected }">
    <Handle type="target" :position="Position.Top" />
    
    <div class="tool-header">
      <Wrench :size="18" class="tool-icon" />
      <span class="tool-label">Tool / Resource</span>
    </div>

    <div class="tool-name">
      {{ props.data.name || 'Unnamed Tool' }}
    </div>

    <div v-if="props.data.description" class="tool-description">
      {{ props.data.description }}
    </div>

    <a
      v-if="props.data.url"
      :href="props.data.url"
      target="_blank"
      rel="noopener noreferrer"
      class="tool-link nodrag"
      @click.stop
    >
      <ExternalLink :size="14" />
      <span>Open Resource</span>
    </a>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Wrench, ExternalLink } from 'lucide-vue-next'

const props = defineProps<NodeProps>()
</script>

<style scoped>
.tool-node {
  min-width: 200px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%);
  border: 2px solid #64b5f6;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(100, 181, 246, 0.15);
  transition: all 0.2s ease;
}

.tool-node:hover {
  box-shadow: 0 4px 16px rgba(100, 181, 246, 0.25);
}

.tool-node.selected {
  outline: 2px solid #64b5f6;
  outline-offset: 2px;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tool-icon {
  color: #64b5f6;
}

.tool-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64b5f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tool-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #40312b;
  margin-bottom: 0.5rem;
}

.tool-description {
  font-size: 0.8125rem;
  color: #8b7a75;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.tool-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #64b5f6;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #64b5f6;
  text-decoration: none;
  transition: all 0.2s ease;
}

.tool-link:hover {
  background: #64b5f6;
  color: white;
}
</style>
