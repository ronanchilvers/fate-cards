import { describe, it, expect } from 'vitest'
import {
  standardPC,
  quickNPC,
  scene,
  blank,
  cardTemplates
} from './cardTemplates'

describe('standardPC template', () => {
  it('returns a new object each time (factory pattern)', () => {
    const card1 = standardPC()
    const card2 = standardPC()
    expect(card1).not.toBe(card2)
    expect(card1.elements[0].id).not.toBe(card2.elements[0].id)
  })

  it('has correct structure', () => {
    const card = standardPC()
    expect(card.title).toBe('New Character')
    expect(card.subtitle).toBe('Player Character')
    expect(Array.isArray(card.elements)).toBe(true)
  })

  it('includes all standard PC elements', () => {
    const card = standardPC()
    const types = card.elements.map(e => e.type)
    expect(types).toContain('high-concept')
    expect(types).toContain('trouble')
    expect(types).toContain('aspects')
    expect(types).toContain('skills')
    expect(types).toContain('stress-tracks')
    expect(types).toContain('consequences')
    expect(types).toContain('fate-points')
  })
})

describe('quickNPC template', () => {
  it('returns object with NPC structure', () => {
    const card = quickNPC()
    expect(card.title).toBe('New NPC')
    expect(card.elements.length).toBeGreaterThan(0)
  })

  it('does not include fate-points element', () => {
    const card = quickNPC()
    const types = card.elements.map(e => e.type)
    expect(types).not.toContain('fate-points')
  })
})

describe('scene template', () => {
  it('returns object with scene structure', () => {
    const card = scene()
    expect(card.title).toBe('New Scene')
    expect(card.subtitle).toBe('Location or Situation')
  })

  it('includes note element', () => {
    const card = scene()
    const types = card.elements.map(e => e.type)
    expect(types).toContain('note')
  })
})

describe('blank template', () => {
  it('returns empty card structure', () => {
    const card = blank()
    expect(card.title).toBe('New Card')
    expect(card.subtitle).toBe('')
    expect(card.elements).toEqual([])
  })
})

describe('cardTemplates lookup', () => {
  it('maps all template keys to factory functions', () => {
    expect(typeof cardTemplates['standard-pc']).toBe('function')
    expect(typeof cardTemplates['quick-npc']).toBe('function')
    expect(typeof cardTemplates['scene']).toBe('function')
    expect(typeof cardTemplates['blank']).toBe('function')
  })

  it('returns correct templates from lookup', () => {
    expect(cardTemplates['standard-pc']().title).toBe('New Character')
    expect(cardTemplates['quick-npc']().title).toBe('New NPC')
    expect(cardTemplates['scene']().title).toBe('New Scene')
    expect(cardTemplates['blank']().title).toBe('New Card')
  })
})