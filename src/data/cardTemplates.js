/**
 * Card Templates
 * 
 * This module contains template definitions for different card types.
 * Each template is a factory function that generates a new card structure with unique IDs.
 */

import {
  createHighConceptElement,
  createTroubleElement,
  createAspectsElement,
  createSkillsElement,
  createInventoryElement,
  createStressTracksElement,
  createConsequencesElement,
  createNoteElement,
  createFatePointsElement
} from './elementFactories.js'

/**
 * Standard Player Character template
 * Full character sheet with all standard elements
 */
export const standardPC = () => ({
  title: 'New Character',
  subtitle: 'Player Character',
  elements: [
    createHighConceptElement(),
    createTroubleElement(),
    createAspectsElement(3),
    createSkillsElement(),
    createInventoryElement(),
    createStressTracksElement(),
    createConsequencesElement(),
    createFatePointsElement()
  ]
})

/**
 * Quick NPC template
 * Simplified character sheet for non-player characters
 */
export const quickNPC = () => ({
  title: 'New NPC',
  subtitle: 'Non-Player Character',
  elements: [
    createHighConceptElement(),
    createTroubleElement(),
    createAspectsElement(1),
    createSkillsElement(),
    createStressTracksElement(),
    createConsequencesElement()
  ]
})

/**
 * Scene template
 * For locations or situations with minimal structure
 */
export const scene = () => ({
  title: 'New Scene',
  subtitle: 'Location or Situation',
  elements: [
    createHighConceptElement(),
    createAspectsElement(2),
    createNoteElement()
  ]
})

/**
 * Blank template
 * Empty card for custom use
 */
export const blank = () => ({
  title: 'New Card',
  subtitle: '',
  elements: []
})

/**
 * Card templates lookup object
 * Maps template keys to their factory functions
 */
export const cardTemplates = {
  'standard-pc': standardPC,
  'quick-npc': quickNPC,
  'scene': scene,
  'blank': blank
}
