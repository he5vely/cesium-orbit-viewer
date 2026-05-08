<template>
  <div class="orbital-panel">
    <div class="section-title">轨道根数参数</div>

    <!-- Satellite tabs -->
    <div class="sat-tabs">
      <button v-for="(sat, i) in satParams" :key="i"
        :class="['sat-tab', { active: currentIdx === i }]"
        @click="currentIdx = i">
        {{ sat.prn || '卫星' + (i+1) }}
        <span class="del-sat" @click.stop="removeSat(i)" v-if="satParams.length > 1" title="删除">×</span>
      </button>
      <button class="sat-tab add-btn" @click="addSat" v-if="satParams.length < 5">+</button>
    </div>

    <!-- Parameter sliders for current satellite -->
    <div class="slider-group" v-if="cur">
      <div class="slider-item">
        <label>半长轴 a: <span class="val">{{ cur.a.toFixed(0) }} km</span></label>
        <input type="range" min="6500" max="45000" step="10" v-model.number="cur.a" />
      </div>
      <div class="slider-item">
        <label>偏心率 e: <span class="val">{{ cur.e.toFixed(4) }}</span></label>
        <input type="range" min="0" max="0.3" step="0.0001" v-model.number="cur.e" />
      </div>
      <div class="slider-item">
        <label>倾角 i: <span class="val">{{ deg(cur.i).toFixed(1) }}°</span></label>
        <input type="range" min="0" max="180" step="0.1" :value="deg(cur.i)" @input="cur.i = rad(+$event.target.value)" />
      </div>
      <div class="slider-item">
        <label>升交点赤经 Ω: <span class="val">{{ deg(cur.raan).toFixed(1) }}°</span></label>
        <input type="range" min="0" max="360" step="1" :value="deg(cur.raan)" @input="cur.raan = rad(+$event.target.value)" />
      </div>
      <div class="slider-item">
        <label>近地点角 ω: <span class="val">{{ deg(cur.argp).toFixed(1) }}°</span></label>
        <input type="range" min="0" max="360" step="1" :value="deg(cur.argp)" @input="cur.argp = rad(+$event.target.value)" />
      </div>
    </div>

    <!-- Non-singular info -->
    <div class="nonsingular-info" v-if="isSingular">
      <span class="warn">近圆/近赤道 — 平经度 λ: {{ lamDeg.toFixed(2) }}°</span>
    </div>

    <!-- TLE input -->
    <details>
      <summary class="tle-toggle">TLE 两行根数</summary>
      <textarea v-model="tleInput" placeholder="Line 1&#10;Line 2" class="tle-text"></textarea>
      <button class="action-btn sm" @click="loadTLE">加载 TLE</button>
    </details>

    <!-- SSO preset -->
    <details>
      <summary class="tle-toggle">太阳同步轨道预设</summary>
      <button class="action-btn sm" @click="presetSSO">应用 SSO 预设</button>
    </details>

    <button class="action-btn" @click="$emit('compute')">重绘轨道</button>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { deg2rad, rad2deg } from '../../utils/coordinates.js'

const rad = deg2rad
const deg = rad2deg

defineEmits(['compute'])

const currentIdx = ref(0)
const satParams = reactive([
  { prn: 'SAT1', a: 7100, e: 0.0015, i: 1.71, raan: 4.886, argp: 0 },
  { prn: 'SAT2', a: 7200, e: 0.0020, i: 1.727, raan: 2.0, argp: 0 },
  { prn: 'SAT3', a: 7300, e: 0.0010, i: 1.745, raan: 1.0, argp: 0 },
])

const cur = computed(() => satParams[currentIdx.value])
const tleInput = ref('')

const isSingular = computed(() => {
  if (!cur.value) return false
  return cur.value.e < 0.01 || Math.abs(cur.value.i) < 0.052 || Math.abs(cur.value.i - Math.PI) < 0.052
})
const lamDeg = computed(() => {
  const s = cur.value
  if (!s) return 0
  const lam = (s.raan + s.argp) % (2 * Math.PI)
  const deg = lam < 0 ? (lam + 2*Math.PI) * 180/Math.PI : lam * 180/Math.PI
  return deg
})

function addSat() {
  const n = satParams.length + 1
  satParams.push({ prn: 'SAT' + n, a: 7100 + n*100, e: 0.001, i: 1.7 + n*0.01, raan: n*1.5, argp: 0 })
}

function removeSat(i) {
  satParams.splice(i, 1)
  if (currentIdx.value >= satParams.length) currentIdx.value = satParams.length - 1
}

async function loadTLE() {
  const lines = tleInput.value.split('\n').filter(s => s.trim())
  if (lines.length < 2) { alert('请输入完整的 TLE 两行根数'); return }
  const { parseTLE } = await import('../../parsers/tle.js')
  try {
    const orb = parseTLE(lines[0], lines[1])
    const s = cur.value
    s.a = orb.a; s.e = orb.e; s.i = orb.i; s.raan = orb.raan; s.argp = orb.argp
    s.prn = orb.prn
  } catch (e) {
    alert('TLE 解析失败: ' + e.message)
  }
}

function presetSSO() {
  const s = cur.value
  s.a = 7100; s.i = deg2rad(98.5); s.raan = deg2rad(280)
  s.e = 0.001; s.argp = 0; s.prn = 'SSO-' + s.prn
}

defineExpose({ satParams, currentIdx })
</script>

<style scoped>
.orbital-panel { display: flex; flex-direction: column; gap: 6px; }
.section-title { color: #0ff; font-size: 14px; font-weight: bold; }
.sat-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.sat-tab {
  padding: 6px 12px; border: 1px solid #555; background: #1a1a3e;
  color: #ccc; border-radius: 6px; cursor: pointer; font-size: 12px;
}
.sat-tab.active { background: #0055aa; color: #fff; border-color: #0088ff; }
.sat-tab.add-btn { font-weight: bold; }
.del-sat { margin-left: 4px; color: #f66; font-size: 14px; line-height: 1; vertical-align: middle; }
.del-sat:hover { color: #f00; }
.slider-group { display: flex; flex-direction: column; gap: 6px; }
.slider-item { display: flex; flex-direction: column; gap: 2px; }
.slider-item label { color: #fc0; font-size: 11px; }
.slider-item .val { color: #0ff; font-weight: bold; }
input[type=range] { width: 100%; min-height: 36px; accent-color: #0088ff; }
.nonsingular-info { font-size: 11px; color: #f90; }
.tle-toggle { color: #fc0; font-size: 12px; cursor: pointer; }
.tle-text { width: 100%; height: 60px; background: #1a1a3e; color: #fff; border: 1px solid #555; border-radius: 4px; resize: vertical; font-size: 11px; margin-top: 4px; padding: 4px; }
.action-btn {
  padding: 12px; background: #0055aa; color: #fff; border: none;
  border-radius: 8px; cursor: pointer; font-size: 14px; min-height: 44px;
}
.action-btn.sm { padding: 8px; font-size: 12px; margin-top: 4px; }
.action-btn:hover { background: #0066cc; }
</style>
