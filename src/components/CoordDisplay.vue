<template>
  <div class="coord-panel" v-if="store.currentOrbit">
    <div class="coord-title">实时坐标</div>
    <div class="coord-grid">
      <div class="coord-section">
        <div class="coord-label">ECEF</div>
        <div class="coord-val">X: {{ fmtM(store.currentOrbit.x) }}</div>
        <div class="coord-val">Y: {{ fmtM(store.currentOrbit.y) }}</div>
        <div class="coord-val">Z: {{ fmtM(store.currentOrbit.z) }}</div>
      </div>
      <div class="coord-section">
        <div class="coord-label">BLH</div>
        <div class="coord-val">Lat: {{ store.currentBLH.lat.toFixed(6) }}°</div>
        <div class="coord-val">Lon: {{ store.currentBLH.lon.toFixed(6) }}°</div>
        <div class="coord-val">H: {{ (store.currentBLH.height/1000).toFixed(2) }} km</div>
      </div>
      <div class="coord-section">
        <div class="coord-label">J2000</div>
        <div class="coord-val">X: {{ fmtM(store.currentJ2000.x) }}</div>
        <div class="coord-val">Y: {{ fmtM(store.currentJ2000.y) }}</div>
        <div class="coord-val">Z: {{ fmtM(store.currentJ2000.z) }}</div>
      </div>
    </div>
    <div class="error-line" v-if="store.errors.length">
      <span v-for="e in store.errors.slice(0, 3)" :key="e.prn" class="error-item">
        {{ e.prn }} 误差: {{ e.posError.toFixed(2) }}m
      </span>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const store = inject('store')

function fmtM(v) { return (v / 1000).toFixed(3) + ' km' }
</script>

<style scoped>
.coord-panel { margin-top: 6px; padding: 8px; background: var(--bg-card); border-radius: var(--radius-sm); border: 1px solid var(--border); }
.coord-title { color: var(--accent); font-size: 12px; font-weight: 600; margin-bottom: 6px; }
.coord-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.coord-section { font-size: 10px; color: var(--text); min-width: 0; }
.coord-label { color: var(--accent2); margin-bottom: 2px; font-weight: 600; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
.coord-val { font-family: 'JetBrains Mono', 'Cascadia Code', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-muted); }
.error-line { margin-top: 6px; font-size: 10px; color: var(--warn); display: flex; flex-wrap: wrap; gap: 8px; }
@media (max-width: 768px) { .coord-grid { grid-template-columns: 1fr; } }
</style>
