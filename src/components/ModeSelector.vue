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
.mode-selector { display: flex; gap: 4px; margin-bottom: 8px; }
.mode-btn {
  flex: 1; padding: 8px 4px; border: 1px solid #555;
  background: #1a1a3e; color: #999; border-radius: 6px;
  cursor: pointer; font-size: 13px; transition: all 0.2s;
}
.mode-btn.active { background: #0055aa; color: #fff; border-color: #0088ff; }
</style>
