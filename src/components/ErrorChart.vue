<template>
  <div class="chart-box" v-if="store.mode === 'orbital'">
    <div class="chart-title">密切 vs 平均根数误差</div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const store = inject('store')
const chartCanvas = ref(null)
let chart = null
const errData = []

onMounted(() => {
  chart = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: Array.from({ length: 30 }, (_, i) => i),
      datasets: [{
        label: 'Δa (m)',
        borderColor: '#0ff',
        data: errData,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#8890B0' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#8890B0' }, grid: { color: 'rgba(255,255,255,0.04)' } }
      },
      plugins: { legend: { labels: { color: '#8890B0', font: { size: 10 } } } }
    }
  })
})

onUnmounted(() => { if (chart) chart.destroy() })

function pushError(da) {
  errData.push(da)
  if (errData.length > 30) errData.shift()
  if (chart) chart.update()
}

defineExpose({ pushError })
</script>

<style scoped>
.chart-box { height: 160px; margin-top: 8px; }
.chart-title { color: #0ff; font-size: 12px; margin-bottom: 4px; }
</style>
