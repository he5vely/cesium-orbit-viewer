export function parseRinexNavigation(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const list = []
  let currentPrn = ''
  let currentTime = null
  let buf = {}

  for (const line of lines) {
    if (/^(G|C|R|E)\d{2}/.test(line)) {
      if (currentPrn && currentTime && buf.toe !== undefined) {
        list.push({ prn: currentPrn, time: currentTime, ...buf })
      }
      currentPrn = line.slice(0, 3)
      const parts = line.split(/\s+/).filter(Boolean)
      if (parts.length >= 5) {
        const y = parseInt(parts[1])
        const m = parseInt(parts[2])
        const d = parseInt(parts[3])
        const hh = parseInt(parts[4]) || 0
        const mm = parseInt(parts[5]) || 0
        const ss = parseFloat(parts[6]) || 0
        currentTime = new Date(Date.UTC(y >= 80 ? 1900+y : 2000+y, m-1, d, hh, mm, ss))
      }
      buf = {}
      continue
    }

    if (!currentPrn || !currentTime) continue

    const parts = line.split(/\s+/).filter(Boolean)
    if (parts.length < 3) continue

    if (buf.iode === undefined && parts.length >= 4) {
      buf.iode = parseFloat(parts[0])
      buf.crs = parseFloat(parts[1])
      buf.deltaN = parseFloat(parts[2])
      buf.m0 = parseFloat(parts[3])
    } else if (buf.cuc === undefined && parts.length >= 4) {
      buf.cuc = parseFloat(parts[0])
      buf.e = parseFloat(parts[1])
      buf.cus = parseFloat(parts[2])
      buf.sqrtA = parseFloat(parts[3])
    } else if (buf.toe === undefined && parts.length >= 4) {
      buf.toe = parseFloat(parts[0])
      buf.cic = parseFloat(parts[1])
      buf.omega0 = parseFloat(parts[2])
      buf.cis = parseFloat(parts[3])
    } else if (buf.i0 === undefined && parts.length >= 4) {
      buf.i0 = parseFloat(parts[0])
      buf.crc = parseFloat(parts[1])
      buf.omega = parseFloat(parts[2])
      buf.omegaDot = parseFloat(parts[3])
    } else if (buf.iDot === undefined) {
      buf.iDot = parseFloat(parts[0]) || 0
    }
  }

  if (currentPrn && currentTime && buf.toe !== undefined) {
    list.push({ prn: currentPrn, time: currentTime, ...buf })
  }

  return list
}
