import { describe, it, expect } from 'vitest'
import { normalizeCards } from '../utils/cardSchema'

describe('Import Data Validation', () => {
  it('handles valid import data structure', () => {
    const importData = {
      cards: [
        { id: '1', title: 'Card 1', category: 'PCs', color: '#ff0000' },
        { id: '2', title: 'Card 2', category: 'NPCs', color: '#0000ff' }
      ],
      categories: ['PCs', 'NPCs', 'Scenes'],
      skills: ['Fight', 'Shoot'],
      skillLevels: [{ label: 'Good', value: 3 }]
    }

    const validCards = normalizeCards(importData.cards)
    expect(validCards).toHaveLength(2)
  })

  it('filters invalid cards from import', () => {
    const importData = {
      cards: [
        { id: '1', title: 'Valid Card' },
        null,
        'not a card',
        { id: '2', title: 'Another Valid' }
      ]
    }

    const validCards = normalizeCards(importData.cards)
    expect(validCards).toHaveLength(2)
  })

  it('normalizes cards with missing fields', () => {
    const importData = {
      cards: [
        { title: 'No ID Card' },
        { id: '1' },
        {}
      ]
    }

    const validCards = normalizeCards(importData.cards)
    expect(validCards).toHaveLength(3)
    expect(validCards[0].id).toBeDefined()
    expect(validCards[1].title).toBe('Untitled')
    expect(validCards[2].category).toBe('PCs')
  })

  it('handles empty import data', () => {
    expect(normalizeCards([])).toEqual([])
    expect(normalizeCards(null)).toEqual([])
    expect(normalizeCards(undefined)).toEqual([])
  })
})

describe('Import Categories Validation', () => {
  it('validates category array structure', () => {
    const validCategories = ['PCs', 'NPCs', 'Custom']
      .filter(cat => typeof cat === 'string' && cat.trim().length > 0)
    
    expect(validCategories).toHaveLength(3)
  })

  it('filters invalid category entries', () => {
    const categories = ['Valid', '', null, 'Also Valid', 123, '   ']
      .filter(cat => typeof cat === 'string' && cat.trim().length > 0)
    
    expect(categories).toHaveLength(2)
  })
})

describe('Import Skill Levels Validation', () => {
  it('validates skill level structure', () => {
    const levels = [
      { label: 'Good', value: 3 },
      { label: 'Fair', value: 2 },
      { label: '', value: 1 },
      { label: 'Bad', value: 'not a number' },
      null
    ]

    const validLevels = levels.filter(level =>
      level &&
      typeof level === 'object' &&
      typeof level.label === 'string' &&
      level.label.trim().length > 0 &&
      typeof level.value === 'number' &&
      !isNaN(level.value)
    )

    expect(validLevels).toHaveLength(2)
  })
})