<template>
  <div class="app-root">
    <CesiumViewer ref="cesiumRef" />
    <div class="version-badge">{{ VERSION }}</div>

    <div :class="['control-panel', { open: panelOpen, collapsed: panelCollapsed }]"
         @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
      <div class="panel-handle" @click="panelOpen = !panelOpen"></div>
      <button class="panel-toggle" @click="panelCollapsed = !panelCollapsed" :title="panelCollapsed ? '展开' : '收起'">
        {{ panelCollapsed ? '◀' : '▶' }}
      </button>

      <div class="panel-content" v-show="!panelCollapsed">
        <ModeSelector @modeChange="onModeChange" />

        <!-- Mode 1: State Vector -->
        <StateVectorPanel v-if="store.mode === 'stateVector'" @compute="onStateVectorCompute" />

        <!-- Mode 2: Orbital Elements -->
        <template v-if="store.mode === 'orbital'">
          <OrbitalPanel ref="orbitalPanelRef" @compute="onOrbitalCompute" />
          <OrbitForecast @forecast="onForecast" />
          <ErrorChart ref="errorChartRef" />
        </template>

        <!-- Mode 3: Ephemeris -->
        <EphemerisPanel v-if="store.mode === 'ephemeris'"
          @compute="onEphemerisCompute" @dataReady="onEphemerisData" />

        <SatelliteList />
        <CoordDisplay />
        <TimeControls @togglePlay="onTogglePlay" @export="onExport" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted, nextTick } from 'vue'
import CesiumViewer from './components/CesiumViewer.vue'
import ModeSelector from './components/ModeSelector.vue'
import StateVectorPanel from './components/panels/StateVectorPanel.vue'
import OrbitalPanel from './components/panels/OrbitalPanel.vue'
import EphemerisPanel from './components/panels/EphemerisPanel.vue'
import SatelliteList from './components/SatelliteList.vue'
import CoordDisplay from './components/CoordDisplay.vue'
import ErrorChart from './components/ErrorChart.vue'
import OrbitForecast from './components/OrbitForecast.vue'
import TimeControls from './components/TimeControls.vue'
import { createStore } from './store.js'
import { generateStateVectorOrbit } from './engines/stateVector.js'
import { generateOrbitalOrbit, forecastPoints } from './engines/orbitalElements.js'
import { generateEphemerisOrbit, calcBroadcast, calcSP3, calcErrors, exportCSV, exportJSON } from './engines/ephemeris.js'
import { ecef2blh, ecef2j2000 } from './utils/coordinates.js'
import { VERSION } from './version.js'
import './assets/main.css'

const store = createStore()
provide('store', store)

const cesiumRef = ref(null)
const orbitalPanelRef = ref(null)
const errorChartRef = ref(null)
const panelOpen = ref(false)
const panelCollapsed = ref(false)

let ephemerisData = { rinex: [], sp3: [] }
function onEphemerisData(data) {
  ephemerisData = data
  if (store.cesiumViewer && store.mode === 'ephemeris') {
    setTimeout(() => onEphemerisCompute(), 500)
  }
}

// Mobile touch
let touchStartY = 0
function onTouchStart(e) { touchStartY = e.touches[0].clientY }
function onTouchEnd(e) {
  const dy = e.changedTouches[0].clientY - touchStartY
  if (dy < -30) panelOpen.value = true
  if (dy > 30) panelOpen.value = false
}

function onModeChange() { panelOpen.value = false }

// ====== Orbit Drawing ======

function clearAndDraw(orbits) {
  const viewer = store.cesiumViewer
  if (!viewer) return
  viewer.entities.removeAll()
  store.stopPlay()
  store.allOrbits = orbits

  const prnSet = [...new Set(orbits.map(o => o.prn))]
  store.satellites = prnSet.map(prn => ({
    prn, visible: true,
    color: store.nextColor(),
    trajectoryEntity: null,
    pointEntity: null
  }))

  store.satellites.forEach(sat => {
    const satOrbits = orbits.filter(o => o.prn === sat.prn)
    if (satOrbits.length < 2) return
    const positions = satOrbits.map(o => Cesium.Cartesian3.fromElements(o.x, o.y, o.z))
    positions.push(positions[0].clone())  // force visual closure
    const color = Cesium.Color.fromCssColorString(sat.color)

    // Glow layer — wider, translucent solid line
    viewer.entities.add({
      polyline: { positions, width: 6, material: color.withAlpha(0.18) }
    })

    // Main dashed line
    sat.trajectoryEntity = viewer.entities.add({
      polyline: {
        positions,
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          color,
          dashLength: 24
        })
      }
    })

    // Satellite point with glow ring
    viewer.entities.add({
      position: positions[0],
      point: { pixelSize: 16, color: color.withAlpha(0.25) }
    })
    sat.pointEntity = viewer.entities.add({
      position: positions[0],
      point: { pixelSize: 7, color, outlineColor: Cesium.Color.WHITE, outlineWidth: 1 }
    })
  })

  if (orbits.length > 0) {
    store.currentOrbit = orbits[0]
    store.currentBLH = ecef2blh(orbits[0].x, orbits[0].y, orbits[0].z)
    store.currentJ2000 = ecef2j2000(orbits[0].x, orbits[0].y, orbits[0].z, orbits[0].time)
  }

  viewer.zoomTo(viewer.entities)
}

