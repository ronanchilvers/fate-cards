import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS, THEME_MODES } from '../constants'

/**
 * Custom hook for managing application theme
 * Handles light/dark/auto modes with system preference detection
 * 
 * @returns {Object} Theme state and controls
 */
export function useTheme() {
  // Lazy initialization: load saved theme mode on first render
  const [themeMode, setThemeMode] = useState(() => {
    const savedThemeMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE)
    if (savedThemeMode && Object.values(THEME_MODES).includes(savedThemeMode)) {
      return savedThemeMode
    }
    return THEME_MODES.AUTO
  })
  
  const [isDark, setIsDark] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Mark as loaded after mount
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Save theme mode when it changes (after initial load)
  // Remove from localStorage if set to default (AUTO)
  useEffect(() => {
    if (isLoaded) {
      if (themeMode === THEME_MODES.AUTO) {
        localStorage.removeItem(STORAGE_KEYS.THEME_MODE)
      } else {
        localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode)
      }
    }
  }, [themeMode, isLoaded])

  // Listen to system theme preference and update isDark
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateDarkMode = () => {
      if (themeMode === THEME_MODES.AUTO) {
        setIsDark(mediaQuery.matches)
      } else if (themeMode === THEME_MODES.DARK) {
        setIsDark(true)
      } else {
        setIsDark(false)
      }
    }

    updateDarkMode()
    mediaQuery.addEventListener('change', updateDarkMode)

    return () => mediaQuery.removeEventListener('change', updateDarkMode)
  }, [themeMode])

  // Cycle through theme modes: light -> dark -> auto -> light
  const cycleThemeMode = useCallback(() => {
    setThemeMode(current => {
      if (current === THEME_MODES.LIGHT) return THEME_MODES.DARK
      if (current === THEME_MODES.DARK) return THEME_MODES.AUTO
      return THEME_MODES.LIGHT
    })
  }, [])

  // Get appropriate icon key for current theme mode
  const getThemeIcon = useCallback(() => {
    if (themeMode === THEME_MODES.LIGHT) return 'themeLight'
    if (themeMode === THEME_MODES.DARK) return 'themeDark'
    return 'themeAuto'
  }, [themeMode])

  // Get tooltip text for theme button
  const getThemeTitle = useCallback(() => {
    if (themeMode === THEME_MODES.LIGHT) return 'Light Mode (click for Dark)'
    if (themeMode === THEME_MODES.DARK) return 'Dark Mode (click for Auto)'
    return 'Auto Mode (click for Light)'
  }, [themeMode])

  // Reset theme to default
  const resetTheme = useCallback(() => {
    setThemeMode(THEME_MODES.AUTO)
    // localStorage will be removed by the effect
  }, [])

  return {
    themeMode,
    isDark,
    isLoaded,
    cycleThemeMode,
    getThemeIcon,
    getThemeTitle,
    resetTheme,
    setThemeMode
  }
}
