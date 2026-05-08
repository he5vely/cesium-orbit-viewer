<template>
  <div class="forecast-box" v-if="store.mode === 'orbital' && store.satellites.length > 0">
    <div class="forecast-title">轨道预报</div>
    <div class="forecast-row">
      <input type="range" min="0" max="48" step="0.5" :value="hours" @input="hours = +$event.target.value" class="forecast-slider" />
      <span class="forecast-val">{{ hours }}h</span>
      <button class="forecast-btn" @click="$emit('forecast', hours)">显示</button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const store = inject('store')
const hours = ref(2)

defineEmits(['forecast'])
</script>

<style scoped>
.forecast-box { margin-top: 8px; }
.forecast-title { color: #0ff; font-size: 12px; margin-bottom: 4px; }
.forecast-row { display: flex; align-items: center; gap: 8px; }
.forecast-slider { flex: 1; min-height: 44px; accent-color: #0088ff; }
.forecast-val { color: #0ff; width: 40px; font-size: 13px; }
.forecast-btn { padding: 6px 12px; border: 1px solid #555; background: #aa3300; color: #fff; border-radius: 4px; cursor: pointer; font-size: 12px; min-height: 44px; }
</style>
