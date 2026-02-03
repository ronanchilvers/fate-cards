/**
 * Card Schema Validator and Normalizer
 * 
 * Provides functions to validate and normalize card data structures,
 * ensuring data integrity and providing safe defaults for missing fields.
 */

import { normalizeColorToHex } from './colors'

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

  // Ensure elements is an array (default: [])
  const elements = Array.isArray(card.elements)
    ? card.elements
    : []

  // Ensure category is a string (default: 'PCs')
  const category = typeof card.category === 'string' && card.category.trim()
    ? card.category
    : 'PCs'

  // Ensure color is a valid hex or HSL string, normalized to hex (default: '#1f2937')
  const normalizedColor = normalizeColorToHex(card.color)
  const color = normalizedColor || '#1f2937'

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
