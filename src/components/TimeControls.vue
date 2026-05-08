<template>
  <div class="time-controls">
    <button class="ctrl-btn play" @click="$emit('togglePlay')">
      <span class="icon">{{ store.playing ? '⏸' : '▶' }}</span>
      {{ store.playing ? '暂停' : '播放' }}
    </button>
    <button class="ctrl-btn" @click="$emit('export')">导出</button>
    <button class="ctrl-btn danger" @click="store.reset()">重置</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const store = inject('store')
defineEmits(['togglePlay', 'export'])
</script>

<style scoped>
.time-controls { display: flex; gap: 4px; margin-top: 6px; }
.ctrl-btn {
  flex: 1; padding: 8px 6px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.03); color: var(--text);
  border-radius: var(--radius-sm); cursor: pointer;
  font-size: 11px; min-height: 36px; font-weight: 500;
  transition: all 0.15s;
}
.ctrl-btn:hover { background: rgba(255,255,255,0.06); border-color: var(--border-glow); }
.ctrl-btn.play { border-color: rgba(0, 229, 255, 0.2); color: var(--accent); }
.ctrl-btn.play:hover { background: rgba(0, 229, 255, 0.06); }
.ctrl-btn.danger:hover { border-color: rgba(255, 82, 82, 0.3); color: var(--danger); }
.icon { margin-right: 2px; }
</style>
