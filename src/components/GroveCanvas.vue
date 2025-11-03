<template>
  <div class="grove-canvas" @click="menuVisible = false">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :min-zoom="0.1"
      :max-zoom="3"
      @node-context-menu="handleNodeContextMenu"
      @pane-click="menuVisible = false"
    >
      <Background />
      <Controls />
      <MiniMap />
      
      <template #node-seed="{ data }">
        <BranchNode :data="data" type="seed" />
      </template>
      
      <template #node-grow="{ data }">
        <BranchNode :data="data" type="grow" />
      </template>
      
      <template #node-test="{ data }">
        <BranchNode :data="data" type="test" />
      </template>
    </VueFlow>

    <InputBar
      :current-mode="currentMode"
      :pending="pending"
      :selected-model="selectedModel"
      @submit="handleSubmit"
      @model-change="handleModelChange"
    />

    <BranchMenu
      v-if="menuVisible"
      :x="menuX"
      :y="menuY"
      :branch="selectedBranch"
      @grow="handleGrow"
      @split="handleSplit"
      @test="handleTest"
      @connect="handleConnect"
      @prune="handlePrune"
      @edit="handleEdit"
      @add-manual="handleAddManual"
      @close="menuVisible = false"
    />

    <div v-if="editModalVisible" class="edit-modal-overlay" @click="editModalVisible = false">
      <div class="edit-modal" @click.stop>
        <h3>Edit Branch</h3>
        <textarea
          ref="editTextarea"
          v-model="editText"
          rows="4"
          @keydown.meta.enter="saveEdit"
          @keydown.ctrl.enter="saveEdit"
        ></textarea>
        <div class="edit-modal-buttons">
          <button @click="editModalVisible = false" class="cancel-btn">Cancel</button>
          <button @click="saveEdit" class="save-btn">Save</button>
        </div>
      </div>
    </div>

    <Toast :message="toastMessage" :visible="toastVisible" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import BranchNode from './BranchNode.vue';
import InputBar from './InputBar.vue';
import BranchMenu from './BranchMenu.vue';
import Toast from './Toast.vue';

const props = defineProps({
  branches: Array,
  connections: Array,
  pruningBranches: Set,
  currentMode: String,
  pending: Boolean,
  selectedModel: String
});

const emit = defineEmits([
  'plant-seed',
  'grow-branch',
  'split-branch',
  'make-testable',
  'prune-branch',
  'connect-branches',
  'edit-branch'
]);

const { fitView } = useVueFlow();

const menuVisible = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const selectedBranch = ref(null);
const toastMessage = ref('');
const toastVisible = ref(false);
const connectingFrom = ref(null);
const editModalVisible = ref(false);
const editText = ref('');
const editTextarea = ref(null);

const nodes = computed(() => {
  return props.branches.map(branch => ({
    id: branch.id,
    type: branch.type,
    position: branch.position,
    data: {
      text: branch.text,
      type: branch.type,
      createdAt: branch.createdAt,
      connecting: connectingFrom.value === branch.id,
      pruning: props.pruningBranches?.has(branch.id) || false
    }
  }));
});

const edges = computed(() => {
  return props.connections.map((conn, index) => ({
    id: `e-${index}`,
    source: conn.from,
    target: conn.to,
    type: conn.manual ? 'smoothstep' : 'default',
    animated: false,
    style: {
      stroke: conn.manual ? 'rgba(100, 150, 255, 0.6)' : 'rgba(255, 255, 255, 0.25)',
      strokeWidth: 2,
      strokeDasharray: conn.manual ? '5 5' : undefined
    }
  }));
});

watch(() => props.branches.length, () => {
  if (props.branches.length > 0) {
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }
});

const handleNodeContextMenu = (event) => {
  event.event.preventDefault();
  const branch = props.branches.find(b => b.id === event.node.id);
  if (branch) {
    selectedBranch.value = branch;
    menuX.value = event.event.clientX;
    menuY.value = event.event.clientY;
    menuVisible.value = true;
  }
};

const handleSubmit = ({ text, model, manual }) => {
  emit('plant-seed', { text, model, manual });
  if (!manual) {
    showToast('Planting seed...');
  }
};

const handleModelChange = (model) => {
  // Model change handled by parent
};

const handleGrow = () => {
  if (selectedBranch.value) {
    emit('grow-branch', { branch: selectedBranch.value, model: props.selectedModel });
    showToast('Growing branch...');
  }
  menuVisible.value = false;
};

const handleSplit = () => {
  if (selectedBranch.value) {
    emit('split-branch', { branch: selectedBranch.value, model: props.selectedModel });
    showToast('Splitting branch...');
  }
  menuVisible.value = false;
};

const handleTest = () => {
  if (selectedBranch.value) {
    emit('make-testable', { branch: selectedBranch.value, model: props.selectedModel });
    showToast('Creating test...');
  }
  menuVisible.value = false;
};

const handleConnect = () => {
  if (selectedBranch.value) {
    connectingFrom.value = selectedBranch.value.id;
    showToast('Click another branch to connect');
  }
  menuVisible.value = false;
};

const handlePrune = () => {
  if (selectedBranch.value) {
    emit('prune-branch', { branchId: selectedBranch.value.id });
    showToast('🎃 Pruning branch... RIP 💀');
  }
  menuVisible.value = false;
};

const handleEdit = () => {
  if (selectedBranch.value) {
    editText.value = selectedBranch.value.text;
    editModalVisible.value = true;
    menuVisible.value = false;
    setTimeout(() => {
      editTextarea.value?.focus();
      editTextarea.value?.select();
    }, 50);
  }
};

const handleAddManual = () => {
  if (selectedBranch.value) {
    emit('grow-branch', { branch: selectedBranch.value, model: props.selectedModel, manual: true });
    showToast('Added child branch');
  }
  menuVisible.value = false;
};

const saveEdit = () => {
  if (selectedBranch.value && editText.value.trim()) {
    emit('edit-branch', { branchId: selectedBranch.value.id, newText: editText.value.trim() });
    editModalVisible.value = false;
    showToast('Branch updated');
  }
};

const showToast = (message) => {
  toastMessage.value = message;
  toastVisible.value = true;
  setTimeout(() => {
    toastVisible.value = false;
  }, 2500);
};
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';

.grove-canvas {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Fix VueFlow controls visibility */
:deep(.vue-flow__controls) {
  background: rgba(20, 20, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

:deep(.vue-flow__controls-button) {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.vue-flow__controls-button:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 1);
}

:deep(.vue-flow__controls-button:last-child) {
  border-bottom: none;
}

:deep(.vue-flow__controls-button svg) {
  fill: currentColor;
  width: 16px;
  height: 16px;
}

/* Fix MiniMap visibility */
:deep(.vue-flow__minimap) {
  background: rgba(20, 20, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

/* Edit Modal */
.edit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
}

.edit-modal {
  background: rgba(20, 20, 25, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
}

.edit-modal h3 {
  margin: 0 0 16px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  font-weight: 600;
}

.edit-modal textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  margin-bottom: 16px;
}

.edit-modal textarea:focus {
  border-color: rgba(100, 200, 150, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.edit-modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.edit-modal-buttons button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.cancel-btn {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.save-btn {
  background: rgba(100, 200, 150, 0.2);
  border-color: rgba(100, 200, 150, 0.4);
  color: rgba(100, 200, 150, 0.9);
}

.save-btn:hover {
  background: rgba(100, 200, 150, 0.3);
  border-color: rgba(100, 200, 150, 0.6);
}
</style>
