<template>
  <div class="test-selection">
    <h5 class="test-title">Select a Test</h5>
    <p class="test-subtitle">Choose one test to validate this plan</p>

    <div class="test-options">
      <div
        v-for="(test, index) in tests"
        :key="index"
        class="test-option"
        :class="{ selected: selectedIndex === index }"
        @click="selectTest(index)"
      >
        <div class="test-header">
          <span class="test-number">Test {{ index + 1 }}</span>
        </div>
        <div class="test-details">
          <div class="test-item">
            <span class="test-label">Metric:</span>
            <span class="test-value">{{ test.metric }}</span>
          </div>
          <div class="test-item">
            <span class="test-label">Pass:</span>
            <span class="test-value pass">{{ test.passThreshold }}</span>
          </div>
          <div class="test-item">
            <span class="test-label">Fail:</span>
            <span class="test-value fail">{{ test.failThreshold }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCustom" class="custom-test">
      <h5 class="custom-title">Or Define Your Own Test</h5>
      <div class="custom-form">
        <div class="form-group">
          <label class="form-label">Metric</label>
          <input
            v-model="customTest.metric"
            type="text"
            class="form-input"
            placeholder="What will you measure?"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Pass Threshold</label>
          <input
            v-model="customTest.passThreshold"
            type="text"
            class="form-input"
            placeholder="What indicates success?"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Fail Threshold</label>
          <input
            v-model="customTest.failThreshold"
            type="text"
            class="form-input"
            placeholder="What indicates failure?"
          />
        </div>
        <button class="custom-button" @click="selectCustomTest">Use Custom Test</button>
      </div>
    </div>

    <button v-else class="toggle-custom" @click="showCustom = true">+ Define Custom Test</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface TestOption {
  metric: string
  passThreshold: string
  failThreshold: string
}

const props = defineProps<{
  tests: TestOption[]
  modelValue?: TestOption | null
}>()

const emit = defineEmits<{
  'update:modelValue': [test: TestOption | null]
}>()

const selectedIndex = ref<number | null>(null)
const showCustom = ref(false)
const customTest = ref<TestOption>({
  metric: '',
  passThreshold: '',
  failThreshold: ''
})

watch(
  () => props.modelValue,
  newValue => {
    if (newValue) {
      const index = props.tests.findIndex(
        t =>
          t.metric === newValue.metric &&
          t.passThreshold === newValue.passThreshold &&
          t.failThreshold === newValue.failThreshold
      )
      if (index !== -1) {
        selectedIndex.value = index
        showCustom.value = false
      } else {
        selectedIndex.value = null
        showCustom.value = true
        customTest.value = { ...newValue }
      }
    }
  },
  { immediate: true }
)

function selectTest(index: number) {
  selectedIndex.value = index
  showCustom.value = false
  emit('update:modelValue', props.tests[index])
}

function selectCustomTest() {
  if (
    !customTest.value.metric ||
    !customTest.value.passThreshold ||
    !customTest.value.failThreshold
  ) {
    return
  }
  selectedIndex.value = null
  emit('update:modelValue', customTest.value)
}
</script>

<style scoped>
.test-selection {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.test-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.test-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.test-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.test-option {
  padding: 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.test-option:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.test-option.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.2);
}

.test-header {
  margin-bottom: 0.5rem;
}

.test-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.test-details {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.test-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.test-label {
  font-weight: 600;
  color: #6b7280;
  min-width: 4rem;
}

.test-value {
  color: #111827;
  flex: 1;
}

.test-value.pass {
  color: #059669;
}

.test-value.fail {
  color: #dc2626;
}

.toggle-custom {
  width: 100%;
  padding: 0.75rem;
  background: white;
  color: #3b82f6;
  border: 2px dashed #3b82f6;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-custom:hover {
  background: #eff6ff;
}

.custom-test {
  margin-top: 1rem;
}

.custom-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.custom-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-button {
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.custom-button:hover {
  background: #2563eb;
}
</style>
