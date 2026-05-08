import { GM, OMEGA_E } from '../utils/constants.js'

/**
 * Keplerian elements to ECI cartesian coordinates (returns meters)
 * a: semi-major axis (km), e: eccentricity, i: inclination (rad),
 * raan: right ascension of ascending node (rad), argp: argument of perigee (rad),
 * nu: true anomaly (rad)
 */
export function kepToCart(a, e, i, raan, argp, nu) {
  const aM = a * 1000
  const p = aM * (1 - e * e)
  const r = p / (1 + e * Math.cos(nu))
  const cosArgNu = Math.cos(argp + nu)
  const sinArgNu = Math.sin(argp + nu)
  const x = r * (Math.cos(raan) * cosArgNu - Math.sin(raan) * sinArgNu * Math.cos(i))
  const y = r * (Math.sin(raan) * cosArgNu + Math.cos(raan) * sinArgNu * Math.cos(i))
  const z = r * (sinArgNu * Math.sin(i))
  return { x, y, z }
}

/** ECI to ECEF via Earth rotation correction (dt = elapsed seconds since epoch) */
function eci2ecef(x, y, z, dt) {
  const theta = OMEGA_E * dt
  const cosT = Math.cos(theta), sinT = Math.sin(theta)
  return {
    x: x * cosT + y * sinT,
    y: -x * sinT + y * cosT,
    z
  }
}

/** Solve Kepler's equation: M = E - e*sin(E) */
function solveKepler(M, e) {
  let E = M
  for (let i = 0; i < 10; i++) E = M + e * Math.sin(E)
  return E
}

/** True anomaly from eccentric anomaly */
function trueAnomaly(E, e) {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2))
}

/**
 * Generate orbit sequence from orbital elements
 * Returns array of { prn, time: Date, x: meters, y: meters, z: meters }
 */
export function generateOrbitalOrbit(a, e, i, raan, argp, prn, startTime, hours = 6, stepMin = 2) {
  const aM = a * 1000
  const n = Math.sqrt(GM / (aM * aM * aM))
  const totalSteps = Math.floor(hours * 3600 / (stepMin * 60))
  const result = []

  for (let s = 0; s <= totalSteps; s++) {
    const dt = s * stepMin * 60
    const M = n * dt
    const E = solveKepler(M, e)
    const nu = trueAnomaly(E, e)
    const cart = kepToCart(a, e, i, raan, argp, nu)
    const ecef = eci2ecef(cart.x, cart.y, cart.z, dt)
    result.push({
      prn,
      time: new Date(startTime.getTime() + dt * 1000),
      ...ecef
    })
  }

  return result
}

/**
 * Ground track points (ECEF, meters)
 * laps: number of orbital periods, ptsPerLap: points per orbit
 */
export function groundTrackPoints(a, e, i, raan, argp, laps = 10, ptsPerLap = 60) {
  const aM = a * 1000
  const n = Math.sqrt(GM / (aM * aM * aM))
  const pts = []
  const total = laps * ptsPerLap

  for (let s = 0; s <= total; s++) {
    const M = (s / ptsPerLap) * 2 * Math.PI
    const E = solveKepler(M, e)
    const nu = trueAnomaly(E, e)
    pts.push(kepToCart(a, e, i, raan, argp, nu))
  }

  return pts
}

/**
 * Forecast points for N hours ahead
 */
export function forecastPoints(a, e, i, raan, argp, hours) {
  const aM = a * 1000
  const n = Math.sqrt(GM / (aM * aM * aM))
  const step = 120
  const total = (hours * 3600) / step
  const pts = []

  for (let t = 0; t <= total; t++) {
    const M = n * t * step
    const E = solveKepler(M, e)
    const nu = trueAnomaly(E, e)
    pts.push(kepToCart(a, e, i, raan, argp, nu))
  }

  return pts
}

/**
 * Non-singular elements conversion. Returns { lamDeg, isSingular }
 */
export function toNonSingular(e, i, raan, argp, M) {
  const eThreshold = 0.01
  const iThresholdDeg = 3
  const iThreshold = iThresholdDeg * Math.PI / 180
  const isSingular = e < eThreshold || i < iThreshold || Math.abs(i - Math.PI) < iThreshold

  let lam = (raan + argp + M) % (2 * Math.PI)
  if (lam < 0) lam += 2 * Math.PI

  return { lamDeg: lam * 180 / Math.PI, isSingular }
}
