import { describe, it, expect, vi, beforeEach } from 'vitest'
import { safeGetJSON, safeSetJSON } from './storage'

describe('safeGetJSON', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem.mockReturnValue(null)
  })

  it('returns parsed JSON when key exists', () => {
    const testData = { foo: 'bar', count: 42 }
    localStorage.getItem.mockReturnValue(JSON.stringify(testData))
    
    const result = safeGetJSON('test-key')
    expect(result).toEqual(testData)
    expect(localStorage.getItem).toHaveBeenCalledWith('test-key')
  })

  it('returns fallback when key does not exist', () => {
    localStorage.getItem.mockReturnValue(null)
    
    expect(safeGetJSON('missing-key')).toBeNull()
    expect(safeGetJSON('missing-key', [])).toEqual([])
    expect(safeGetJSON('missing-key', { default: true })).toEqual({ default: true })
  })

  it('returns fallback and clears key on parse error', () => {
    localStorage.getItem.mockReturnValue('invalid json {{{')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const result = safeGetJSON('corrupt-key', 'fallback')
    
    expect(result).toBe('fallback')
    expect(localStorage.removeItem).toHaveBeenCalledWith('corrupt-key')
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})

describe('safeSetJSON', () => {
  it('stringifies and saves value to localStorage', () => {
    const testData = { cards: [1, 2, 3] }
    
    const result = safeSetJSON('test-key', testData)
    
    expect(result).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify(testData)
    )
  })

  it('returns true on successful save', () => {
    expect(safeSetJSON('key', 'value')).toBe(true)
  })

  it('returns false and logs error on failure', () => {
    localStorage.setItem.mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const result = safeSetJSON('key', 'value')
    
    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})