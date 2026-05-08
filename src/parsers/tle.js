import { GM } from '../utils/constants.js'

export function parseTLE(line1, line2) {
  const prn = line1.slice(2, 7).trim()
  const incRaw = parseFloat(line2.slice(8, 16))
  const raanRaw = parseFloat(line2.slice(17, 25))
  const eccRaw = parseFloat('0.' + line2.slice(26, 33))
  const argpRaw = parseFloat(line2.slice(34, 42))
  const M0Raw = parseFloat(line2.slice(43, 51))
  const nRaw = parseFloat(line2.slice(52, 63))

  const n = nRaw * 2 * Math.PI / 86400
  const a = Math.pow(GM / (n * n), 1/3) / 1000

  return {
    prn,
    a,
    e: eccRaw,
    i: incRaw * Math.PI / 180,
    raan: raanRaw * Math.PI / 180,
    argp: argpRaw * Math.PI / 180,
    M0: M0Raw * Math.PI / 180
  }
}
