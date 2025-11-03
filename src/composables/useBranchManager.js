import { ref } from 'vue';

export function useBranchManager() {
  const branches = ref([]);
  const connections = ref([]);
  const pruningBranches = ref(new Set());
  let branchCounter = 0;

  const createBranch = ({ text, type, parentId = null, position }) => {
    const branch = {
      id: `b-${++branchCounter}`,
      text,
      type,
      parentId,
      position,
      createdAt: Date.now()
    };
    
    branches.value.push(branch);
    
    if (parentId) {
      connections.value.push({
        from: parentId,
        to: branch.id,
        manual: false
      });
    }
    
    return branch;
  };

  const addConnection = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return false;
    
    const exists = connections.value.some(
      conn => conn.from === fromId && conn.to === toId
    );
    
    if (exists) return false;
    
    connections.value.push({
      from: fromId,
      to: toId,
      manual: true
    });
    
    return true;
  };

  const removeBranch = (branchId, immediate = false) => {
    const toRemove = new Set([branchId]);
    let changed = true;
    
    // Find all descendants
    while (changed) {
      changed = false;
      branches.value.forEach(b => {
        if (b.parentId && toRemove.has(b.parentId) && !toRemove.has(b.id)) {
          toRemove.add(b.id);
          changed = true;
        }
      });
    }
    
    if (immediate) {
      // Immediate removal without animation
      branches.value = branches.value.filter(b => !toRemove.has(b.id));
      connections.value = connections.value.filter(
        c => !toRemove.has(c.from) && !toRemove.has(c.to)
      );
      pruningBranches.value = new Set();
    } else {
      // Mark for pruning animation
      toRemove.forEach(id => pruningBranches.value.add(id));
      
      // Remove after animation completes (1.5s)
      setTimeout(() => {
        branches.value = branches.value.filter(b => !toRemove.has(b.id));
        connections.value = connections.value.filter(
          c => !toRemove.has(c.from) && !toRemove.has(c.to)
        );
        toRemove.forEach(id => pruningBranches.value.delete(id));
      }, 1500);
    }
    
    return Array.from(toRemove);
  };

  return {
    branches,
    connections,
    pruningBranches,
    createBranch,
    addConnection,
    removeBranch
  };
}
