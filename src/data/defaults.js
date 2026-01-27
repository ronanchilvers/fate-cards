/**
 * Default Data Constants
 *
 * This module contains all default data used for initialization and reset operations.
 * Centralizing defaults makes them easier to modify and maintain.
 */

/**
 * Default categories for organizing cards
 */
export const defaultCategories = ['PCs', 'NPCs', 'Scenes']

/**
 * Default skills list for Fate Core
 */
export const defaultSkills = [
  'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive', 'Drive',
  'Empathy', 'Fight', 'Investigate', 'Lore', 'Notice', 'Physique',
  'Provoke', 'Rapport', 'Resources', 'Shoot', 'Stealth', 'Will'
]

/**
 * Default skill levels for Fate Core ladder
 */
export const defaultSkillLevels = [
  { label: 'Legendary', value: 8 },
  { label: 'Epic', value: 7 },
  { label: 'Fantastic', value: 6 },
  { label: 'Superb', value: 5 },
  { label: 'Great', value: 4 },
  { label: 'Good', value: 3 },
  { label: 'Fair', value: 2 },
  { label: 'Average', value: 1 },
  { label: 'Mediocre', value: 0 },
  { label: 'Poor', value: -1 },
  { label: 'Terrible', value: -2 },
  { label: 'Catastrophic', value: -3 },
  { label: 'Horrifying', value: -4 }
]

/**
 * Default sample card - "Darv" character
 * Used when the app first loads and no saved cards exist
 */
export const defaultSampleCard = {
  id: '1',
  category: 'PCs',
  color: '#c53030',
  title: 'Darv',
  subtitle: 'Crew member on the survey ship Challenger',
  layout: 'auto',
  elements: [
    {
      id: '1-1',
      type: 'high-concept',
      text: 'Insatiably curious explorer with a flair for electronics'
    },
    {
      id: '1-2',
      type: 'trouble',
      text: 'I always have to see for myself'
    },
    {
      id: '1-3',
      type: 'aspects',
      items: ['Excellent Lateral Thinker', 'I Notice What Others Miss', 'Good Pilot']
    },
    {
      id: '1-4',
      type: 'skills',
      items: [
        { name: 'Notice', rating: 4 },
        { name: 'Investigate', rating: 3 },
        { name: 'Crafts', rating: 3 },
        { name: 'Physique', rating: 2 },
        { name: 'Will', rating: 2 },
        { name: 'Lore', rating: 2 },
        { name: 'Deceive', rating: 1 },
        { name: 'Shoot', rating: 1 },
        { name: 'Rapport', rating: 1 },
        { name: 'Resources', rating: 1 }
      ]
    },
    {
      id: '1-5',
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
      id: '1-6',
      type: 'consequences',
      items: [
        { label: 'Mild (2)', text: '---' },
        { label: 'Moderate (4)', text: '---' },
        { label: 'Severe (6)', text: '---' }
      ]
    },
    {
      id: '1-7',
      type: 'fate-points',
      current: 3,
      refresh: 3
    }
  ]
}
