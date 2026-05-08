export function parseSP3(text) {
  const lines = text.split('\n').map(l => l.trim())
  const pts = []
  let currentTime = null

  for (const line of lines) {
    if (line.startsWith('*')) {
      const parts = line.split(/\s+/)
      if (parts.length >= 7) {
        currentTime = new Date(Date.UTC(
          parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]),
          parseInt(parts[4]), parseInt(parts[5]), parseFloat(parts[6])
        ))
      }
    } else if (currentTime && line.startsWith('P')) {
      const prn = line.slice(1, 4)
      if (/^(G|C|R|E)\d{2}$/.test(prn)) {
        pts.push({
          prn,
          time: currentTime,
          x: parseFloat(line.slice(4, 18)),
          y: parseFloat(line.slice(18, 32)),
          z: parseFloat(line.slice(32, 46))
        })
      }
    }
  }

  return pts
}
