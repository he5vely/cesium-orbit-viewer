// GPS-like demo broadcast ephemeris for 3 satellites
// Semi-major axis ~26560 km, inclination ~55°, spread across 3 orbital planes

const baseDate = new Date('2026-05-01T00:00:00Z')

export const demoBroadcast = [
  {
    prn: 'G01',
    time: baseDate,
    sqrtA: 5153.65,
    e: 0.006,
    i0: 0.959931,       // 55°
    omega0: 0.0,          // RAAN = 0°
    omega: 0.0,           // argument of perigee
    m0: 0.0,              // mean anomaly
    deltaN: 0.0,
    omegaDot: 0.0,
    iDot: 0.0,
    cus: 0.0, cuc: 0.0, crs: 0.0, crc: 0.0, cis: 0.0, cic: 0.0,
    toe: 0.0
  },
  {
    prn: 'G02',
    time: baseDate,
    sqrtA: 5153.65,
    e: 0.008,
    i0: 0.959931,
    omega0: 2.094395,     // RAAN = 120°
    omega: 0.0,
    m0: 1.047198,         // 60° offset
    deltaN: 0.0,
    omegaDot: 0.0,
    iDot: 0.0,
    cus: 0.0, cuc: 0.0, crs: 0.0, crc: 0.0, cis: 0.0, cic: 0.0,
    toe: 0.0
  },
  {
    prn: 'G03',
    time: baseDate,
    sqrtA: 5153.65,
    e: 0.004,
    i0: 0.959931,
    omega0: 4.188790,     // RAAN = 240°
    omega: 0.0,
    m0: 2.094395,         // 120° offset
    deltaN: 0.0,
    omegaDot: 0.0,
    iDot: 0.0,
    cus: 0.0, cuc: 0.0, crs: 0.0, crc: 0.0, cis: 0.0, cic: 0.0,
    toe: 0.0
  }
]

// SP3 demo data — 1-hour steps over one GPS orbital period (~12 hours)
// Generated as circular orbits at GPS altitude
export function generateDemoSP3() {
  const points = []
  const a = 26560000  // semi-major axis in meters
  const GM = 3.986004418e14
  const n = Math.sqrt(GM / (a * a * a))  // mean motion
  const period = 2 * Math.PI / n
  const step = 3600  // 1 hour
  const total = Math.floor(period / step)

  const sats = [
    { prn: 'G01', i: 0.959931, raan: 0.0, m0: 0.0 },
    { prn: 'G02', i: 0.959931, raan: 2.094395, m0: 1.047198 },
    { prn: 'G03', i: 0.959931, raan: 4.188790, m0: 2.094395 }
  ]

  for (const sat of sats) {
    for (let s = 0; s <= total; s++) {
      const dt = s * step
      const M = sat.m0 + n * dt
      // Solve Kepler's equation
      let E = M
      for (let k = 0; k < 10; k++) E = M + 0.006 * Math.sin(E)
      const nu = 2 * Math.atan2(Math.sqrt(1.006) * Math.sin(E/2), Math.sqrt(0.994) * Math.cos(E/2))
      const r = a * (1 - 0.006 * 0.006) / (1 + 0.006 * Math.cos(nu))
      const argLat = nu // omega = 0
      const cosU = Math.cos(argLat), sinU = Math.sin(argLat)
      const cosI = Math.cos(sat.i), sinI = Math.sin(sat.i)

      // ECI position
      const xEci = r * (Math.cos(sat.raan) * cosU - Math.sin(sat.raan) * sinU * cosI)
      const yEci = r * (Math.sin(sat.raan) * cosU + Math.cos(sat.raan) * sinU * cosI)
      const zEci = r * (sinU * sinI)

      points.push({
        prn: sat.prn,
        time: new Date(baseDate.getTime() + dt * 1000),
        x: xEci / 1000,  // km for SP3 format
        y: yEci / 1000,
        z: zEci / 1000
      })
    }
  }

  return points
}
