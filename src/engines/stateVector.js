import { GM } from '../utils/constants.js'

function dynamics(t, state) {
  const [x, y, z, vx, vy, vz] = state
  const r = Math.hypot(x, y, z)
  const r3 = r * r * r
  const ax = -GM * x / r3
  const ay = -GM * y / r3
  const az = -GM * z / r3
  return [vx, vy, vz, ax, ay, az]
}

function rk45Step(f, t, y, h) {
  const k1 = f(t, y)
  const k2 = f(t + h/4, y.map((yi,i) => yi + h*k1[i]/4))
  const k3 = f(t + 3*h/8, y.map((yi,i) => yi + h*(3*k1[i]/32 + 9*k2[i]/32)))
  const k4 = f(t + 12*h/13, y.map((yi,i) => yi + h*(1932*k1[i]/2197 - 7200*k2[i]/2197 + 7296*k3[i]/2197)))
  const k5 = f(t + h, y.map((yi,i) => yi + h*(439*k1[i]/216 - 8*k2[i] + 3680*k3[i]/513 - 845*k4[i]/4104)))
  const k6 = f(t + h/2, y.map((yi,i) => yi + h*(-8*k1[i]/27 + 2*k2[i] - 3544*k3[i]/2565 + 1859*k4[i]/4104 - 11*k5[i]/40)))
  return y.map((yi, i) => yi + h*(16*k1[i]/135 + 6656*k3[i]/12825 + 28561*k4[i]/56430 - 9*k5[i]/50 + 2*k6[i]/55))
}

/**
 * Generate orbit sequence from state vector [x, y, z, vx, vy, vz] (km, km/s)
 * Automatically calculates orbital period and generates exactly one full orbit.
 * Returns array of { prn, time: Date, x: meters, y: meters, z: meters }
 */
export function generateStateVectorOrbit(initialState, step, prn) {
  const state0 = initialState.map(v => v * 1000)
  const r = Math.hypot(state0[0], state0[1], state0[2])
  const v2 = state0[3]**2 + state0[4]**2 + state0[5]**2
  const a = 1 / (2/r - v2/GM)
  const period = 2 * Math.PI * Math.sqrt(a*a*a / GM)
  const duration = period * 3  // 3 orbits for visual closure in ECEF

  const result = []
  const startTime = new Date()
  let t = 0
  let y = [...state0]

  result.push({ prn, time: new Date(startTime), x: y[0], y: y[1], z: y[2] })

  while (t < duration) {
    y = rk45Step(dynamics, t, y, step)
    t += step
    result.push({
      prn,
      time: new Date(startTime.getTime() + t * 1000),
      x: y[0], y: y[1], z: y[2]
    })
  }

  return result
}
