<template>
  <div class="sat-list" v-if="store.satellites.length > 0">
    <div class="sat-list-title">卫星列表 ({{ store.satellites.length }})</div>
    <div class="sat-items">
      <label v-for="sat in store.satellites" :key="sat.prn" class="sat-item">
        <input type="checkbox" v-model="sat.visible" @change="onToggle" />
        <span class="sat-color" :style="{ background: sat.color }"></span>
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
.sat-list { margin-top: 8px; }
.sat-list-title { color: #fc0; font-size: 12px; margin-bottom: 4px; }
.sat-items { display: flex; flex-wrap: wrap; gap: 6px; }
.sat-item { display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 12px; }
.sat-color { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.sat-prn { color: #ccc; }
</style>
