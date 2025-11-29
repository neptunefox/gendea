<template>
  <div class="commit-phase">
    <div class="phase-header">
      <h2>Commit to a test</h2>
      <p class="phase-subtitle">What's the smallest honest test you can run?</p>
    </div>

    <div v-if="isGenerating" class="generating-state">
      <div class="generating-header">
        <Loader :size="24" class="spin" />
        <p>
          Crafting test ideas<span class="dots"><span>.</span><span>.</span><span>.</span></span>
        </p>
      </div>

      <div class="streaming-tests">
        <div
          v-for="(test, index) in streamingTests"
          :key="index"
          class="test-option streaming"
          :style="{ animationDelay: `${index * 0.15}s` }"
        >
          <div class="test-number">{{ index + 1 }}</div>
          <div class="test-content">
            <p class="test-description">{{ test.description }}</p>
            <p v-if="test.successSignal" class="test-signal">✓ {{ test.successSignal }}</p>
          </div>
        </div>

        <div
          v-for="n in 3 - streamingTests.length"
          :key="'placeholder-' + n"
          class="test-placeholder"
        >
          <div class="placeholder-number">{{ streamingTests.length + n }}</div>
          <div class="placeholder-lines">
            <div class="placeholder-line long"></div>
            <div class="placeholder-line short"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="phase-content">
      <div class="test-suggestions">
        <h3>Test options</h3>
        <p class="section-hint">Pick one or write your own</p>

        <div class="suggestions-grid">
          <button
            v-for="(test, index) in testSuggestions"
            :key="index"
            class="test-option"
            :class="{ selected: selectedTest === index }"
            @click="selectTest(index)"
          >
            <div class="test-number">{{ index + 1 }}</div>
            <div class="test-content">
              <p class="test-description">{{ test.description }}</p>
              <p class="test-signal">✓ Success: {{ test.successSignal }}</p>
            </div>
          </button>
        </div>

        <button class="ghost-btn" @click="generateTests">
          {{ testSuggestions.length > 0 ? 'Generate different options' : 'Generate test ideas' }}
        </button>
      </div>

      <div v-if="selectedTest !== null" class="commitment-form">
        <h3>Make it concrete</h3>
        <p class="section-hint">When and where will you do this?</p>

        <div class="form-group">
          <label>When?</label>
          <input
            v-model="commitment.when"
            type="text"
            placeholder="e.g., Tonight 7pm, Tomorrow morning, This weekend"
          />
        </div>

        <div class="form-group">
          <label>Where?</label>
          <input
            v-model="commitment.where"
            type="text"
            placeholder="e.g., At my desk, Coffee shop, Online"
          />
        </div>

        <div class="commitment-preview">
          <p class="preview-label">Your commitment:</p>
          <p class="preview-text">
            <strong>If</strong> it's {{ commitment.when || '[when]' }} and I'm at
            {{ commitment.where || '[where]' }}, <strong>then</strong> I will
            {{ testSuggestions[selectedTest].description }}
          </p>
        </div>

        <button
          class="primary-btn large"
          :disabled="!canCommit || isSaving"
          @click="saveCommitment"
        >
          {{ isSaving ? 'Saving...' : 'Lock it in →' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader } from 'lucide-vue-next'
import { ref, computed } from 'vue'

interface TestSuggestion {
  description: string
  successSignal: string
}

interface SavedIdea {
  id: string
  text: string
}

const props = defineProps<{
  idea: SavedIdea
}>()

const emit = defineEmits<{
  committed: []
}>()

const testSuggestions = ref<TestSuggestion[]>([])
const selectedTest = ref<number | null>(null)
const commitment = ref({
  when: '',
  where: ''
})
const isGenerating = ref(false)
const isSaving = ref(false)
const streamingTests = ref<TestSuggestion[]>([])

const canCommit = computed(() => {
  return (
    selectedTest.value !== null &&
    commitment.value.when.trim().length > 0 &&
    commitment.value.where.trim().length > 0
  )
})

async function generateTests() {
  isGenerating.value = true
  streamingTests.value = []
  testSuggestions.value = []

  try {
    const response = await fetch('/api/coach-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'test-suggestions',
        idea: props.idea.text
      })
    })

    if (!response.ok || !response.body) {
      throw new Error('Stream failed')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          if (data.token) {
            fullText += data.token
            updateStreamingTests(fullText)
          }
          if (data.done) {
            parseTestsFromStream(fullText)
          }
        } catch {
          // Skip malformed
        }
      }
    }

    if (testSuggestions.value.length === 0) {
      parseTestsFromStream(fullText)
    }
  } catch (error) {
    console.error('Failed to generate tests:', error)
  } finally {
    isGenerating.value = false
    streamingTests.value = []
  }
}

