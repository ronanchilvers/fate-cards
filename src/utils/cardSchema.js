/**
 * Card Schema Validator and Normalizer
 * 
 * Provides functions to validate and normalize card data structures,
 * ensuring data integrity and providing safe defaults for missing fields.
 */

import { ELEMENT_TYPES } from '../constants'

/**
 * Validates if a string is a valid hex color code
 * @param {string} color - The color string to validate
 * @returns {boolean} True if valid hex color, false otherwise
 */
function isValidHexColor(color) {
  return typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)
}

const ALLOWED_ELEMENT_TYPES = new Set(Object.values(ELEMENT_TYPES))

const normalizeStringArray = (items) => {
  if (!Array.isArray(items)) return []
  return items.filter(item => typeof item === 'string')
}

const normalizeSkillItems = (items) => {
  if (!Array.isArray(items)) return []
  return items.reduce((acc, item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return acc
    const name = typeof item.name === 'string' ? item.name : ''
    const rating = typeof item.rating === 'number' && !Number.isNaN(item.rating)
      ? item.rating
      : 0
    acc.push({ name, rating })
    return acc
  }, [])
}

const normalizeBox = (box) => {
  if (!box || typeof box !== 'object' || Array.isArray(box)) return null
  const checked = typeof box.checked === 'boolean' ? box.checked : false
  const value = typeof box.value === 'number' && !Number.isNaN(box.value)
    ? box.value
    : 1
  return { checked, value }
}

const normalizeBoxes = (boxes) => {
  const fallback = [{ checked: false, value: 1 }]
  if (!Array.isArray(boxes)) return fallback
  const normalized = boxes.map(normalizeBox).filter(Boolean)
  return normalized.length > 0 ? normalized : fallback
}

const normalizeStressTracks = (tracks) => {
  if (!Array.isArray(tracks)) return []
  return tracks.reduce((acc, track) => {
    if (!track || typeof track !== 'object' || Array.isArray(track)) return acc
    const name = typeof track.name === 'string' ? track.name : ''
    acc.push({
      name,
      boxes: normalizeBoxes(track.boxes)
    })
    return acc
  }, [])
}

const normalizeConsequences = (items) => {
  if (!Array.isArray(items)) return []
  return items.reduce((acc, item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return acc
    const label = typeof item.label === 'string' ? item.label : ''
    const text = typeof item.text === 'string' ? item.text : ''
    acc.push({ label, text })
    return acc
  }, [])
}

const normalizeElement = (element) => {
  if (!element || typeof element !== 'object' || Array.isArray(element)) {
    return null
  }

  const type = typeof element.type === 'string' ? element.type : null
  if (!type || !ALLOWED_ELEMENT_TYPES.has(type)) {
    return null
  }

  const id = typeof element.id === 'string' && element.id.trim()
    ? element.id
    : crypto.randomUUID()

  if (type === ELEMENT_TYPES.HIGH_CONCEPT || type === ELEMENT_TYPES.TROUBLE || type === ELEMENT_TYPES.NOTE) {
    return {
      id,
      type,
      text: typeof element.text === 'string' ? element.text : ''
    }
  }

  if (type === ELEMENT_TYPES.ASPECTS) {
    return {
      id,
      type,
      items: normalizeStringArray(element.items)
    }
  }

  if (type === ELEMENT_TYPES.SKILLS) {
    return {
      id,
      type,
      items: normalizeSkillItems(element.items)
    }
  }

  if (type === ELEMENT_TYPES.STRESS_TRACKS) {
    return {
      id,
      type,
      tracks: normalizeStressTracks(element.tracks)
    }
  }

  if (type === ELEMENT_TYPES.CONSEQUENCES) {
    return {
      id,
      type,
      items: normalizeConsequences(element.items)
    }
  }

  if (type === ELEMENT_TYPES.FATE_POINTS) {
    const current = typeof element.current === 'number' && !Number.isNaN(element.current)
      ? element.current
      : 0
    const refresh = typeof element.refresh === 'number' && !Number.isNaN(element.refresh)
      ? element.refresh
      : 3
    return {
      id,
      type,
      current,
      refresh
    }
  }

  if (type === ELEMENT_TYPES.GAME_TOOLS) {
    return {
      id,
      type,
      dice: Array.isArray(element.dice) ? element.dice : []
    }
  }

  return null
}

/**
 * Normalizes a single card object, ensuring all required fields exist with valid values
 * @param {*} card - The card object to normalize
 * @returns {Object|null} Normalized card object, or null if input is invalid
 */
export function normalizeCard(card) {
  // Return null if input is not an object or is an array
  if (typeof card !== 'object' || card === null || Array.isArray(card)) {
    return null
  }

  // Ensure id exists (generate with crypto.randomUUID() if missing)
  const id = typeof card.id === 'string' && card.id.trim() 
    ? card.id 
    : crypto.randomUUID()

  // Ensure title is a string (default: 'Untitled')
  const title = typeof card.title === 'string' && card.title.trim()
    ? card.title
    : 'Untitled'

  // Ensure subtitle is a string (default: empty string)
  const subtitle = typeof card.subtitle === 'string'
    ? card.subtitle
    : ''

  // Ensure elements is an array (default: []) and normalize each entry
  const elements = Array.isArray(card.elements)
    ? card.elements.map(normalizeElement).filter(Boolean)
    : []

  // Ensure category is a string (default: 'PCs')
  const category = typeof card.category === 'string' && card.category.trim()
    ? card.category
    : 'PCs'

  // Ensure color is a valid hex string (default: '#1f2937')
  const color = isValidHexColor(card.color)
    ? card.color
    : '#1f2937'

  // Ensure layout is one of the allowed values (default: 'auto')
  const allowedLayouts = ['auto', 'single-column', '2-column']
  const layout = allowedLayouts.includes(card.layout)
    ? card.layout
    : 'auto'

  // Preserve locked state if it exists
  const locked = typeof card.locked === 'boolean'
    ? card.locked
    : false

  return {
    id,
    title,
    subtitle,
    category,
    color,
    layout,
    locked,
    elements
  }
}

/**
 * Normalizes an array of cards, filtering out invalid entries
 * @param {*} cards - The array of cards to normalize
 * @returns {Array} Array of normalized valid cards
 */
export function normalizeCards(cards) {
  if (!Array.isArray(cards)) {
    return []
  }

  return cards
    .map(card => normalizeCard(card))
    .filter(card => card !== null)
}
