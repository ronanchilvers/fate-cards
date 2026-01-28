import { useState, useEffect, useCallback } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'

/**
 * Custom hook for syncing state with localStorage
 * 
 * @param {string} key - localStorage key
 * @param {*} initialValue - Initial/default value
 * @param {Object} options - Configuration options
 * @param {boolean} options.serialize - Whether to JSON serialize (default: true)
 * @returns {[*, Function, boolean]} [value, setValue, isLoaded]
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const { serialize = true } = options
  
  // Lazy initialization: load from localStorage on first render
  const [value, setValue] = useState(() => {
    if (serialize) {
      const saved = safeGetJSON(key)
      return saved !== null ? saved : initialValue
    } else {
      const saved = localStorage.getItem(key)
      return saved !== null ? saved : initialValue
    }
  })
  
  const [isLoaded, setIsLoaded] = useState(false)

  // Mark as loaded after mount
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Save to localStorage when value changes (after initial load)
  useEffect(() => {
    if (isLoaded) {
      if (serialize) {
        safeSetJSON(key, value)
      } else {
        localStorage.setItem(key, value)
      }
    }
  }, [key, value, isLoaded, serialize])

  // Memoized setter that also handles localStorage
  const setStoredValue = useCallback((newValue) => {
    setValue(prev => {
      const resolvedValue = typeof newValue === 'function' ? newValue(prev) : newValue
      return resolvedValue
    })
  }, [])

  return [value, setStoredValue, isLoaded]
}

/**
 * Hook for removing a localStorage key
 * @param {string} key - localStorage key to manage
 * @returns {Function} Function to remove the key
 */
export function useLocalStorageRemove(key) {
  return useCallback(() => {
    localStorage.removeItem(key)
  }, [key])
}