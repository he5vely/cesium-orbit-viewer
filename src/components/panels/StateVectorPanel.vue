<template>
  <div class="sv-panel">
    <div class="section-title">状态向量参数</div>
    <div class="param-grid">
      <div class="param-item">
        <label>X 位置 (km)</label>
        <input type="number" v-model.number="state.x" step="100" />
      </div>
      <div class="param-item">
        <label>Y 位置 (km)</label>
        <input type="number" v-model.number="state.y" step="100" />
      </div>
      <div class="param-item">
        <label>Z 位置 (km)</label>
        <input type="number" v-model.number="state.z" step="100" />
      </div>
      <div class="param-item">
        <label>Vx 速度 (km/s)</label>
        <input type="number" v-model.number="state.vx" step="0.1" />
      </div>
      <div class="param-item">
        <label>Vy 速度 (km/s)</label>
        <input type="number" v-model.number="state.vy" step="0.1" />
      </div>
      <div class="param-item">
        <label>Vz 速度 (km/s)</label>
        <input type="number" v-model.number="state.vz" step="0.1" />
      </div>
    </div>
    <div class="param-row">
      <label>仿真时长 (秒)</label>
      <input type="number" v-model.number="duration" step="100" min="100" />
    </div>
    <div class="param-row">
      <label>积分步长 (秒)</label>
      <input type="number" v-model.number="stepSize" step="1" min="1" />
    </div>
    <button class="action-btn" @click="$emit('compute', { ...state, duration, stepSize })">
      计算轨道
    </button>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

defineEmits(['compute'])

const state = reactive({ x: 7000, y: 0, z: 0, vx: 0, vy: 7.5, vz: 0 })
const duration = ref(6000)
const stepSize = ref(10)
</script>

<style scoped>
.sv-panel { display: flex; flex-direction: column; gap: 6px; }
.section-title { color: #0ff; font-size: 14px; font-weight: bold; }
.param-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.param-item, .param-row { display: flex; flex-direction: column; gap: 2px; }
label { color: #fc0; font-size: 11px; }
input { padding: 8px; background: #1a1a3e; border: 1px solid #555; color: #fff; border-radius: 4px; font-size: 13px; }
.action-btn {
  padding: 12px; background: #0055aa; color: #fff; border: none;
  border-radius: 8px; cursor: pointer; font-size: 14px; min-height: 44px; margin-top: 4px;
}
.action-btn:hover { background: #0066cc; }
</style>
