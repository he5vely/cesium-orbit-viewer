<template>
  <div class="eph-panel">
    <div class="section-title">星历文件加载</div>
    <div class="upload-group">
      <label class="upload-label">广播星历 (.nav / .rnx)</label>
      <input type="file" accept=".nav,.rnx" @change="onRinex" class="file-input" />
      <span class="file-hint" v-if="rinexName"> {{ rinexName }}</span>
    </div>
    <div class="upload-group">
      <label class="upload-label">精密星历 (.sp3)</label>
      <input type="file" accept=".sp3" @change="onSP3" class="file-input" />
      <span class="file-hint" v-if="sp3Name"> {{ sp3Name }}</span>
    </div>
    <button class="action-btn" @click="$emit('compute')" :disabled="!hasData">
      加载轨道
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { parseRinexNavigation } from '../../parsers/rinex.js'
import { parseSP3 } from '../../parsers/sp3.js'

const emit = defineEmits(['compute', 'dataReady'])

const rinexData = ref([])
const sp3Data = ref([])
const rinexName = ref('')
const sp3Name = ref('')

const hasData = computed(() => rinexData.value.length > 0 || sp3Data.value.length > 0)

function emitData() {
  emit('dataReady', { rinex: [...rinexData.value], sp3: [...sp3Data.value] })
}

async function onRinex(e) {
  const file = e.target.files?.[0]
  if (!file) return
  rinexName.value = file.name
  const text = await file.text()
  rinexData.value = parseRinexNavigation(text)
  emitData()
}

async function onSP3(e) {
  const file = e.target.files?.[0]
  if (!file) return
  sp3Name.value = file.name
  const text = await file.text()
  sp3Data.value = parseSP3(text)
  emitData()
}
</script>

<style scoped>
.eph-panel { display: flex; flex-direction: column; gap: 8px; }
.section-title { color: #0ff; font-size: 14px; font-weight: bold; }
.upload-group { display: flex; flex-direction: column; gap: 4px; }
.upload-label { color: #fc0; font-size: 12px; }
.file-input { padding: 6px; background: #1a1a3e; border: 1px solid #555; color: #fff; border-radius: 4px; font-size: 12px; }
.file-hint { color: #0f0; font-size: 11px; }
.action-btn {
  padding: 12px; background: #0055aa; color: #fff; border: none;
  border-radius: 8px; cursor: pointer; font-size: 14px; min-height: 44px;
}
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.action-btn:hover:not(:disabled) { background: #0066cc; }
</style>