function updateStreamingTests(text: string) {
  const tests: TestSuggestion[] = []

  const testMatches = text.matchAll(/"description"\s*:\s*"([^"]+)"/g)
  const signalMatches = [...text.matchAll(/"successSignal"\s*:\s*"([^"]+)"/g)]

  let i = 0
  for (const match of testMatches) {
    tests.push({
      description: match[1],
      successSignal: signalMatches[i]?.[1] || ''
    })
    i++
  }

  streamingTests.value = tests.slice(0, 3)
}

function parseTestsFromStream(text: string) {
  const tests: TestSuggestion[] = []
  const jsonMatches = text.match(/\{[^{}]*"test"[^{}]*\{[^{}]*\}[^{}]*\}/g)

  if (jsonMatches) {
    for (const match of jsonMatches) {
      try {
        const parsed = JSON.parse(match)
        if (parsed.test?.description && parsed.test?.successSignal) {
          tests.push(parsed.test)
        }
      } catch {
        // Skip malformed
      }
    }
  }

  if (tests.length === 0) {
    const fallbackMatch = text.match(/\{[\s\S]*"tests"[\s\S]*\[[\s\S]*\][\s\S]*\}/)
    if (fallbackMatch) {
      try {
        const parsed = JSON.parse(fallbackMatch[0])
        if (Array.isArray(parsed.tests)) {
          tests.push(...parsed.tests)
        }
      } catch {
        // Skip
      }
    }
  }

  testSuggestions.value = tests
}

function selectTest(index: number) {
  selectedTest.value = index
}

async function saveCommitment() {
  if (!canCommit.value || selectedTest.value === null) return

  isSaving.value = true
  try {
    await $fetch(`/api/saved-ideas/${props.idea.id}`, {
      method: 'PATCH',
      body: {
        testCommitment: {
          description: testSuggestions.value[selectedTest.value].description,
          when: commitment.value.when,
          where: commitment.value.where,
          successSignal: testSuggestions.value[selectedTest.value].successSignal,
          committedAt: new Date().toISOString()
        }
      }
    })

    emit('committed')
  } catch (error) {
    console.error('Failed to save commitment:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.commit-phase {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-sm);
}

.phase-header {
  margin-bottom: var(--space-8);
}

.phase-header h2 {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-2) 0;
}

.phase-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.generating-state {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-4) 0;
}

.generating-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--color-text-secondary);
}

.generating-header p {
  margin: 0;
  font-size: var(--text-base);
}

.dots span {
  animation: dotPulse 1.4s infinite;
  opacity: 0;
}

.dots span:nth-child(1) {
  animation-delay: 0s;
}
.dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%,
  60%,
  100% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
}

.streaming-tests {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.test-option.streaming {
  animation: slideIn 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.test-placeholder {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-bg);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
}

.placeholder-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-border);
  color: var(--color-text-tertiary);
  border-radius: var(--radius-full);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
}

.placeholder-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-1);
}

.placeholder-line {
  height: 14px;
  background: linear-gradient(90deg, var(--color-border) 25%, var(--color-bg) 50%, var(--color-border) 75%);
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s infinite;
}

.placeholder-line.long {
  width: 85%;
}
.placeholder-line.short {
  width: 55%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.phase-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.test-suggestions h3,
.commitment-form h3 {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-2) 0;
}

.section-hint {
  font-size: var(--text-base);
  color: var(--color-text-tertiary);
  margin: 0 0 var(--space-4) 0;
}

.suggestions-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.test-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  text-align: left;
}

.test-option:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.test-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
  box-shadow: var(--shadow-md);
}

.test-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-full);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
}

.test-content {
  flex: 1;
}

.test-description {
  font-size: var(--text-base);
  color: var(--color-text);
  margin: 0 0 var(--space-2) 0;
  line-height: 1.5;
  font-weight: var(--weight-medium);
}

.test-signal {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.ghost-btn {
  padding: var(--space-3) var(--space-5);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  width: 100%;
}

.ghost-btn:hover {
  background: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.commitment-form {
  padding: var(--space-6);
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-subtle);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.form-group input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: inherit;
  transition: all var(--duration-normal) var(--ease-out);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.commitment-preview {
  padding: var(--space-4);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-md);
  margin: var(--space-6) 0;
}

.preview-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-2) 0;
}

.preview-text {
  font-size: var(--text-base);
  color: var(--color-text);
  margin: 0;
  line-height: 1.6;
}

.preview-text strong {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}

.primary-btn {
  padding: var(--space-4) var(--space-8);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--weight-semibold);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  box-shadow: var(--shadow-md);
  width: 100%;
}

.primary-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-lg);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.primary-btn.large {
  font-size: var(--text-lg);
  padding: var(--space-4) var(--space-8);
}
</style>
