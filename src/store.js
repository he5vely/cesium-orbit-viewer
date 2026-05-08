import { reactive } from 'vue'

const COLORS = ['#00E5FF','#76FF03','#FF4081','#FFD740','#7C4DFF','#00FFD0','#FF6E40','#40C4FF']

export function createStore() {
  return reactive({
    mode: 'orbital',
    cesiumViewer: null,
    satellites: [],
    allOrbits: [],
    currentOrbit: null,
    currentBLH: { lat: 0, lon: 0, height: 0 },
    currentJ2000: { x: 0, y: 0, z: 0 },
    currentTime: new Date(),
    playing: false,
    clockInterval: null,
    errors: [],
    groundTrackVisible: false,
    colorIndex: 0,

    nextColor() {
      const c = COLORS[this.colorIndex % COLORS.length]
      this.colorIndex++
      return c
    },

    reset() {
      this.satellites = []
      this.allOrbits = []
      this.currentOrbit = null
      this.errors = []
      this.colorIndex = 0
      this.stopPlay()
    },

    startPlay() {
      this.playing = true
    },

    stopPlay() {
      this.playing = false
      if (this.clockInterval) {
        clearInterval(this.clockInterval)
        this.clockInterval = null
      }
    }
  })
}
