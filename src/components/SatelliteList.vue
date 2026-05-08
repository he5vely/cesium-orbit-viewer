<template>
  <div class="sat-list" v-if="store.satellites.length > 0">
    <div class="sat-list-title">卫星</div>
    <div class="sat-items">
      <label v-for="sat in store.satellites" :key="sat.prn" class="sat-item">
        <input type="checkbox" v-model="sat.visible" @change="onToggle" />
        <span class="sat-color" :style="{ background: sat.color, boxShadow: '0 0 6px ' + sat.color }"></span>
        <span class="sat-prn">{{ sat.prn }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const store = inject('store')

function onToggle() {
  if (!store.cesiumViewer) return
  store.satellites.forEach(sat => {
    if (sat.trajectoryEntity) sat.trajectoryEntity.show = sat.visible
    if (sat.pointEntity) sat.pointEntity.show = sat.visible
  })
}
</script>

<style scoped>
.sat-list { margin-top: 6px; }
.sat-list-title { color: var(--text-muted); font-size: 10px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
.sat-items { display: flex; flex-wrap: wrap; gap: 4px; }
.sat-item { display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 11px; }
.sat-color { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sat-prn { color: var(--text); font-weight: 500; font-family: monospace; }
input[type=checkbox] { accent-color: var(--accent); }
</style>
