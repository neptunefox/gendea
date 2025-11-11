<template>
  <div class="tree-canvas">
    <div class="capture-grid">
      <div class="problem-input">
        <label for="problem">What's the problem or wish?</label>
        <input
          id="problem"
          v-model="problemText"
          type="text"
          placeholder="Describe in one line..."
          class="problem-field"
        />
        <button v-if="showSparkButton" class="spark-button" @click="toggleWarmupOptions">
          Need a spark?
        </button>
        <div v-if="showWarmupOptions" class="warmup-options">
          <button class="warmup-option" @click="handleWarmup('constraint')">
            Name a constraint first
          </button>
          <button class="warmup-option" @click="handleWarmup('stuck')">
            List where you last felt stuck
          </button>
          <button class="warmup-option" @click="handleWarmup('seed')">
            Ask Diverger for a seed
          </button>
        </div>
        <div v-if="aiStarter" class="ai-starter">
          <span class="ai-label">{{ aiStarterLabel }}</span>
          <p class="ai-starter-text">{{ aiStarter }}</p>
        </div>
      </div>

      <div class="assumptions-section">
        <label>What are you assuming?</label>
        <div class="assumptions-grid">
          <input
            v-for="i in 3"
            :key="i"
            v-model="assumptions[i - 1]"
            type="text"
            :placeholder="`Assumption ${i}`"
            class="assumption-field"
          />
        </div>
      </div>

      <div class="anonymous-option">
        <label class="checkbox-label">
          <input v-model="isAnonymous" type="checkbox" class="checkbox" />
          <span>Submit anonymously (for team use)</span>
        </label>
        <p class="anonymous-hint">Anonymous ideas reduce evaluation fear in team settings</p>
      </div>

      <button class="save-button selected" :disabled="!canSave" @click="handleSave">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ initialProblem?: string }>()

const problemText = ref('')
const assumptions = ref(['', '', ''])
const isAnonymous = ref(false)
const showWarmupOptions = ref(false)
const aiStarter = ref('')
const aiStarterLabel = ref('')

const canSave = computed(() => problemText.value.trim().length > 0)
const showSparkButton = computed(() => problemText.value.trim().length === 0 && !aiStarter.value)

const emit = defineEmits<{
  save: [data: { problem: string; assumptions: string[]; isAnonymous: boolean }]
}>()

watch(
  () => props.initialProblem,
  value => {
    if (typeof value === 'string' && value !== problemText.value) {
      problemText.value = value
    }
  },
  { immediate: true }
)

const toggleWarmupOptions = () => {
  showWarmupOptions.value = !showWarmupOptions.value
}

const handleWarmup = async (type: 'constraint' | 'stuck' | 'seed') => {
  showWarmupOptions.value = false

  const prompts = {
    constraint:
      'Generate a creative problem or wish that can be solved using only existing skills and resources',
    stuck:
      'Generate a relatable problem statement about a common point where people feel stuck in their work or life',
    seed: 'Generate an interesting problem or opportunity that someone might want to explore'
  }

  const labels = {
    constraint: 'AI starter (constraint-first)',
    stuck: 'AI starter (stuck point)',
    seed: 'AI starter (diverger seed)'
  }

  try {
    const response = await $fetch('/api/diverge', {
      method: 'POST',
      body: {
        problem: prompts[type],
        userIdeas: []
      }
    })

    if (response.ideas && response.ideas.length > 0) {
      aiStarter.value = response.ideas[0].text
      aiStarterLabel.value = labels[type]
      problemText.value = response.ideas[0].text
    }
  } catch (error) {
    console.error('Failed to generate warmup:', error)
  }
}

const handleSave = () => {
  if (!canSave.value) return

  emit('save', {
    problem: problemText.value,
    assumptions: assumptions.value.filter(a => a.trim().length > 0),
    isAnonymous: isAnonymous.value
  })
}
</script>

<style scoped>
.tree-canvas {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.capture-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.problem-input label,
.assumptions-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.problem-field {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: border-color 0.2s;
}

.problem-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.assumptions-grid {
  display: grid;
  gap: 0.75rem;
}

.assumption-field {
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  transition: border-color 0.2s;
}

.assumption-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.save-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: flex-start;
}

.save-button.selected {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.save-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.save-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.anonymous-option {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.checkbox {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.anonymous-hint {
  margin-top: 0.5rem;
  margin-left: 1.625rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.spark-button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
  background-color: transparent;
  border: 1px solid #3b82f6;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.spark-button:hover {
  background-color: #eff6ff;
}

.warmup-options {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.warmup-option {
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.warmup-option:hover {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.ai-starter {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #eff6ff;
  border-radius: 0.5rem;
  border: 1px solid #bfdbfe;
}

.ai-label {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e40af;
  background-color: #dbeafe;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.ai-starter-text {
  margin: 0;
  font-size: 0.875rem;
  color: #1e3a8a;
  line-height: 1.5;
}
</style>
