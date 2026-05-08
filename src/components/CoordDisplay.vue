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
.coord-panel { margin-top: 8px; padding: 8px; background: rgba(20,20,50,0.7); border-radius: 8px; }
.coord-title { color: #0ff; font-size: 13px; font-weight: bold; margin-bottom: 6px; }
.coord-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.coord-section { font-size: 11px; color: #ccc; min-width: 0; }
.coord-label { color: #fc0; margin-bottom: 2px; font-weight: bold; }
.coord-val { font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.error-line { margin-top: 6px; font-size: 11px; color: #ff9; display: flex; flex-wrap: wrap; gap: 8px; }
@media (max-width: 768px) { .coord-grid { grid-template-columns: 1fr; } }
</style>