// ====== Playback ======

function updatePositions() {
  const t = store.currentTime.getTime()
  store.satellites.forEach((sat, i) => {
    const orbits = store.allOrbits.filter(o => o.prn === sat.prn)
    if (orbits.length < 2) return

    // Find bracket: orbits[idx].time <= t < orbits[idx+1].time
    let idx = orbits.findIndex(o => o.time.getTime() > t)
    if (idx <= 0) idx = 1
    if (idx >= orbits.length) idx = orbits.length - 1

    const prev = orbits[idx - 1]
    const next = orbits[idx]
    const t0 = prev.time.getTime()
    const t1 = next.time.getTime()
    const frac = t1 > t0 ? (t - t0) / (t1 - t0) : 0
    const clamped = Math.max(0, Math.min(1, frac))

    const x = prev.x + (next.x - prev.x) * clamped
    const y = prev.y + (next.y - prev.y) * clamped
    const z = prev.z + (next.z - prev.z) * clamped

    if (sat.pointEntity) {
      sat.pointEntity.position = Cesium.Cartesian3.fromElements(x, y, z)
    }
    if (i === 0) {
      const interpOrbit = { prn: sat.prn, time: store.currentTime, x, y, z }
      store.currentOrbit = interpOrbit
      store.currentBLH = ecef2blh(x, y, z)
      store.currentJ2000 = ecef2j2000(x, y, z, store.currentTime)
    }
  })
}

function onTogglePlay() {
  if (store.playing) {
    store.stopPlay()
  } else {
    store.startPlay()
    store.currentTime = new Date()
    store.clockInterval = setInterval(() => {
      store.currentTime = new Date(store.currentTime.getTime() + 60000)
      updatePositions()
    }, 200)
  }
}

function onExport() {
  if (store.allOrbits.length === 0) return
  exportJSON(store.allOrbits)
  setTimeout(() => exportCSV(store.allOrbits), 500)
}

// ====== Mode Handlers ======

function onStateVectorCompute(params) {
  store.reset()
  const orbits = generateStateVectorOrbit(
    [params.x, params.y, params.z, params.vx, params.vy, params.vz],
    params.stepSize, 'SV01'
  )
  clearAndDraw(orbits)
  panelOpen.value = false
}

function onOrbitalCompute() {
  store.reset()
  const panel = orbitalPanelRef.value
  if (!panel) return
  const allOrbits = []
  panel.satParams.forEach(sat => {
    const orbits = generateOrbitalOrbit(sat.a, sat.e, sat.i, sat.raan, sat.argp, sat.prn, new Date(), 6, 2)
    allOrbits.push(...orbits)
  })
  clearAndDraw(allOrbits)

  // Osculating error simulation
  if (errorChartRef.value) {
    let count = 0
    const interval = setInterval(() => {
      if (count++ > 30 || !store.playing) { clearInterval(interval); return }
      errorChartRef.value.pushError((Math.random() - 0.5) * 2)
    }, 500)
  }
}

function onEphemerisCompute() {
  store.reset()
  const allOrbits = []
  const prnSet = new Set()
  ephemerisData.rinex.forEach(e => prnSet.add(e.prn))
  ephemerisData.sp3.forEach(e => prnSet.add(e.prn))

  prnSet.forEach(prn => {
    const orbits = generateEphemerisOrbit(ephemerisData.rinex, ephemerisData.sp3, prn, new Date(), 60)
    allOrbits.push(...orbits)
  })
  clearAndDraw(allOrbits)

  store.errors = []
  prnSet.forEach(prn => {
    store.errors.push(...calcErrors(ephemerisData.rinex, ephemerisData.sp3, prn, new Date(), 6, 300))
  })
  panelOpen.value = false
}

function onForecast(hours) {
  const panel = orbitalPanelRef.value
  const viewer = store.cesiumViewer
  if (!panel || !viewer) return
  panel.satParams.forEach(sat => {
    const pts = forecastPoints(sat.a, sat.e, sat.i, sat.raan, sat.argp, hours)
    const positions = pts.map(p => Cesium.Cartesian3.fromElements(p.x, p.y, p.z))
    viewer.entities.add({
      polyline: { positions, width: 3, material: Cesium.Color.RED.withAlpha(0.7) }
    })
  })
}

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    if (store.cesiumViewer && store.mode === 'orbital') onOrbitalCompute()
  }, 1500)
})

onUnmounted(() => { store.stopPlay() })
</script>

<style scoped>
.app-root { width: 100%; height: 100%; position: relative; overflow: hidden; }
.version-badge {
  position: absolute; bottom: 6px; right: 10px; z-index: 20;
  color: rgba(255,255,255,0.3); font-size: 11px; pointer-events: none;
}
</style>
