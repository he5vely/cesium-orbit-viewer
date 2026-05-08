import { GM, OMEGA_E } from '../utils/constants.js'

/**
 * Broadcast ephemeris (17-parameter) to ECEF position
 * Returns { prn, time: Date, x: meters, y: meters, z: meters }
 */
export function calcBroadcast(eph, t) {
  const dt = (t.getTime() - eph.time.getTime()) / 1000
  const a = eph.sqrtA ** 2
  const n0 = Math.sqrt(GM / a ** 3)
  const n = n0 + eph.deltaN
  let M = eph.m0 + n * dt
  let E = M
  for (let i = 0; i < 10; i++) E = M + eph.e * Math.sin(E)
  const v = Math.atan2(Math.sqrt(1 - eph.e ** 2) * Math.sin(E), Math.cos(E) - eph.e)
  const phi = v + eph.omega

  const du = eph.cus * Math.sin(2*phi) + eph.cuc * Math.cos(2*phi)
  const dr = eph.crs * Math.sin(2*phi) + eph.crc * Math.cos(2*phi)
  const di = eph.cis * Math.sin(2*phi) + eph.cic * Math.cos(2*phi)

  const u = phi + du
  const r = a * (1 - eph.e * Math.cos(E)) + dr
  const iE = eph.i0 + eph.iDot * dt + di
  const omega = eph.omega0 + (eph.omegaDot - OMEGA_E) * dt - OMEGA_E * eph.toe

  const xOp = r * Math.cos(u)
  const yOp = r * Math.sin(u)

  return {
    prn: eph.prn,
    time: t,
    x: xOp * Math.cos(omega) - yOp * Math.cos(iE) * Math.sin(omega),
    y: xOp * Math.sin(omega) + yOp * Math.cos(iE) * Math.cos(omega),
    z: yOp * Math.sin(iE)
  }
}

/**
 * SP3 precise ephemeris Lagrange interpolation
 * points: array of { prn, time: Date, x: km, y: km, z: km }
 */
export function calcSP3(points, prn, t) {
  const list = points.filter(p => p.prn === prn).sort((a, b) => a.time - b.time)
  if (list.length < 4) return null

  const ts = t.getTime()
  let idx = list.findIndex(p => p.time.getTime() > ts)
  if (idx === -1) idx = list.length - 1

  const s = Math.max(0, idx - 2)
  const e = Math.min(list.length - 1, idx + 2)
  const w = list.slice(s, e + 1)

  let x = 0, y = 0, z = 0
  for (let i = 0; i < w.length; i++) {
    let l = 1
    const ti = w[i].time.getTime()
    for (let j = 0; j < w.length; j++) {
      if (i !== j) l *= (ts - w[j].time.getTime()) / (ti - w[j].time.getTime())
    }
    x += w[i].x * 1000 * l
    y += w[i].y * 1000 * l
    z += w[i].z * 1000 * l
  }

  return { prn, time: t, x, y, z }
}

/**
 * Generate ephemeris orbit sequence
 */
export function generateEphemerisOrbit(ephList, sp3List, prn, start, hours = 6, step = 60) {
  const result = []
  const total = hours * 3600 / step
  const eph = ephList.find(e => e.prn === prn)

  for (let i = 0; i <= total; i++) {
    const t = new Date(start.getTime() + i * step * 1000)
    if (eph) {
      result.push(calcBroadcast(eph, t))
    } else {
      const sp3 = calcSP3(sp3List, prn, t)
      if (sp3) result.push(sp3)
    }
  }

  return result
}

/**
 * Broadcast vs precise position error
 */
export function calcErrors(ephList, sp3List, prn, start, hours = 6, step = 300) {
  const errors = []
  const total = hours * 3600 / step
  const eph = ephList.find(e => e.prn === prn)
  if (!eph) return errors

  for (let i = 0; i <= total; i++) {
    const t = new Date(start.getTime() + i * step * 1000)
    const bc = calcBroadcast(eph, t)
    const sp3 = calcSP3(sp3List, prn, t)
    if (bc && sp3) {
      errors.push({
        prn,
        time: t,
        posError: Math.hypot(bc.x - sp3.x, bc.y - sp3.y, bc.z - sp3.z)
      })
    }
  }

  return errors
}

/** Export orbits as CSV */
export function exportCSV(orbits) {
  const header = 'PRN,Time,X,Y,Z\n'
  const rows = orbits.map(o => `${o.prn},${o.time.toISOString()},${o.x.toFixed(3)},${o.y.toFixed(3)},${o.z.toFixed(3)}`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'orbit.csv'
  a.click()
}

/** Export orbits as JSON */
export function exportJSON(orbits) {
  const data = orbits.map(o => ({ prn: o.prn, time: o.time.toISOString(), x: o.x, y: o.y, z: o.z }))
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'orbit.json'
  a.click()
}
