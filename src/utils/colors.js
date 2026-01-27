/**
 * Color Utility Functions
 * 
 * Helper functions for color manipulation used in card rendering.
 */

/**
 * Converts hex color to pale background (90% white mix)
 * @param {string} hexColor - Hex color string (e.g., '#c53030')
 * @returns {string} RGB color string
 */
export function getPaleBackground(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  const paleR = Math.round(r * 0.1 + 255 * 0.9)
  const paleG = Math.round(g * 0.1 + 255 * 0.9)
  const paleB = Math.round(b * 0.1 + 255 * 0.9)
  
  return `rgb(${paleR}, ${paleG}, ${paleB})`
}

/**
 * Converts hex color to mid-tone background (50% white mix)
 * @param {string} hexColor - Hex color string
 * @returns {string} RGB color string
 */
export function getMidToneBackground(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  const midR = Math.round(r * 0.5 + 255 * 0.5)
  const midG = Math.round(g * 0.5 + 255 * 0.5)
  const midB = Math.round(b * 0.5 + 255 * 0.5)
  
  return `rgb(${midR}, ${midG}, ${midB})`
}

/**
 * Generates consistent color for category name
 * @param {string} category - Category name
 * @param {Object} defaultColors - Map of category names to default colors
 * @returns {string} Hex or HSL color string
 */
export function getCategoryColor(category, defaultColors = {}) {
  if (defaultColors[category]) {
    return defaultColors[category]
  }

  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash % 360)
  const saturation = 60 + (Math.abs(hash) % 20)
  const lightness = 35 + (Math.abs(hash >> 8) % 15)

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}