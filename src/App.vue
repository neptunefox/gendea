<template>
  <div class="app-container">
    <GroveCanvas
      :branches="branches"
      :connections="connections"
      :pruning-branches="pruningBranches"
      :current-mode="currentMode"
      :pending="pending"
      :selected-model="selectedModel"
      @plant-seed="handlePlantSeed"
      @grow-branch="handleGrowBranch"
      @split-branch="handleSplitBranch"
      @make-testable="handleMakeTestable"
      @prune-branch="handlePruneBranch"
      @connect-branches="handleConnectBranches"
      @edit-branch="handleEditBranch"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import GroveCanvas from './components/GroveCanvas.vue';
import { useOllamaAPI } from './composables/useOllamaAPI';
import { useBranchManager } from './composables/useBranchManager';

const { branches, connections, pruningBranches, createBranch, addConnection, removeBranch } = useBranchManager();
const { detectMode, generateResponse, loadModels } = useOllamaAPI();

const currentMode = ref('diverge');
const pending = ref(false);
const selectedModel = ref('');

onMounted(async () => {
  const models = await loadModels();
  if (models.length > 0) {
    selectedModel.value = models[0].model;
  }
});

const handlePlantSeed = async ({ text, model, manual = false }) => {
  const seed = createBranch({
    text,
    type: 'seed',
    position: { x: 400, y: 100 }
  });

  if (manual) {
    // Manual entry - no AI generation
    return;
  }

  pending.value = true;
  try {
    const mode = await detectMode(text, model);
    currentMode.value = mode;
    
    const response = await generateResponse({
      text,
      model,
      mode,
      action: 'seed'
    });

    response.forEach((item, index) => {
      createBranch({
        text: item,
        type: mode === 'diverge' ? 'grow' : 'test',
        parentId: seed.id,
        position: { x: 200 + index * 280, y: 260 }
      });
    });
  } finally {
    pending.value = false;
  }
};

const handleGrowBranch = async ({ branch, model, manual = false }) => {
  if (manual) {
    // Manual entry - create empty branch
    createBranch({
      text: 'New branch',
      type: 'grow',
      parentId: branch.id,
      position: { x: branch.position.x, y: branch.position.y + 160 }
    });
    return;
  }

  pending.value = true;
  try {
    const mode = await detectMode(`Continue: ${branch.text}`, model);
    currentMode.value = mode;
    
    const response = await generateResponse({
      text: branch.text,
      model,
      mode,
      action: 'grow'
    });

    response.forEach((item, index) => {
      createBranch({
        text: item,
        type: mode === 'diverge' ? 'grow' : 'test',
        parentId: branch.id,
        position: { x: branch.position.x - 140 + index * 280, y: branch.position.y + 160 }
      });
    });
  } finally {
    pending.value = false;
  }
};

const handleSplitBranch = async ({ branch, model }) => {
  pending.value = true;
  try {
    const response = await generateResponse({
      text: branch.text,
      model,
      mode: 'diverge',
      action: 'split'
    });

    response.forEach((item, index) => {
      createBranch({
        text: item,
        type: 'grow',
        parentId: branch.id,
        position: { x: branch.position.x - 140 + index * 280, y: branch.position.y + 160 }
      });
    });
  } finally {
    pending.value = false;
  }
};

const handleMakeTestable = async ({ branch, model }) => {
  pending.value = true;
  try {
    const response = await generateResponse({
      text: branch.text,
      model,
      mode: 'converge',
      action: 'test'
    });

    createBranch({
      text: response[0],
      type: 'test',
      parentId: branch.id,
      position: { x: branch.position.x, y: branch.position.y + 160 }
    });
  } finally {
    pending.value = false;
  }
};

const handlePruneBranch = ({ branchId }) => {
  removeBranch(branchId);
};

const handleConnectBranches = ({ fromId, toId }) => {
  addConnection(fromId, toId);
};

const handleEditBranch = ({ branchId, newText }) => {
  const branch = branches.value.find(b => b.id === branchId);
  if (branch) {
    branch.text = newText;
  }
};
</script>

<style>
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
