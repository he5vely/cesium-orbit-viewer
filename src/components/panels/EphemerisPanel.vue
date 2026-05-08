<template>
  <div class="eph-panel">
    <div class="section-title">星历参数</div>
    <div class="load-status" v-if="loading">加载示例数据中...</div>
    <div class="load-status loaded" v-else-if="hasData">示例数据已加载 (3颗GPS卫星)</div>
    <button class="action-btn" @click="$emit('compute')" :disabled="!hasData">
      加载轨道
    </button>
    <details>
      <summary class="upload-toggle">上传自定义星历文件</summary>
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
    </details>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { parseRinexNavigation } from '../../parsers/rinex.js'
import { parseSP3 } from '../../parsers/sp3.js'
import { demoBroadcast, generateDemoSP3 } from '../../data/demoEphemeris.js'

const emit = defineEmits(['compute', 'dataReady'])

const rinexData = ref([])
const sp3Data = ref([])
const rinexName = ref('')
const sp3Name = ref('')
const loading = ref(false)

const hasData = computed(() => rinexData.value.length > 0 || sp3Data.value.length > 0)

function emitData() {
  emit('dataReady', { rinex: [...rinexData.value], sp3: [...sp3Data.value] })
}

onMounted(() => {
  if (hasData.value) return
  loading.value = true
  rinexData.value = demoBroadcast
  sp3Data.value = generateDemoSP3()
  rinexName.value = 'GPS示例 (G01-G03)'
  sp3Name.value = 'SP3示例'
  loading.value = false
  if (hasData.value) emitData()
})

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
.load-status { font-size: 12px; padding: 6px 8px; border-radius: 4px; }
.load-status { color: #fc0; }
.load-status.loaded { color: #0f0; }
.upload-group { display: flex; flex-direction: column; gap: 4px; }
.upload-label { color: #fc0; font-size: 12px; }
.upload-toggle { color: #fc0; font-size: 12px; cursor: pointer; margin-top: 4px; }
.file-input { padding: 6px; background: #1a1a3e; border: 1px solid #555; color: #fff; border-radius: 4px; font-size: 12px; }
.file-hint { color: #0f0; font-size: 11px; }
.action-btn {
  padding: 12px; background: #0055aa; color: #fff; border: none;
  border-radius: 8px; cursor: pointer; font-size: 14px; min-height: 44px;
}
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.action-btn:hover:not(:disabled) { background: #0066cc; }
</style>
