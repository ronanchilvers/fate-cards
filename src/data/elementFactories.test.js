import { describe, it, expect } from 'vitest'
import {
  createHighConceptElement,
  createTroubleElement,
  createAspectsElement,
  createSkillsElement,
  createInventoryElement,
  createStressTracksElement,
  createConsequencesElement,
  createNoteElement,
  createFatePointsElement,
  createGameToolsElement,
  createElementByType
} from './elementFactories'
import { ELEMENT_TYPES } from '../constants'

describe('elementFactories', () => {
  it('creates high concept element with defaults', () => {
    const element = createHighConceptElement()
    expect(element).toMatchObject({
      type: ELEMENT_TYPES.HIGH_CONCEPT,
      text: ''
    })
    expect(typeof element.id).toBe('string')
  })

  it('creates trouble element with defaults', () => {
    const element = createTroubleElement()
    expect(element).toMatchObject({
      type: ELEMENT_TYPES.TROUBLE,
      text: ''
    })
    expect(typeof element.id).toBe('string')
  })

  it('creates aspects element with default count', () => {
    const element = createAspectsElement()
    expect(element.type).toBe(ELEMENT_TYPES.ASPECTS)
    expect(element.items).toHaveLength(3)
    expect(element.items.every(item => item === '')).toBe(true)
  })

  it('creates aspects element with custom count', () => {
    const element = createAspectsElement(5)
    expect(element.items).toHaveLength(5)
  })

  it('creates skills element with provided items', () => {
    const items = [{ name: 'Athletics', rating: 2 }]
    const element = createSkillsElement(items)
    expect(element.type).toBe(ELEMENT_TYPES.SKILLS)
    expect(element.items).toEqual(items)
    expect(element.items).not.toBe(items)
  })

  it('creates inventory element with default item', () => {
    const element = createInventoryElement()
    expect(element.type).toBe(ELEMENT_TYPES.INVENTORY)
    expect(element.items).toHaveLength(1)
    expect(typeof element.items[0].id).toBe('string')
    expect(element.items[0].name).toBe('')
  })

  it('creates inventory element with provided items', () => {
    const items = [{ id: 'item-1', name: 'Rope' }]
    const element = createInventoryElement(items)
    expect(element.items).toEqual(items)
  })

  it('creates stress tracks element with defaults', () => {
    const element = createStressTracksElement()
    expect(element.type).toBe(ELEMENT_TYPES.STRESS_TRACKS)
    expect(element.tracks).toHaveLength(2)
    element.tracks.forEach(track => {
      expect(track.name).toBeTypeOf('string')
      expect(track.boxes).toHaveLength(3)
      track.boxes.forEach(box => {
        expect(box).toEqual(expect.objectContaining({ checked: false, value: 1 }))
      })
    })
  })

  it('creates stress tracks element with custom tracks', () => {
    const tracks = [{ name: 'Custom', boxes: [{ checked: false, value: 1 }] }]
    const element = createStressTracksElement(tracks)
    expect(element.tracks).toEqual(tracks)
  })

  it('creates consequences element with defaults', () => {
    const element = createConsequencesElement()
    expect(element.type).toBe(ELEMENT_TYPES.CONSEQUENCES)
    expect(element.items).toEqual([
      { label: 'Mild (2)', text: '---' },
      { label: 'Moderate (4)', text: '---' },
      { label: 'Severe (6)', text: '---' }
    ])
  })

  it('creates consequences element with custom items', () => {
    const items = [{ label: 'Custom', text: 'Custom text' }]
    const element = createConsequencesElement(items)
    expect(element.items).toEqual(items)
  })

  it('creates note element with default text', () => {
    const element = createNoteElement()
    expect(element.type).toBe(ELEMENT_TYPES.NOTE)
    expect(element.text).toBe('')
  })

  it('creates note element with provided text', () => {
    const element = createNoteElement('Hello')
    expect(element.text).toBe('Hello')
  })

  it('creates fate points element with defaults', () => {
    const element = createFatePointsElement()
    expect(element.type).toBe(ELEMENT_TYPES.FATE_POINTS)
    expect(element.current).toBe(3)
    expect(element.refresh).toBe(3)
  })

  it('creates fate points element with custom values', () => {
    const element = createFatePointsElement(1, 5)
    expect(element.current).toBe(1)
    expect(element.refresh).toBe(5)
  })

  it('creates game tools element with defaults', () => {
    const element = createGameToolsElement()
    expect(element.type).toBe(ELEMENT_TYPES.GAME_TOOLS)
    expect(element.dice).toEqual([])
  })

  it('creates elements by type', () => {
    const mapping = [
      ELEMENT_TYPES.HIGH_CONCEPT,
      ELEMENT_TYPES.TROUBLE,
      ELEMENT_TYPES.ASPECTS,
      ELEMENT_TYPES.SKILLS,
      ELEMENT_TYPES.INVENTORY,
      ELEMENT_TYPES.STRESS_TRACKS,
      ELEMENT_TYPES.CONSEQUENCES,
      ELEMENT_TYPES.NOTE,
      ELEMENT_TYPES.FATE_POINTS,
      ELEMENT_TYPES.GAME_TOOLS
    ]

    mapping.forEach(type => {
      const element = createElementByType(type)
      expect(element.type).toBe(type)
      expect(typeof element.id).toBe('string')
    })
  })

  it('falls back to note element for unknown type', () => {
    const element = createElementByType('unknown-type')
    expect(element.type).toBe(ELEMENT_TYPES.NOTE)
  })

  it('generates unique ids per call', () => {
    const first = createNoteElement()
    const second = createNoteElement()
    expect(first.id).not.toBe(second.id)
  })
})