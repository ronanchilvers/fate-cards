import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useLocalStorage, useLocalStorageRemove } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('should load existing value from localStorage on mount', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    // Value should be loaded immediately via lazy initialization
    expect(result.current[0]).toBe('stored-value')
  })

  it('should save value to localStorage when updated', async () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('new-value')
    })

    // Wait for the effect to persist to localStorage
    await waitFor(() => {
      const stored = localStorage.getItem('test-key')
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored)).toBe('new-value')
    })
    
    expect(result.current[0]).toBe('new-value')
  })

  it('should return isLoaded as true after initialization', async () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    await waitFor(() => {
      expect(result.current[2]).toBe(true)
    })
  })

  it('should handle non-serialized strings', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => 
      useLocalStorage('theme', 'light', { serialize: false })
    )
    expect(result.current[0]).toBe('dark')
  })

  it('should handle complex objects', async () => {
    const initialValue = { cards: [], settings: { theme: 'light' } }
    const { result } = renderHook(() => useLocalStorage('data', initialValue))
    
    const newValue = { cards: [{ id: '1' }], settings: { theme: 'dark' } }
    act(() => {
      result.current[1](newValue)
    })

    expect(result.current[0]).toEqual(newValue)
    
    await waitFor(() => {
      const stored = localStorage.getItem('data')
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored)).toEqual(newValue)
    })
  })

  it('should handle functional updates', async () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0))
    
    act(() => {
      result.current[1](prev => prev + 1)
    })

    expect(result.current[0]).toBe(1)
    
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('counter'))).toBe(1)
    })
  })

  it('should preserve existing localStorage value on mount', () => {
    localStorage.setItem('existing', JSON.stringify('preserved'))
    const { result } = renderHook(() => useLocalStorage('existing', 'default'))
    
    expect(result.current[0]).toBe('preserved')
  })

  it('should handle null values correctly', () => {
    const { result } = renderHook(() => useLocalStorage('nullable', null))
    expect(result.current[0]).toBeNull()
  })

  it('should not overwrite localStorage on mount with initial value', async () => {
    localStorage.setItem('protected', JSON.stringify('original'))
    const { result } = renderHook(() => useLocalStorage('protected', 'default'))
    
    expect(result.current[0]).toBe('original')
    
    // After isLoaded becomes true, value should still be original
    await waitFor(() => {
      expect(result.current[2]).toBe(true)
    })
    
    expect(JSON.parse(localStorage.getItem('protected'))).toBe('original')
  })
})

describe('useLocalStorageRemove', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return a function that removes the key', () => {
    localStorage.setItem('test-key', 'value')
    const { result } = renderHook(() => useLocalStorageRemove('test-key'))
    
    expect(localStorage.getItem('test-key')).toBe('value')
    
    act(() => {
      result.current()
    })
    
    expect(localStorage.getItem('test-key')).toBeNull()
  })

  it('should be stable across renders', () => {
    const { result, rerender } = renderHook(() => useLocalStorageRemove('test-key'))
    const firstFn = result.current
    
    rerender()
    
    expect(result.current).toBe(firstFn)
  })

  it('should handle removing non-existent keys', () => {
    const { result } = renderHook(() => useLocalStorageRemove('non-existent'))
    
    // Should not throw
    expect(() => {
      act(() => {
        result.current()
      })
    }).not.toThrow()
    
    expect(localStorage.getItem('non-existent')).toBeNull()
  })
})