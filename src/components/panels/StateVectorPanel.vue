<template>
  <div class="sv-panel">
    <div class="section-title">状态向量</div>
    <div class="param-grid">
      <div class="param-item">
        <label>X (km)</label>
        <input type="number" v-model.number="state.x" step="100" />
      </div>
      <div class="param-item">
        <label>Y (km)</label>
        <input type="number" v-model.number="state.y" step="100" />
      </div>
      <div class="param-item">
        <label>Z (km)</label>
        <input type="number" v-model.number="state.z" step="100" />
      </div>
      <div class="param-item">
        <label>Vx (km/s)</label>
        <input type="number" v-model.number="state.vx" step="0.1" />
      </div>
      <div class="param-item">
        <label>Vy (km/s)</label>
        <input type="number" v-model.number="state.vy" step="0.1" />
      </div>
      <div class="param-item">
        <label>Vz (km/s)</label>
        <input type="number" v-model.number="state.vz" step="0.1" />
      </div>
    </div>
    <div class="param-row">
      <label>积分步长 (秒)</label>
      <input type="number" v-model.number="stepSize" step="1" min="1" value="10" />
    </div>
    <button class="action-btn" @click="$emit('compute', { ...state, stepSize })">
      计算轨道
    </button>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

defineEmits(['compute'])

const state = reactive({ x: 7000, y: 0, z: 0, vx: 0, vy: 7.5, vz: 0 })
const stepSize = ref(10)
</script>

<style scoped>
.sv-panel { display: flex; flex-direction: column; gap: 5px; }
.section-title { color: var(--accent); font-size: 12px; font-weight: 600; }
.param-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.param-item, .param-row { display: flex; flex-direction: column; gap: 2px; }
label { color: var(--text-muted); font-size: 10px; }
input { padding: 7px 8px; background: var(--bg-input); border: 1px solid var(--border); color: var(--text); border-radius: var(--radius-sm); font-size: 11px; }
input:focus { outline: none; border-color: var(--accent); }
.action-btn {
  padding: 10px; background: rgba(0,229,255,0.08); color: var(--accent);
  border: 1px solid rgba(0,229,255,0.2); border-radius: var(--radius-sm);
  cursor: pointer; font-size: 12px; min-height: 38px; margin-top: 2px; font-weight: 600;
  transition: all 0.15s;
}
.action-btn:hover { background: rgba(0,229,255,0.15); border-color: var(--accent); }
</style>
