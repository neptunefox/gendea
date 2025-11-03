<template>
  <div class="input-bar">
    <div class="input-header">
      <div class="mode-indicator">
        <span :class="['mode-icon', { thinking: pending }]"></span>
        <span :class="['mode-label', { active: pending }]">
          {{ pending ? 'Thinking...' : modeLabel }}
        </span>
      </div>
      <select
        v-model="localModel"
        class="model-select"
        @change="handleModelChange"
      >
        <option v-for="model in models" :key="model.model" :value="model.model">
          {{ model.model }}
        </option>
      </select>
    </div>
    <div class="input-wrapper">
      <input
        ref="inputRef"
        v-model="inputText"
        type="text"
        placeholder="Plant a seed..."
        autocomplete="off"
        spellcheck="false"
        @keydown.enter="handleSubmit"
      />
      <div class="button-group">
        <button 
          type="button" 
          :disabled="pending || !inputText.trim()" 
          @click="handleManualSubmit"
          class="manual-btn"
          title="Add manually (no AI)"
        >
          ✏️
        </button>
        <button 
          type="button" 
          :disabled="pending || !inputText.trim()" 
          @click="handleSubmit"
          title="Generate with AI"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  currentMode: String,
  pending: Boolean,
  selectedModel: String
});

const emit = defineEmits(['submit', 'model-change']);

const inputRef = ref(null);
const inputText = ref('');
const localModel = ref(props.selectedModel);
const models = ref([]);

const modeLabel = computed(() => {
  return props.currentMode === 'diverge' ? 'Diverge' : 'Converge';
});

onMounted(async () => {
  const res = await fetch('/api/models');
  if (res.ok) {
    models.value = await res.json();
    if (models.value.length > 0 && !localModel.value) {
      localModel.value = models.value[0].model;
    }
  }
  inputRef.value?.focus();
});

const handleSubmit = () => {
  const text = inputText.value.trim();
  if (!text || !localModel.value) return;
  
  emit('submit', { text, model: localModel.value, manual: false });
  inputText.value = '';
  inputRef.value?.focus();
};

const handleManualSubmit = () => {
  const text = inputText.value.trim();
  if (!text) return;
  
  emit('submit', { text, model: localModel.value, manual: true });
  inputText.value = '';
  inputRef.value?.focus();
};

const handleModelChange = () => {
  emit('model-change', localModel.value);
};
</script>

<style scoped>
.input-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  background: rgba(20, 20, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.mode-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(100, 200, 150, 0.6);
  transition: all 0.3s ease;
}

.mode-icon.thinking {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.mode-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s ease;
}

.mode-label.active {
  color: rgba(100, 200, 150, 0.9);
}

.model-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  cursor: pointer;
  outline: none;
}

.model-select:hover {
  background: rgba(255, 255, 255, 0.08);
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  padding: 8px 0;
  padding-right: 100px;
  outline: none;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.button-group {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 8px;
}

button {
  width: 40px;
  height: 40px;
  background: rgba(100, 200, 150, 0.2);
  border: 1px solid rgba(100, 200, 150, 0.4);
  border-radius: 8px;
  color: rgba(100, 200, 150, 0.9);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

button.manual-btn {
  background: rgba(150, 150, 200, 0.2);
  border-color: rgba(150, 150, 200, 0.4);
  color: rgba(150, 150, 200, 0.9);
  font-size: 16px;
}

button:hover:not(:disabled) {
  background: rgba(100, 200, 150, 0.3);
  border-color: rgba(100, 200, 150, 0.6);
}

button.manual-btn:hover:not(:disabled) {
  background: rgba(150, 150, 200, 0.3);
  border-color: rgba(150, 150, 200, 0.6);
}

button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
