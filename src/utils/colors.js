/**
 * Color Utility Functions
 * 
 * Helper functions for color manipulation used in card rendering.
 */

const HEX_COLOR_REGEX = /^#([0-9a-f]{6})$/i
const HSL_COLOR_REGEX = /^hsl\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*\)$/i
const DEFAULT_FALLBACK_COLOR = '#1f2937'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const parseHexColor = (hexColor) => {
  const match = HEX_COLOR_REGEX.exec(hexColor)
  if (!match) return null
  const hex = match[1]
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  }
}

const hslToRgb = (hue, saturation, lightness) => {
  const h = ((hue % 360) + 360) % 360
  const s = clamp(saturation, 0, 100) / 100
  const l = clamp(lightness, 0, 100) / 100

  if (s === 0) {
    const gray = Math.round(l * 255)
    return { r: gray, g: gray, b: gray }
  }

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2

  let rPrime = 0
  let gPrime = 0
  let bPrime = 0

  if (h < 60) {
    rPrime = c
    gPrime = x
  } else if (h < 120) {
    rPrime = x
    gPrime = c
  } else if (h < 180) {
    gPrime = c
    bPrime = x
  } else if (h < 240) {
    gPrime = x
    bPrime = c
  } else if (h < 300) {
    rPrime = x
    bPrime = c
  } else {
    rPrime = c
    bPrime = x
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255)
  }
}

const parseHslColor = (hslColor) => {
  const match = HSL_COLOR_REGEX.exec(hslColor)
  if (!match) return null
  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3])
  }
}

const rgbToHex = (r, g, b) => {
  const toHex = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const parseColorToRgb = (color) => {
  if (typeof color !== 'string') return null
  const hexMatch = parseHexColor(color)
  if (hexMatch) return hexMatch

  const hslMatch = parseHslColor(color)
  if (!hslMatch) return null

  return hslToRgb(hslMatch.h, hslMatch.s, hslMatch.l)
}

export const normalizeColorToHex = (color) => {
  if (typeof color !== 'string') return null
  if (HEX_COLOR_REGEX.test(color)) {
    return color.toLowerCase()
  }

  const hslMatch = parseHslColor(color)
  if (!hslMatch) return null

  const { r, g, b } = hslToRgb(hslMatch.h, hslMatch.s, hslMatch.l)
  return rgbToHex(r, g, b)
}

/**
 * Converts hex color to pale background (90% white mix)
 * @param {string} color - Hex or HSL color string (e.g., '#c53030' or 'hsl(10, 60%, 40%)')
 * @returns {string} RGB color string
 */
export function getPaleBackground(color) {
  const rgb = parseColorToRgb(color) || parseHexColor(DEFAULT_FALLBACK_COLOR)
  const { r, g, b } = rgb
  
  const paleR = Math.round(r * 0.1 + 255 * 0.9)
  const paleG = Math.round(g * 0.1 + 255 * 0.9)
  const paleB = Math.round(b * 0.1 + 255 * 0.9)
  
  return `rgb(${paleR}, ${paleG}, ${paleB})`
}

/**
 * Converts hex color to mid-tone background (50% white mix)
 * @param {string} color - Hex or HSL color string
 * @returns {string} RGB color string
 */
export function getMidToneBackground(color) {
  const rgb = parseColorToRgb(color) || parseHexColor(DEFAULT_FALLBACK_COLOR)
  const { r, g, b } = rgb
  
  const midR = Math.round(r * 0.5 + 255 * 0.5)
  const midG = Math.round(g * 0.5 + 255 * 0.5)
  const midB = Math.round(b * 0.5 + 255 * 0.5)
  
  return `rgb(${midR}, ${midG}, ${midB})`
}

/**
 * Generates consistent color for category name
 * @param {string} category - Category name
 * @param {Object} defaultColors - Map of category names to default colors
 * @returns {string} Hex color string
 */
export function getCategoryColor(category, defaultColors = {}) {
  if (defaultColors[category]) {
    const normalized = normalizeColorToHex(defaultColors[category])
    if (normalized) {
      return normalized
    }
  }

  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash % 360)
  const saturation = 60 + (Math.abs(hash) % 20)
  const lightness = 35 + (Math.abs(hash >> 8) % 15)

  const { r, g, b } = hslToRgb(hue, saturation, lightness)
  return rgbToHex(r, g, b)
}
