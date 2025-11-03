<template>
  <div
    class="branch-menu"
    :style="{ left: `${x}px`, top: `${y}px` }"
    @click.stop
  >
    <button @click="$emit('edit')">✏️ Edit</button>
    <button @click="$emit('add-manual')">➕ Add child</button>
    <button @click="$emit('grow')">🌱 Grow branch</button>
    <button @click="$emit('split')">🌿 Split into options</button>
    <button @click="$emit('test')">🧪 Make testable</button>
    <button @click="$emit('connect')">🔗 Connect to...</button>
    <button @click="$emit('prune')" class="danger">🎃 Prune</button>
  </div>
</template>

<script setup>
defineProps({
  x: Number,
  y: Number,
  branch: Object
});

defineEmits(['grow', 'split', 'test', 'connect', 'prune', 'edit', 'add-manual', 'close']);
</script>

<style scoped>
.branch-menu {
  position: fixed;
  background: rgba(20, 20, 25, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  z-index: 2000;
  min-width: 180px;
}

.branch-menu button {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 10px 12px;
  text-align: left;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.branch-menu button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 1);
}

.branch-menu button.danger:hover {
  background: rgba(255, 80, 80, 0.2);
  color: rgba(255, 120, 120, 1);
}
</style>
