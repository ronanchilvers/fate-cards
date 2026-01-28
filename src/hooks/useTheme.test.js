import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTheme } from './useTheme'
import { THEME_MODES, STORAGE_KEYS } from '../constants'

describe('useTheme', () => {
  let mockMediaQuery

  beforeEach(() => {
    localStorage.clear()
    
    // Mock matchMedia with controllable state
    mockMediaQuery = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => mockMediaQuery),
    })
  })

  it('should initialize with AUTO theme mode', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.themeMode).toBe(THEME_MODES.AUTO)
  })

  it('should load saved theme mode from localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, THEME_MODES.DARK)
    const { result } = renderHook(() => useTheme())
    expect(result.current.themeMode).toBe(THEME_MODES.DARK)
  })

  it('should ignore invalid saved theme mode', () => {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, 'invalid-mode')
    const { result } = renderHook(() => useTheme())
    expect(result.current.themeMode).toBe(THEME_MODES.AUTO)
  })

  it('should cycle through theme modes correctly', () => {
    const { result } = renderHook(() => useTheme())
    
    // Start at AUTO (default), cycle to LIGHT
    act(() => {
      result.current.cycleThemeMode()
    })
    expect(result.current.themeMode).toBe(THEME_MODES.LIGHT)

    // Cycle to DARK
    act(() => {
      result.current.cycleThemeMode()
    })
    expect(result.current.themeMode).toBe(THEME_MODES.DARK)

    // Cycle back to AUTO
    act(() => {
      result.current.cycleThemeMode()
    })
    expect(result.current.themeMode).toBe(THEME_MODES.AUTO)
  })

  it('should return correct icon for each theme mode', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setThemeMode(THEME_MODES.LIGHT)
    })
    expect(result.current.getThemeIcon()).toBe('☀️')

    act(() => {
      result.current.setThemeMode(THEME_MODES.DARK)
    })
    expect(result.current.getThemeIcon()).toBe('🌙')

    act(() => {
      result.current.setThemeMode(THEME_MODES.AUTO)
    })
    expect(result.current.getThemeIcon()).toBe('🌓')
  })

  it('should return correct title for each theme mode', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setThemeMode(THEME_MODES.LIGHT)
    })
    expect(result.current.getThemeTitle()).toBe('Light Mode (click for Dark)')

    act(() => {
      result.current.setThemeMode(THEME_MODES.DARK)
    })
    expect(result.current.getThemeTitle()).toBe('Dark Mode (click for Auto)')

    act(() => {
      result.current.setThemeMode(THEME_MODES.AUTO)
    })
    expect(result.current.getThemeTitle()).toBe('Auto Mode (click for Light)')
  })

  it('should set isDark to true when theme mode is DARK', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setThemeMode(THEME_MODES.DARK)
    })
    
    expect(result.current.isDark).toBe(true)
  })

  it('should set isDark to false when theme mode is LIGHT', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setThemeMode(THEME_MODES.LIGHT)
    })
    
    expect(result.current.isDark).toBe(false)
  })

  it('should set isDark based on system preference when in AUTO mode', () => {
    mockMediaQuery.matches = true
    const { result } = renderHook(() => useTheme())
    
    // In AUTO mode, should follow system preference
    expect(result.current.themeMode).toBe(THEME_MODES.AUTO)
    expect(result.current.isDark).toBe(true)
  })

  it('should update isDark when system preference changes in AUTO mode', () => {
    const { result } = renderHook(() => useTheme())
    
    expect(result.current.themeMode).toBe(THEME_MODES.AUTO)
    expect(result.current.isDark).toBe(false)
    
    // Simulate system preference change
    act(() => {
      mockMediaQuery.matches = true
      const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
        call => call[0] === 'change'
      )?.[1]
      if (changeHandler) {
        changeHandler()
      }
    })
    
    expect(result.current.isDark).toBe(true)
  })

  it('should save theme mode to localStorage after isLoaded', async () => {
    const { result } = renderHook(() => useTheme())
    
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })
    
    act(() => {
      result.current.setThemeMode(THEME_MODES.DARK)
    })

    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEYS.THEME_MODE)).toBe(THEME_MODES.DARK)
    })
  })

  it('should not save theme mode before isLoaded', () => {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, THEME_MODES.LIGHT)
    const { result } = renderHook(() => useTheme())
    
    // Initial load should not overwrite localStorage
    expect(localStorage.getItem(STORAGE_KEYS.THEME_MODE)).toBe(THEME_MODES.LIGHT)
  })

  it('should reset theme to default', async () => {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, THEME_MODES.DARK)
    const { result } = renderHook(() => useTheme())
    
    expect(result.current.themeMode).toBe(THEME_MODES.DARK)
    
    act(() => {
      result.current.resetTheme()
    })

    expect(result.current.themeMode).toBe(THEME_MODES.AUTO)
    
    // Wait for the effect to remove from localStorage
    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEYS.THEME_MODE)).toBeNull()
    })
  })

  it('should mark isLoaded as true after initialization', async () => {
    const { result } = renderHook(() => useTheme())
    
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })
  })

  it('should cleanup mediaQuery listener on unmount', () => {
    const { unmount } = renderHook(() => useTheme())
    
    const removeListener = mockMediaQuery.removeEventListener
    expect(removeListener).not.toHaveBeenCalled()
    
    unmount()
    
    expect(removeListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should allow direct theme mode setting', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setThemeMode(THEME_MODES.DARK)
    })
    
    expect(result.current.themeMode).toBe(THEME_MODES.DARK)
    
    act(() => {
      result.current.setThemeMode(THEME_MODES.LIGHT)
    })
    
    expect(result.current.themeMode).toBe(THEME_MODES.LIGHT)
  })
})