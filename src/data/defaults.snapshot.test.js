import { describe, it, expect } from 'vitest'
import {
  defaultCategories,
  defaultSkills,
  defaultSkillLevels,
  defaultSampleCard
} from './defaults'

describe('Default Data Snapshots', () => {
  it('defaultCategories matches snapshot', () => {
    expect(defaultCategories).toMatchSnapshot()
  })

  it('defaultSkills matches snapshot', () => {
    expect(defaultSkills).toMatchSnapshot()
  })

  it('defaultSkillLevels matches snapshot', () => {
    expect(defaultSkillLevels).toMatchSnapshot()
  })

  it('defaultSampleCard structure matches snapshot', () => {
    // Test structure without IDs which may vary
    const structure = {
      ...defaultSampleCard,
      elements: defaultSampleCard.elements.map(e => ({
        type: e.type,
        // Omit id and content for stable snapshot
      }))
    }
    expect(structure).toMatchSnapshot()
  })
})