<template>
  <div class="page-container">
    <TreeCanvas v-if="!savedNode" @save="handleSave" />
    
    <div v-else class="save-confirmation">
      <div class="confirmation-message">
        <h2>✓ Save confirmed</h2>
        <p class="node-name">{{ nodeName }}</p>
        
        <div v-if="suggestedTags.length > 0" class="tags-section">
          <p class="tags-label">Suggested tags:</p>
          <div class="tags">
            <span v-for="tag in suggestedTags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
        
        <p class="nudge">Ready to plan your next steps?</p>
        
        <button @click="resetForm" class="new-idea-button">
          Start New Idea
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Node } from '~/types/node'

const { saveNode, generateNodeName } = useNodeSave()

const savedNode = ref<Node | null>(null)
const nodeName = ref('')
const suggestedTags = ref<string[]>([])

const handleSave = async (data: { problem: string; assumptions: string[] }) => {
  try {
    const result = await saveNode(data)
    savedNode.value = result.node
    nodeName.value = generateNodeName(data.problem)
    suggestedTags.value = result.suggestedTags
  } catch (error) {
    console.error('Failed to save node:', error)
  }
}

const resetForm = () => {
  savedNode.value = null
  nodeName.value = ''
  suggestedTags.value = []
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f9fafb;
}

.save-confirmation {
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.confirmation-message {
  text-align: center;
}

.confirmation-message h2 {
  color: #10b981;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.node-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
}

.tags-section {
  margin-bottom: 1.5rem;
}

.tags-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.nudge {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.new-idea-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-idea-button:hover {
  background-color: #2563eb;
}
</style>
