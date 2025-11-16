// Color utility helpers
export const darkenHex = (hex, factor = 0.85) => {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`
}

export const lightenHex = (hex, factor = 1.15) => {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`
}

export const computeLuminance = (hex) => {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return ((r * 299 + g * 587 + b * 114) / 1000) * (100 / 255)
}

export const adjustToLuminance = (hex, target = 60) => {
  const clean = hex.replace('#', '')
  let r = parseInt(clean.substring(0, 2), 16)
  let g = parseInt(clean.substring(2, 4), 16)
  let b = parseInt(clean.substring(4, 6), 16)
  const current = ((r * 299 + g * 587 + b * 114) / 1000) * (100 / 255)
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  if (current === 0) return hex
  const factor = target / current
  r = r * factor
  g = g * factor
  b = b * factor
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export const capSaturation = (hex, capPercent = 30) => {
  const clean = hex.replace('#', '')
  let r = parseInt(clean.substring(0, 2), 16) / 255
  let g = parseInt(clean.substring(2, 4), 16) / 255
  let b = parseInt(clean.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l
  l = (max - min) / 2 + min / 2
  const d = max - min
  if (d === 0) {
    h = 0
    s = 0
  } else {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  s = Math.min(s, capPercent / 100)
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r1, g1, b1
  if (h >= 0 && h < 60) [r1, g1, b1] = [c, x, 0]
  else if (h >= 60 && h < 120) [r1, g1, b1] = [x, c, 0]
  else if (h >= 120 && h < 180) [r1, g1, b1] = [0, c, x]
  else if (h >= 180 && h < 240) [r1, g1, b1] = [0, x, c]
  else if (h >= 240 && h < 300) [r1, g1, b1] = [x, 0, c]
  else [r1, g1, b1] = [c, 0, x]
  const toHex2 = (v) => Math.max(0, Math.min(255, Math.round((v + m) * 255))).toString(16).padStart(2, '0')
  return `#${toHex2(r1)}${toHex2(g1)}${toHex2(b1)}`
}


