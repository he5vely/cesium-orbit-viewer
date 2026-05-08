<template>
  <div ref="viewerContainer" class="cesium-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { CESIUM_TOKEN } from '../utils/constants.js'

const store = inject('store')
const viewerContainer = ref(null)
let viewer = null

onMounted(() => {
  Cesium.Ion.defaultAccessToken = CESIUM_TOKEN
  viewer = new Cesium.Viewer(viewerContainer.value, {
    timeline: false,
    animation: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    shouldAnimate: true
  })
  viewer.scene.globe.depthTestAgainstTerrain = true
  store.cesiumViewer = viewer
})

onUnmounted(() => {
  if (viewer && !viewer.isDestroyed()) viewer.destroy()
})

defineExpose({ getViewer: () => viewer })
</script>

<style scoped>
.cesium-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 0; }
</style>
