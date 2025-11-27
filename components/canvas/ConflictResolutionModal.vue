<script setup lang="ts">
import type { ConflictInfo } from '~/composables/useCanvas'

const props = defineProps<{
  conflict: ConflictInfo
}>()

const emit = defineEmits<{
  resolve: ['keep-local' | 'use-server' | 'reload']
  dismiss: []
}>()

const conflictTypeLabel = computed(() => {
  switch (props.conflict.type) {
    case 'node': return 'Node'
    case 'edge': return 'Connection'
    case 'state': return 'Canvas View'
    default: return 'Item'
  }
})

function getDisplayData(data: any) {
  if (props.conflict.type === 'node') {
    return {
      type: data.type,
      position: data.position ? `(${Math.round(data.position.x)}, ${Math.round(data.position.y)})` : 'N/A',
      content: data.data?.label || data.data?.text || 'No content'
    }
  }
  if (props.conflict.type === 'edge') {
    return {
      type: data.type || 'default',
      label: data.label || 'No label'
    }
  }
  if (props.conflict.type === 'state') {
    return {
      viewport: `(${Math.round(data.viewportX)}, ${Math.round(data.viewportY)})`,
      zoom: `${Math.round(data.zoom * 100)}%`
    }
  }
  return data
}
</script>

<template>
  <div class="conflict-overlay">
    <div class="conflict-modal">
      <div class="conflict-header">
        <svg class="conflict-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3>{{ conflictTypeLabel }} Modified</h3>
      </div>
      
      <p class="conflict-message">
        This {{ conflictTypeLabel.toLowerCase() }} was modified by another session. Choose how to proceed:
      </p>

      <div class="conflict-comparison">
        <div class="conflict-version">
          <h4>Your Changes</h4>
          <div class="version-data">
            <template v-for="(value, key) in getDisplayData(conflict.localData)" :key="key">
              <div class="data-row">
                <span class="data-label">{{ key }}:</span>
                <span class="data-value">{{ value }}</span>
              </div>
            </template>
          </div>
        </div>
        
        <div class="conflict-divider">
          <span>vs</span>
        </div>
        
        <div class="conflict-version">
          <h4>Server Version</h4>
          <div class="version-data">
            <template v-for="(value, key) in getDisplayData(conflict.serverData)" :key="key">
              <div class="data-row">
                <span class="data-label">{{ key }}:</span>
                <span class="data-value">{{ value }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="conflict-actions">
        <button class="btn btn-local" @click="emit('resolve', 'keep-local')">
          Keep My Changes
        </button>
        <button class="btn btn-server" @click="emit('resolve', 'use-server')">
          Use Server Version
        </button>
        <button class="btn btn-reload" @click="emit('resolve', 'reload')">
          Reload Canvas
        </button>
      </div>

      <button class="dismiss-btn" @click="emit('dismiss')">
        Dismiss
      </button>
    </div>
  </div>
</template>

<style scoped>
.conflict-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.conflict-modal {
  background: #fffaf5;
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 2px solid #d4756f;
}

.conflict-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.conflict-icon {
  width: 28px;
  height: 28px;
  color: #d4756f;
}

.conflict-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d2d2d;
}

.conflict-message {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.conflict-comparison {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.conflict-version {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e0d5cf;
}

.conflict-version h4 {
  margin: 0 0 8px;
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.version-data {
  font-size: 0.875rem;
}

.data-row {
  display: flex;
  gap: 8px;
  padding: 4px 0;
}

.data-label {
  color: #888;
  text-transform: capitalize;
}

.data-value {
  color: #2d2d2d;
  font-weight: 500;
  word-break: break-word;
}

.conflict-divider {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 0.75rem;
  font-weight: 600;
}

.conflict-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  min-width: 120px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-local {
  background: #d4756f;
  color: white;
}

.btn-local:hover {
  background: #c4655f;
}

.btn-server {
  background: #6b8e7b;
  color: white;
}

.btn-server:hover {
  background: #5b7e6b;
}

.btn-reload {
  background: #e0d5cf;
  color: #666;
}

.btn-reload:hover {
  background: #d0c5bf;
}

.dismiss-btn {
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  background: transparent;
  border: none;
  color: #999;
  font-size: 0.875rem;
  cursor: pointer;
}

.dismiss-btn:hover {
  color: #666;
}
</style>
