/**
 * Card Templates
 * 
 * This module contains template definitions for different card types.
 * Each template is a factory function that generates a new card structure with unique IDs.
 */

/**
 * Standard Player Character template
 * Full character sheet with all standard elements
 */
export const standardPC = () => ({
  title: 'New Character',
  subtitle: 'Player Character',
  elements: [
    {
      id: crypto.randomUUID(),
      type: 'high-concept',
      text: ''
    },
    {
      id: crypto.randomUUID(),
      type: 'trouble',
      text: ''
    },
    {
      id: crypto.randomUUID(),
      type: 'aspects',
      items: ['', '', '']
    },
    {
      id: crypto.randomUUID(),
      type: 'skills',
      items: []
    },
    {
      id: crypto.randomUUID(),
      type: 'stress-tracks',
      tracks: [
        { 
          name: 'Physical Stress', 
          boxes: [
            { checked: false, value: 1 },
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
            { checked: false, value: 1 },
            { checked: false, value: 1 }
          ]
        }
      ]
    },
    {
      id: crypto.randomUUID(),
      type: 'consequences',
      items: [
        { label: 'Mild (2)', text: '---' },
        { label: 'Moderate (4)', text: '---' },
        { label: 'Severe (6)', text: '---' }
      ]
    },
    {
      id: crypto.randomUUID(),
      type: 'fate-points',
      current: 3,
      refresh: 3
    }
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
    {
      id: crypto.randomUUID(),
      type: 'high-concept',
      text: ''
    },
    {
      id: crypto.randomUUID(),
      type: 'trouble',
      text: ''
    },
    {
      id: crypto.randomUUID(),
      type: 'aspects',
      items: ['']
    },
    {
      id: crypto.randomUUID(),
      type: 'skills',
      items: []
    },
    {
      id: crypto.randomUUID(),
      type: 'stress-tracks',
      tracks: [
        { 
          name: 'Physical Stress', 
          boxes: [
            { checked: false, value: 1 },
            { checked: false, value: 2 },
            { checked: false, value: 3 },
            { checked: false, value: 4 }
          ]
        },
        { 
          name: 'Mental Stress', 
          boxes: [
            { checked: false, value: 1 },
            { checked: false, value: 2 },
            { checked: false, value: 3 },
            { checked: false, value: 4 }
          ]
        }
      ]
    },
    {
      id: crypto.randomUUID(),
      type: 'consequences',
      items: [
        { label: 'Mild (2)', text: '---' },
        { label: 'Moderate (4)', text: '---' },
        { label: 'Severe (6)', text: '---' }
      ]
    }
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
    {
      id: crypto.randomUUID(),
      type: 'high-concept',
      text: ''
    },
    {
      id: crypto.randomUUID(),
      type: 'aspects',
      items: ['', '']
    },
    {
      id: crypto.randomUUID(),
      type: 'note',
      text: ''
    }
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