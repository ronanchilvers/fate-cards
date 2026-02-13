import { describe, it, expect } from 'vitest'
import { getPaleBackground, getMidToneBackground, getCategoryColor, normalizeColorToHex } from './colors'

const rgbRegex = /^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/
const hexRegex = /^#[0-9a-f]{6}$/i

const parseRgb = (value) => {
  const match = rgbRegex.exec(value)
  if (!match) return null
  return match.slice(1).map(Number)
}

describe('normalizeColorToHex', () => {
  it('returns lowercase hex for hex input', () => {
    expect(normalizeColorToHex('#AABBCC')).toBe('#aabbcc')
  })

  it('converts HSL to hex', () => {
    expect(normalizeColorToHex('hsl(0, 100%, 50%)')).toBe('#ff0000')
  })

  it('returns null for invalid input', () => {
    expect(normalizeColorToHex(null)).toBeNull()
    expect(normalizeColorToHex(123)).toBeNull()
    expect(normalizeColorToHex('red')).toBeNull()
    expect(normalizeColorToHex('#fff')).toBeNull()
    expect(normalizeColorToHex('#gggggg')).toBeNull()
  })

  it('handles edge HSL values', () => {
    expect(normalizeColorToHex('hsl(360, 100%, 50%)')).toBe('#ff0000')
    expect(normalizeColorToHex('hsl(0, 0%, 50%)')).toBe('#808080')
  })
})

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

  it('accepts HSL input', () => {
    const result = getPaleBackground('hsl(0, 100%, 50%)')
    expect(result).toBe('rgb(255, 230, 230)')
  })

  it('falls back to default color on invalid input', () => {
    const result = getPaleBackground('not-a-color')
    expect(result).toBe('rgb(233, 234, 235)')
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

  it('accepts HSL input', () => {
    const result = getMidToneBackground('hsl(0, 100%, 50%)')
    expect(result).toBe('rgb(255, 128, 128)')
  })

  it('falls back to default color on invalid input', () => {
    const result = getMidToneBackground('not-a-color')
    expect(result).toBe('rgb(143, 148, 155)')
  })
})

describe('getCategoryColor', () => {
  it('returns default color when category is in defaults', () => {
    const defaults = { 'PCs': '#c53030', 'NPCs': '#2c5282' }
    expect(getCategoryColor('PCs', defaults)).toBe('#c53030')
    expect(getCategoryColor('NPCs', defaults)).toBe('#2c5282')
  })

  it('generates consistent hex for unknown categories', () => {
    const color1 = getCategoryColor('Custom Category')
    const color2 = getCategoryColor('Custom Category')
    expect(color1).toBe(color2)
    expect(color1).toMatch(hexRegex)
  })

  it('generates different colors for different categories', () => {
    const color1 = getCategoryColor('Category A')
    const color2 = getCategoryColor('Category B')
    expect(color1).not.toBe(color2)
    expect(color1).toMatch(hexRegex)
    expect(color2).toMatch(hexRegex)
  })

  it('returns background colors for custom categories', () => {
    const customColor = getCategoryColor('Custom Category')
    const paleBackground = getPaleBackground(customColor)
    const midToneBackground = getMidToneBackground(customColor)

    expect(paleBackground).toMatch(rgbRegex)
    expect(midToneBackground).toMatch(rgbRegex)

    const paleChannels = parseRgb(paleBackground)
    const midChannels = parseRgb(midToneBackground)

    paleChannels.forEach(channel => {
      expect(channel).toBeGreaterThanOrEqual(0)
      expect(channel).toBeLessThanOrEqual(255)
    })

    midChannels.forEach(channel => {
      expect(channel).toBeGreaterThanOrEqual(0)
      expect(channel).toBeLessThanOrEqual(255)
    })
  })
})
