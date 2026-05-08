// LEO demo broadcast ephemeris for 3 satellites
// ~700 km altitude, near-circular, spread across 3 orbital planes
// These produce visually clean orbits similar to the orbital elements mode

const baseDate = new Date('2026-05-01T00:00:00Z')
const RE = 6378.137  // Earth radius km
const h = 722         // altitude km
const a = (RE + h) * 1000  // semi-major axis in meters
const sqrtA = Math.sqrt(a)  // ~2664.8
const n0 = Math.sqrt(3.986004418e14 / (a * a * a))  // mean motion rad/s

export const demoBroadcast = [
  {
    prn: 'G01',
    time: baseDate,
    sqrtA: sqrtA,
    e: 0.0015,
    i0: 1.71,           // ~98°
    omega0: 4.886,      // RAAN ~280°
    omega: 0.0,
    m0: 0.0,
    deltaN: 0.0,
    omegaDot: 0.0,
    iDot: 0.0,
    cus: 0.0, cuc: 0.0, crs: 0.0, crc: 0.0, cis: 0.0, cic: 0.0,
    toe: 0.0
  },
  {
    prn: 'G02',
    time: baseDate,
    sqrtA: sqrtA,
    e: 0.002,
    i0: 1.727,          // ~99°
    omega0: 2.0,        // RAAN ~115°
    omega: 0.0,
    m0: 0.785,          // 45° offset
    deltaN: 0.0,
    omegaDot: 0.0,
    iDot: 0.0,
    cus: 0.0, cuc: 0.0, crs: 0.0, crc: 0.0, cis: 0.0, cic: 0.0,
    toe: 0.0
  },
  {
    prn: 'G03',
    time: baseDate,
    sqrtA: sqrtA,
    e: 0.001,
    i0: 1.745,          // ~100°
    omega0: 1.0,        // RAAN ~57°
    omega: 0.0,
    m0: 1.571,          // 90° offset
    deltaN: 0.0,
    omegaDot: 0.0,
    iDot: 0.0,
    cus: 0.0, cuc: 0.0, crs: 0.0, crc: 0.0, cis: 0.0, cic: 0.0,
    toe: 0.0
  }
]

// Generate SP3 positions matching the broadcast ephemeris orbits
export function generateDemoSP3() {
  const GM = 3.986004418e14
  const n = Math.sqrt(GM / (a * a * a))
  const period = 2 * Math.PI / n
  const step = 180  // 3-minute steps for smooth orbit display
  const orbits = 3  // 3 orbits
  const total = Math.floor(orbits * period / step)

  const sats = [
    { prn: 'G01', e: 0.0015, i: 1.71, raan: 4.886, m0: 0.0 },
    { prn: 'G02', e: 0.002, i: 1.727, raan: 2.0, m0: 0.785 },
    { prn: 'G03', e: 0.001, i: 1.745, raan: 1.0, m0: 1.571 }
  ]

  const points = []

  for (const sat of sats) {
    for (let s = 0; s <= total; s++) {
      const dt = s * step
      const M = sat.m0 + n * dt
      let E = M
      for (let k = 0; k < 10; k++) E = M + sat.e * Math.sin(E)
      const nu = 2 * Math.atan2(
        Math.sqrt(1 + sat.e) * Math.sin(E / 2),
        Math.sqrt(1 - sat.e) * Math.cos(E / 2)
      )
      const r = a * (1 - sat.e * sat.e) / (1 + sat.e * Math.cos(nu))
      const argLat = nu
      const cosU = Math.cos(argLat), sinU = Math.sin(argLat)
      const cosI = Math.cos(sat.i), sinI = Math.sin(sat.i)

      // ECI
      const xEci = r * (Math.cos(sat.raan) * cosU - Math.sin(sat.raan) * sinU * cosI)
      const yEci = r * (Math.sin(sat.raan) * cosU + Math.cos(sat.raan) * sinU * cosI)
      const zEci = r * (sinU * sinI)

      // Convert to ECEF (apply Earth rotation)
      const OMEGA_E = 7.2921151467e-5
      const theta = OMEGA_E * dt
      const cosT = Math.cos(theta), sinT = Math.sin(theta)

      points.push({
        prn: sat.prn,
        time: new Date(baseDate.getTime() + dt * 1000),
        x: (xEci * cosT + yEci * sinT) / 1000,   // ECEF km
        y: (-xEci * sinT + yEci * cosT) / 1000,
        z: zEci / 1000
      })
    }
  }

  return points
}
