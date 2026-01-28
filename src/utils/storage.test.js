import { describe, it, expect, vi, beforeEach } from 'vitest'
import { safeGetJSON, safeSetJSON } from './storage'

describe('safeGetJSON', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns parsed JSON when key exists', () => {
    const testData = { foo: 'bar', count: 42 }
    localStorage.setItem('test-key', JSON.stringify(testData))
    
    const result = safeGetJSON('test-key')
    expect(result).toEqual(testData)
  })

  it('returns fallback when key does not exist', () => {
    expect(safeGetJSON('missing-key')).toBeNull()
    expect(safeGetJSON('missing-key', [])).toEqual([])
    expect(safeGetJSON('missing-key', { default: true })).toEqual({ default: true })
  })

  it('returns fallback and clears key on parse error', () => {
    localStorage.setItem('corrupt-key', 'invalid json {{{')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const result = safeGetJSON('corrupt-key', 'fallback')
    
    expect(result).toBe('fallback')
    expect(localStorage.getItem('corrupt-key')).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})

describe('safeSetJSON', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stringifies and saves value to localStorage', () => {
    const testData = { cards: [1, 2, 3] }
    
    const result = safeSetJSON('test-key', testData)
    
    expect(result).toBe(true)
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify(testData))
  })

  it('returns true on successful save', () => {
    expect(safeSetJSON('key', 'value')).toBe(true)
    expect(localStorage.getItem('key')).toBe(JSON.stringify('value'))
  })

  it('returns false and logs error on failure', () => {
    // Override setItem to throw an error
    const originalSetItem = localStorage.setItem
    localStorage.setItem = vi.fn(() => {
      throw new Error('QuotaExceeded')
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const result = safeSetJSON('key', 'value')
    
    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
    localStorage.setItem = originalSetItem
  })
})