<template>
  <div class="mode-selector">
    <button
      v-for="m in modes" :key="m.value"
      :class="['mode-btn', { active: store.mode === m.value }]"
      @click="switchMode(m.value)"
    >{{ m.label }}</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const store = inject('store')
const emit = defineEmits(['modeChange'])

const modes = [
  { value: 'orbital', label: '轨道根数' },
  { value: 'stateVector', label: '状态向量' },
  { value: 'ephemeris', label: '星历参数' },
]

function switchMode(mode) {
  store.mode = mode
  store.reset()
  emit('modeChange', mode)
}
</script>

<style scoped>
.mode-selector { display: flex; gap: 2px; padding: 2px; background: rgba(255,255,255,0.03); border-radius: 8px; }
.mode-btn {
  flex: 1; padding: 7px 4px; border: 1px solid transparent;
  background: transparent; color: var(--text-muted); border-radius: 6px;
  cursor: pointer; font-size: 11px; transition: all 0.2s; font-weight: 500;
}
.mode-btn:hover { color: var(--text); background: rgba(255,255,255,0.03); }
.mode-btn.active {
  background: rgba(0, 229, 255, 0.1); color: var(--accent);
  border-color: rgba(0, 229, 255, 0.3);
}
</style>
