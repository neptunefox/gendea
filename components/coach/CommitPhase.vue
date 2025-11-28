<template>
  <div class="commit-phase">
    <div class="phase-header">
      <h2>Commit to a test</h2>
      <p class="phase-subtitle">What's the smallest honest test you can run?</p>
    </div>

    <div v-if="isGenerating" class="generating-state">
      <div class="generating-header">
        <Loader :size="24" class="spin" />
        <p>Crafting test ideas<span class="dots"><span>.</span><span>.</span><span>.</span></span></p>
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

        <div v-for="n in (3 - streamingTests.length)" :key="'placeholder-' + n" class="test-placeholder">
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
  background: linear-gradient(135deg, #fefaf5 0%, #fef5f0 100%);
  border: 1px solid #f0e5e0;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.phase-header {
  margin-bottom: 2rem;
}

.phase-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #40312b;
  margin: 0 0 0.5rem 0;
}

.phase-subtitle {
  font-size: 1.0625rem;
  color: #8a7566;
  margin: 0;
}

.generating-state {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.generating-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #8a7566;
}

.generating-header p {
  margin: 0;
  font-size: 1rem;
}

.dots span {
  animation: dotPulse 1.4s infinite;
  opacity: 0;
}

.dots span:nth-child(1) { animation-delay: 0s; }
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 60%, 100% { opacity: 0; }
  30% { opacity: 1; }
}

.streaming-tests {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.4);
  border: 2px dashed #e8ddd8;
  border-radius: 12px;
}

.placeholder-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8ddd8;
  color: #b8a89d;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
}

.placeholder-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.25rem;
}

.placeholder-line {
  height: 14px;
  background: linear-gradient(90deg, #e8ddd8 25%, #f0e5e0 50%, #e8ddd8 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

.placeholder-line.long { width: 85%; }
.placeholder-line.short { width: 55%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
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
  gap: 2rem;
}

.test-suggestions h3,
.commitment-form h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #40312b;
  margin: 0 0 0.5rem 0;
}

.section-hint {
  font-size: 0.9375rem;
  color: #b8a89d;
  margin: 0 0 1rem 0;
}

.suggestions-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.test-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 2px solid #f0e5e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.test-option:hover {
  border-color: #d4756f;
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.1);
}

.test-option.selected {
  border-color: #d4756f;
  background: linear-gradient(135deg, #fff9f0 0%, #ffe8e0 100%);
  box-shadow: 0 4px 12px rgba(212, 117, 111, 0.2);
}

.test-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
}

.test-content {
  flex: 1;
}

.test-description {
  font-size: 0.9375rem;
  color: #40312b;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
  font-weight: 500;
}

.test-signal {
  font-size: 0.875rem;
  color: #8a7566;
  margin: 0;
}

.ghost-btn {
  padding: 0.875rem 1.25rem;
  background: transparent;
  border: 1px solid rgba(212, 117, 111, 0.25);
  border-radius: 10px;
  color: #8a7566;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.ghost-btn:hover {
  background: rgba(255, 215, 189, 0.2);
  border-color: rgba(212, 117, 111, 0.4);
  color: #d4756f;
}

.commitment-form {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(212, 117, 111, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #40312b;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #f0e5e0;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #d4756f;
  box-shadow: 0 0 0 3px rgba(212, 117, 111, 0.1);
}

.commitment-preview {
  padding: 1rem;
  background: linear-gradient(135deg, #fff9f0 0%, #ffe8e0 100%);
  border-radius: 10px;
  margin: 1.5rem 0;
}

.preview-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #d4756f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.preview-text {
  font-size: 0.9375rem;
  color: #40312b;
  margin: 0;
  line-height: 1.6;
}

.preview-text strong {
  color: #d4756f;
  font-weight: 700;
}

.primary-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #ff9ad8, #f67176);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(246, 113, 118, 0.25);
  width: 100%;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(246, 113, 118, 0.35);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.primary-btn.large {
  font-size: 1.125rem;
  padding: 1.125rem 2rem;
}
</style>
