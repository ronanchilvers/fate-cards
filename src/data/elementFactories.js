/**
 * Centralized element factory functions for creating card elements
 * Used by both Card.jsx and cardTemplates.js to avoid duplication
 */

import { ELEMENT_TYPES } from '../constants.js'

/**
 * Creates a new high concept element
 * @returns {Object} High concept element structure
 */
export const createHighConceptElement = () => ({
  id: crypto.randomUUID(),
  type: ELEMENT_TYPES.HIGH_CONCEPT,
  text: ''
})

/**
 * Creates a new trouble element
 * @returns {Object} Trouble element structure
 */
export const createTroubleElement = () => ({
  id: crypto.randomUUID(),
  type: ELEMENT_TYPES.TROUBLE,
  text: ''
})

/**
 * Creates a new aspects element
 * @param {number} count - Number of aspect slots (default: 3)
 * @returns {Object} Aspects element structure
 */
export const createAspectsElement = (count = 3) => ({
  id: crypto.randomUUID(),
  type: ELEMENT_TYPES.ASPECTS,
  items: Array(count).fill('')
})

/**
 * Creates a new skills element
 * @param {Array} items - Initial skills array (default: empty)
 * @returns {Object} Skills element structure
 */
export const createSkillsElement = (items = []) => ({
  id: crypto.randomUUID(),
  type: ELEMENT_TYPES.SKILLS,
  items: [...items]
})

/**
 * Creates a new inventory element
 * @param {Array} items - Initial inventory items
 * @returns {Object} Inventory element structure
 */
export const createInventoryElement = (items = null) => ({
  id: crypto.randomUUID(),
  type: ELEMENT_TYPES.INVENTORY,
  items: items || [
    { id: crypto.randomUUID(), name: '' }
  ]
})

/**
 * Creates a new stress tracks element
 * @param {Array} tracks - Custom tracks configuration
 * @returns {Object} Stress tracks element structure
 */
export const createStressTracksElement = (tracks = null) => ({
  id: crypto.randomUUID(),
  type: ELEMENT_TYPES.STRESS_TRACKS,
  tracks: tracks || [
    {
      name: 'Physical Stress',
      boxes: [
        { checked: false, value: 1 },
        { checked: false, value: 1 },
        { checked: false, value: 1 }
      ]
    },
    {
      name: 'Mental Stress',
      boxes: [
        { checked: false, value: 1 },
        { checked: false, value: 1 },
        { checked: false, value: 1 }
      ]
    }
  ]
})

/**
 * Creates a new consequences element
 * @param {Array} items - Custom consequences array
 * @returns {Object} Consequences element structure
 */
export const createConsequencesElement = (items = null) => ({
  id: crypto.randomUUID(),
  type: ELEMENT_TYPES.CONSEQUENCES,
  items: items || [
    { label: 'Mild (2)', text: '---' },
    { label: 'Moderate (4)', text: '---' },
    { label: 'Severe (6)', text: '---' }
  ]
})

/**
 * Creates a new note element
 * @param {string} text - Initial text content
 * @returns {Object} Note element structure
 */
export const createNoteElement = (text = '') => ({
  id: crypto.randomUUID(),
  type: ELEMENT_TYPES.NOTE,
  text
})

/**
 * Creates a new fate points element
 * @param {number} current - Current fate points
 * @param {number} refresh - Refresh value
 * @returns {Object} Fate points element structure
 */
export const createFatePointsElement = (current = 3, refresh = 3) => ({
  id: crypto.randomUUID(),
  type: ELEMENT_TYPES.FATE_POINTS,
  current,
  refresh
})

/**
 * Creates a new game tools element (currently unused)
 * @returns {Object} Game tools element structure
 */
export const createGameToolsElement = () => ({
  id: crypto.randomUUID(),
  type: ELEMENT_TYPES.GAME_TOOLS,
  dice: []
})

/**
 * Factory function that creates an element by type
 * @param {string} type - Element type from ELEMENT_TYPES
 * @returns {Object} Element structure
 */
export const createElementByType = (type) => {
  const factories = {
    [ELEMENT_TYPES.HIGH_CONCEPT]: createHighConceptElement,
    [ELEMENT_TYPES.TROUBLE]: createTroubleElement,
    [ELEMENT_TYPES.ASPECTS]: createAspectsElement,
    [ELEMENT_TYPES.SKILLS]: createSkillsElement,
    [ELEMENT_TYPES.INVENTORY]: createInventoryElement,
    [ELEMENT_TYPES.STRESS_TRACKS]: createStressTracksElement,
    [ELEMENT_TYPES.CONSEQUENCES]: createConsequencesElement,
    [ELEMENT_TYPES.NOTE]: createNoteElement,
    [ELEMENT_TYPES.FATE_POINTS]: createFatePointsElement,
    [ELEMENT_TYPES.GAME_TOOLS]: createGameToolsElement
  }

  const factory = factories[type]
  return factory ? factory() : createNoteElement()
}
