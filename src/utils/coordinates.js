import { RE, F, E2, OMEGA_E } from './constants.js'

export function ecef2blh(x, y, z) {
  const p = Math.hypot(x, y)
  // Guard against polar singularity where p ≈ 0
  if (p < 1e-12) {
    const b = RE * (1 - F)
    return {
      lat: Math.sign(z) * Math.PI / 2,
      lon: 0,
      height: Math.abs(z) - b
    }
  }
  let lat = Math.atan2(z, p * (1 - E2))
  let h = 0
  for (let i = 0; i < 5; i++) {
    const N = RE / Math.sqrt(1 - E2 * Math.sin(lat) ** 2)
    h = p / Math.cos(lat) - N
    lat = Math.atan2(z, p * (1 - E2 * N / (N + h)))
  }
  return { lat, lon: Math.atan2(y, x), height: h }
}

export function ecef2j2000(x, y, z, t) {
  const jd = (t.getTime() / 1000 / 86400) + 2440587.5
  const ut1 = jd - 2451545.0
  const theta = OMEGA_E * ut1 * 86400
  return {
    x: x * Math.cos(theta) + y * Math.sin(theta),
    y: -x * Math.sin(theta) + y * Math.cos(theta),
    z
  }
}

export function rad2deg(r) { return r * 180 / Math.PI }

export function deg2rad(d) { return d * Math.PI / 180 }
