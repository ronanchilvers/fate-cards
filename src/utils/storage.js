/**
 * localStorage Utility Functions
 * 
 * Provides safe wrappers around localStorage operations with automatic
 * error handling, JSON parsing/stringifying, and fallback values.
 */

/**
 * Safely retrieves and parses a JSON value from localStorage
 * 
 * @param {string} key - The localStorage key to retrieve
 * @param {*} fallback - The fallback value to return if retrieval fails (default: null)
 * @returns {*} The parsed JSON value, or the fallback if parsing fails or key doesn't exist
 * 
 * @example
 * const cards = safeGetJSON('fate-cards', [])
 * const settings = safeGetJSON('fate-settings', { theme: 'light' })
 */
export function safeGetJSON(key, fallback = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch (err) {
    console.error(`Failed to parse localStorage key "${key}":`, err)
    // Clear the corrupted data
    localStorage.removeItem(key)
    return fallback
  }
}

/**
 * Safely stringifies and saves a value to localStorage
 * 
 * @param {string} key - The localStorage key to save to
 * @param {*} value - The value to stringify and save
 * @returns {boolean} True if save was successful, false otherwise
 * 
 * @example
 * safeSetJSON('fate-cards', cardsArray)
 * safeSetJSON('fate-settings', { theme: 'dark' })
 */
export function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error(`Failed to save to localStorage key "${key}":`, err)
    return false
  }
}