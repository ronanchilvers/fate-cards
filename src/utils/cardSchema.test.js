import { describe, it, expect } from 'vitest'
import { normalizeCard, normalizeCards } from './cardSchema'
import { ELEMENT_TYPES } from '../constants'

describe('normalizeCard', () => {
  it('returns a normalized card when given a valid card object', () => {
    const input = {
      id: 'test-id',
      title: 'Test Card',
      elements: [],
      category: 'PCs',
      color: '#ff0000',
      layout: 'auto'
    }
    const result = normalizeCard(input)
    expect(result).toMatchObject(input)
  })

  it('preserves all valid fields from input', () => {
    const input = {
      id: 'my-id',
      title: 'My Title',
      subtitle: 'My Subtitle',
      elements: [{ id: '1', type: 'note' }],
      category: 'NPCs',
      color: '#123456',
      layout: '2-column',
      locked: true
    }
    const result = normalizeCard(input)
    expect(result.id).toBe('my-id')
    expect(result.title).toBe('My Title')
    expect(result.subtitle).toBe('My Subtitle')
    expect(result.locked).toBe(true)
  })
})

describe('normalizeCard - default values', () => {
  it('returns null for non-object input', () => {
    expect(normalizeCard(null)).toBeNull()
    expect(normalizeCard(undefined)).toBeNull()
    expect(normalizeCard('string')).toBeNull()
    expect(normalizeCard(123)).toBeNull()
    expect(normalizeCard([])).toBeNull()
  })

  it('generates UUID when id is missing', () => {
    const result = normalizeCard({})
    expect(result.id).toBeDefined()
    expect(typeof result.id).toBe('string')
  })

  it('defaults title to "Untitled" when missing or empty', () => {
    expect(normalizeCard({}).title).toBe('Untitled')
    expect(normalizeCard({ title: '' }).title).toBe('Untitled')
    expect(normalizeCard({ title: '   ' }).title).toBe('Untitled')
  })

  it('defaults subtitle to empty string', () => {
    expect(normalizeCard({}).subtitle).toBe('')
  })

  it('defaults elements to empty array', () => {
    expect(normalizeCard({}).elements).toEqual([])
    expect(normalizeCard({ elements: 'not-array' }).elements).toEqual([])
  })

  it('defaults category to "PCs"', () => {
    expect(normalizeCard({}).category).toBe('PCs')
    expect(normalizeCard({ category: '' }).category).toBe('PCs')
  })

  it('defaults color to "#1f2937" for invalid colors', () => {
    expect(normalizeCard({}).color).toBe('#1f2937')
    expect(normalizeCard({ color: 'red' }).color).toBe('#1f2937')
    expect(normalizeCard({ color: '#fff' }).color).toBe('#1f2937')
    expect(normalizeCard({ color: '#gggggg' }).color).toBe('#1f2937')
  })

  it('defaults layout to "auto" for invalid layouts', () => {
    expect(normalizeCard({}).layout).toBe('auto')
    expect(normalizeCard({ layout: 'invalid' }).layout).toBe('auto')
  })

  it('accepts valid layout values', () => {
    expect(normalizeCard({ layout: 'auto' }).layout).toBe('auto')
    expect(normalizeCard({ layout: 'single-column' }).layout).toBe('single-column')
    expect(normalizeCard({ layout: '2-column' }).layout).toBe('2-column')
  })

  it('defaults locked to false', () => {
    expect(normalizeCard({}).locked).toBe(false)
    expect(normalizeCard({ locked: 'yes' }).locked).toBe(false)
  })
})

describe('normalizeCard - element normalization', () => {
  it('drops elements with unknown types', () => {
    const input = {
      id: 'test-id',
      title: 'Test Card',
      elements: [
        { id: 'note-1', type: ELEMENT_TYPES.NOTE, text: 'Keep me' },
        { id: 'unknown-1', type: 'mystery-type', payload: 'nope' }
      ]
    }

    const result = normalizeCard(input)
    expect(result.elements).toHaveLength(1)
    expect(result.elements[0].type).toBe(ELEMENT_TYPES.NOTE)
  })

  it('normalizes note elements to ensure text is present', () => {
    const input = {
      id: 'note-card',
      elements: [
        { id: 'note-1', type: ELEMENT_TYPES.NOTE }
      ]
    }

    const result = normalizeCard(input)
    expect(result.elements[0].text).toBe('')
  })

  it('normalizes skills elements to ensure items is an array', () => {
    const input = {
      id: 'skills-card',
      elements: [
        { id: 'skills-1', type: ELEMENT_TYPES.SKILLS, items: 'not-an-array' }
      ]
    }

    const result = normalizeCard(input)
    expect(result.elements[0].items).toEqual([])
  })

  it('normalizes stress tracks to ensure tracks contain boxes', () => {
    const input = {
      id: 'stress-card',
      elements: [
        { 
          id: 'stress-1', 
          type: ELEMENT_TYPES.STRESS_TRACKS, 
          tracks: [
            { name: 'Physical', boxes: null },
            { name: 'Mental' }
          ] 
        }
      ]
    }

    const result = normalizeCard(input)
    const tracks = result.elements[0].tracks
    expect(Array.isArray(tracks)).toBe(true)
    tracks.forEach(track => {
      expect(Array.isArray(track.boxes)).toBe(true)
      expect(track.boxes.length).toBeGreaterThan(0)
      track.boxes.forEach(box => {
        expect(typeof box.checked).toBe('boolean')
        expect(typeof box.value).toBe('number')
      })
    })
  })
})

describe('normalizeCards', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeCards(null)).toEqual([])
    expect(normalizeCards(undefined)).toEqual([])
    expect(normalizeCards('string')).toEqual([])
    expect(normalizeCards({})).toEqual([])
  })

  it('normalizes all valid cards in array', () => {
    const input = [
      { id: '1', title: 'Card 1' },
      { id: '2', title: 'Card 2' }
    ]
    const result = normalizeCards(input)
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('Card 1')
    expect(result[1].title).toBe('Card 2')
  })

  it('filters out invalid cards', () => {
    const input = [
      { id: '1', title: 'Valid' },
      null,
      'string',
      { id: '2', title: 'Also Valid' }
    ]
    const result = normalizeCards(input)
    expect(result).toHaveLength(2)
  })

  it('returns empty array when all cards are invalid', () => {
    const input = [null, undefined, 'string', 123]
    const result = normalizeCards(input)
    expect(result).toEqual([])
  })

  it('handles cards with mixed valid and invalid elements without throwing', () => {
    const input = [
      {
        id: 'mixed-elements',
        elements: [
          { id: 'note-1', type: ELEMENT_TYPES.NOTE, text: 'Ok' },
          { id: 'unknown-1', type: 'unknown-type' },
          null
        ]
      }
    ]

    expect(() => normalizeCards(input)).not.toThrow()
    const result = normalizeCards(input)
    expect(result[0].elements).toHaveLength(1)
    expect(result[0].elements[0].type).toBe(ELEMENT_TYPES.NOTE)
  })
})
