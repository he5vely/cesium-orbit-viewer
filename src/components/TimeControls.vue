<template>
  <div class="time-controls">
    <button class="ctrl-btn" @click="$emit('togglePlay')">
      {{ store.playing ? '⏸ 暂停' : '▶ 播放' }}
    </button>
    <button class="ctrl-btn" @click="$emit('export')">📥 导出</button>
    <button class="ctrl-btn" @click="store.reset()">🔄 重置</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const store = inject('store')
defineEmits(['togglePlay', 'export'])
</script>

<style scoped>
.time-controls { display: flex; gap: 6px; margin-top: 8px; }
.ctrl-btn {
  flex: 1; padding: 8px; border: 1px solid #555;
  background: #1a1a3e; color: #ccc; border-radius: 6px;
  cursor: pointer; font-size: 12px; min-height: 44px;
}
.ctrl-btn:hover { background: #2a2a5e; }
</style>
