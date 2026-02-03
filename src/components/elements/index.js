// Element components barrel export
export { default as ElementWrapper } from './ElementWrapper'
export { default as HighConceptElement } from './HighConceptElement'
export { default as TroubleElement } from './TroubleElement'
export { default as AspectsElement } from './AspectsElement'
export { default as NoteElement } from './NoteElement'
export { default as FatePointsElement } from './FatePointsElement'
export { default as SkillsElement } from './SkillsElement'
export { default as InventoryElement } from './InventoryElement'
export { default as StressTracksElement } from './StressTracksElement'
export { default as ConsequencesElement } from './ConsequencesElement'

// Element type to component mapping
import { ELEMENT_TYPES } from '../../constants'
import HighConceptElement from './HighConceptElement'
import TroubleElement from './TroubleElement'
import AspectsElement from './AspectsElement'
import SkillsElement from './SkillsElement'
import InventoryElement from './InventoryElement'
import StressTracksElement from './StressTracksElement'
import ConsequencesElement from './ConsequencesElement'
import NoteElement from './NoteElement'
import FatePointsElement from './FatePointsElement'

/**
 * Registry mapping element types to their React components
 * Used for dynamic rendering in Card.jsx
 */
export const ELEMENT_COMPONENTS = {
  [ELEMENT_TYPES.HIGH_CONCEPT]: HighConceptElement,
  [ELEMENT_TYPES.TROUBLE]: TroubleElement,
  [ELEMENT_TYPES.ASPECTS]: AspectsElement,
  [ELEMENT_TYPES.SKILLS]: SkillsElement,
  [ELEMENT_TYPES.INVENTORY]: InventoryElement,
  [ELEMENT_TYPES.STRESS_TRACKS]: StressTracksElement,
  [ELEMENT_TYPES.CONSEQUENCES]: ConsequencesElement,
  [ELEMENT_TYPES.NOTE]: NoteElement,
  [ELEMENT_TYPES.FATE_POINTS]: FatePointsElement
}

/**
 * Get the component for an element type
 * @param {string} type - Element type (from ELEMENT_TYPES)
 * @returns {React.Component|null} The component or null if type not found
 */
export function getElementComponent(type) {
  return ELEMENT_COMPONENTS[type] || null
}
