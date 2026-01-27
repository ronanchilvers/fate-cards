import { describe, it, expect } from 'vitest'
import {
  defaultCategories,
  defaultSkills,
  defaultSkillLevels,
  defaultSampleCard
} from './defaults'

describe('defaultCategories', () => {
  it('is an array with expected categories', () => {
    expect(Array.isArray(defaultCategories)).toBe(true)
    expect(defaultCategories).toContain('PCs')
    expect(defaultCategories).toContain('NPCs')
    expect(defaultCategories).toContain('Scenes')
  })

  it('contains only non-empty strings', () => {
    defaultCategories.forEach(cat => {
      expect(typeof cat).toBe('string')
      expect(cat.trim().length).toBeGreaterThan(0)
    })
  })
})

describe('defaultSkills', () => {
  it('is an array of strings', () => {
    expect(Array.isArray(defaultSkills)).toBe(true)
    expect(defaultSkills.length).toBeGreaterThan(0)
    defaultSkills.forEach(skill => {
      expect(typeof skill).toBe('string')
    })
  })

  it('contains expected Fate Core skills', () => {
    expect(defaultSkills).toContain('Athletics')
    expect(defaultSkills).toContain('Fight')
    expect(defaultSkills).toContain('Will')
  })
})

describe('defaultSkillLevels', () => {
  it('is an array of objects with label and value', () => {
    expect(Array.isArray(defaultSkillLevels)).toBe(true)
    defaultSkillLevels.forEach(level => {
      expect(typeof level.label).toBe('string')
      expect(typeof level.value).toBe('number')
    })
  })

  it('is sorted by value descending', () => {
    for (let i = 1; i < defaultSkillLevels.length; i++) {
      expect(defaultSkillLevels[i - 1].value).toBeGreaterThan(defaultSkillLevels[i].value)
    }
  })

  it('contains expected levels', () => {
    const labels = defaultSkillLevels.map(l => l.label)
    expect(labels).toContain('Legendary')
    expect(labels).toContain('Average')
    expect(labels).toContain('Terrible')
  })
})

describe('defaultSampleCard', () => {
  it('has required card properties', () => {
    expect(defaultSampleCard.id).toBeDefined()
    expect(defaultSampleCard.title).toBe('Darv')
    expect(defaultSampleCard.category).toBe('PCs')
    expect(typeof defaultSampleCard.color).toBe('string')
    expect(Array.isArray(defaultSampleCard.elements)).toBe(true)
  })

  it('has valid element structure', () => {
    defaultSampleCard.elements.forEach(element => {
      expect(element.id).toBeDefined()
      expect(element.type).toBeDefined()
    })
  })
})