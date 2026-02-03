import { useState, useEffect, useCallback } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'
import { STORAGE_KEYS } from '../constants'
import { defaultCategories } from '../data/defaults'
import { getCategoryColor, normalizeColorToHex } from '../utils/colors'

/**
 * Custom hook for managing card categories
 * Handles CRUD operations, collapsed state, and localStorage persistence
 * 
 * @returns {Object} Categories state and operations
 */
export function useCategories() {
  const [categories, setCategories] = useState(defaultCategories)
  const [collapsedCategories, setCollapsedCategories] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedCategories = safeGetJSON(STORAGE_KEYS.CATEGORIES)
    const savedCollapsed = safeGetJSON(STORAGE_KEYS.COLLAPSED_CATEGORIES)
    
    if (savedCategories && Array.isArray(savedCategories)) {
      setCategories(savedCategories)
    }
    if (savedCollapsed && Array.isArray(savedCollapsed)) {
      setCollapsedCategories(savedCollapsed)
    }
    setIsLoaded(true)
  }, [])

  // Persist categories to localStorage
  useEffect(() => {
    if (isLoaded) {
      safeSetJSON(STORAGE_KEYS.CATEGORIES, categories)
    }
  }, [categories, isLoaded])

  // Persist collapsed state to localStorage
  useEffect(() => {
    if (isLoaded) {
      safeSetJSON(STORAGE_KEYS.COLLAPSED_CATEGORIES, collapsedCategories)
    }
  }, [collapsedCategories, isLoaded])

  /**
   * Default category colors for standard categories
   */
  const defaultColors = {
    'PCs': '#c53030',
    'NPCs': '#2c5282',
    'Scenes': '#ed8936'
  }

  /**
   * Add a new category
   * @param {string} categoryName - Name of the category to add
   * @returns {boolean} True if added, false if duplicate/invalid
   */
  const addCategory = useCallback((categoryName) => {
    const trimmedName = categoryName?.trim()
    if (!trimmedName) return false

    if (categories.includes(trimmedName)) {
      return false // Duplicate
    }

    setCategories(prev => [...prev, trimmedName])
    return true
  }, [categories])

  /**
   * Delete a category
   * @param {string} categoryName - Name of the category to delete
   * @param {number} cardCount - Number of cards in this category
   * @returns {Object} Result with success flag and message
   */
  const deleteCategory = useCallback((categoryName, cardCount = 0) => {
    if (cardCount > 0) {
      return {
        success: false,
        message: `Cannot delete category "${categoryName}" because it contains ${cardCount} card(s). Please move or delete the cards first.`
      }
    }

    setCategories(prev => prev.filter(cat => cat !== categoryName))
    // Also remove from collapsed
    setCollapsedCategories(prev => prev.filter(cat => cat !== categoryName))
    return { success: true }
  }, [])

  /**
   * Rename a category
   * @param {string} oldName - Current name
   * @param {string} newName - New name
   * @returns {boolean} True if renamed successfully
   */
  const renameCategory = useCallback((oldName, newName) => {
    const trimmedNew = newName?.trim()
    if (!trimmedNew || trimmedNew === oldName) return false
    if (categories.includes(trimmedNew)) return false // Duplicate

    setCategories(prev => prev.map(cat => cat === oldName ? trimmedNew : cat))
    // Update collapsed state if needed
    setCollapsedCategories(prev => 
      prev.map(cat => cat === oldName ? trimmedNew : cat)
    )
    return true
  }, [categories])

  /**
   * Toggle a category's collapsed state
   * @param {string} categoryName - Category to toggle
   */
  const toggleCategoryCollapse = useCallback((categoryName) => {
    setCollapsedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(c => c !== categoryName)
      } else {
        return [...prev, categoryName]
      }
    })
  }, [])

  /**
   * Check if a category is collapsed
   * @param {string} categoryName - Category to check
   * @returns {boolean} True if collapsed
   */
  const isCategoryCollapsed = useCallback((categoryName) => {
    return collapsedCategories.includes(categoryName)
  }, [collapsedCategories])

  /**
   * Get color for a category
   * @param {string} categoryName - Category name
   * @returns {string} Hex color code
   */
  const getCategoryColorWithDefaults = useCallback((categoryName) => {
    const resolvedColor = getCategoryColor(categoryName, defaultColors)
    return normalizeColorToHex(resolvedColor) || '#1f2937'
  }, [])

  /**
   * Check if a category exists
   * @param {string} categoryName - Category to check
   * @returns {boolean} True if exists
   */
  const hasCategory = useCallback((categoryName) => {
    return categories.includes(categoryName?.trim())
  }, [categories])

  /**
   * Reset categories to defaults
   */
  const resetCategories = useCallback(() => {
    setCategories(defaultCategories)
    setCollapsedCategories([])
  }, [])

  /**
   * Import categories from external data
   * @param {Array<string>} importedCategories - Categories to import
   * @returns {Object} Result with success and any warnings
   */
  const importCategories = useCallback((importedCategories) => {
    if (!Array.isArray(importedCategories)) {
      return { success: false, warning: 'Categories were invalid and not imported.' }
    }

    const trimmedCategories = importedCategories
      .filter(cat => typeof cat === 'string')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0)

    const validCategories = [...new Set(trimmedCategories)]

    if (validCategories.length === 0) {
      return { success: false, warning: 'Categories were invalid and not imported.' }
    }

    setCategories(validCategories)
    return { success: true, count: validCategories.length }
  }, [])

  return {
    categories,
    collapsedCategories,
    isLoaded,
    addCategory,
    deleteCategory,
    renameCategory,
    toggleCategoryCollapse,
    isCategoryCollapsed,
    getCategoryColorWithDefaults,
    hasCategory,
    resetCategories,
    importCategories,
    setCategories,
    setCollapsedCategories
  }
}
