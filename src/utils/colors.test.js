import { describe, it, expect } from 'vitest'
import { getPaleBackground, getMidToneBackground, getCategoryColor } from './colors'

describe('getPaleBackground', () => {
  it('returns pale version of red', () => {
    const result = getPaleBackground('#ff0000')
    expect(result).toBe('rgb(255, 230, 230)')
  })

  it('returns pale version of blue', () => {
    const result = getPaleBackground('#0000ff')
    expect(result).toBe('rgb(230, 230, 255)')
  })

  it('returns near-white for black input', () => {
    const result = getPaleBackground('#000000')
    expect(result).toBe('rgb(230, 230, 230)')
  })
})

describe('getMidToneBackground', () => {
  it('returns mid-tone version of red', () => {
    const result = getMidToneBackground('#ff0000')
    expect(result).toBe('rgb(255, 128, 128)')
  })

  it('returns mid-tone version of blue', () => {
    const result = getMidToneBackground('#0000ff')
    expect(result).toBe('rgb(128, 128, 255)')
  })
})

describe('getCategoryColor', () => {
  it('returns default color when category is in defaults', () => {
    const defaults = { 'PCs': '#c53030', 'NPCs': '#2c5282' }
    expect(getCategoryColor('PCs', defaults)).toBe('#c53030')
    expect(getCategoryColor('NPCs', defaults)).toBe('#2c5282')
  })

  it('generates consistent HSL for unknown categories', () => {
    const color1 = getCategoryColor('Custom Category')
    const color2 = getCategoryColor('Custom Category')
    expect(color1).toBe(color2)
    expect(color1).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
  })

  it('generates different colors for different categories', () => {
    const color1 = getCategoryColor('Category A')
    const color2 = getCategoryColor('Category B')
    expect(color1).not.toBe(color2)
  })
})