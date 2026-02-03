import { useState, useEffect, useCallback } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'
import { STORAGE_KEYS } from '../constants'
import { defaultSkillLevels } from '../data/defaults'

const normalizeSkillLevelsList = (levels) => {
  if (!Array.isArray(levels)) return null
  const seen = new Set()
  const normalized = []

  levels.forEach(level => {
    if (!level || typeof level !== 'object' || Array.isArray(level)) return
    const label = typeof level.label === 'string' ? level.label.trim() : ''
    if (!label || seen.has(label)) return
    const value = typeof level.value === 'number' && !Number.isNaN(level.value)
      ? level.value
      : null
    if (value === null) return
    seen.add(label)
    normalized.push({ label, value })
  })

  if (normalized.length === 0) return null
  return normalized.sort((a, b) => b.value - a.value)
}

/**
 * Custom hook for managing skill levels (the Fate ladder)
 * Handles CRUD operations and localStorage persistence
 * 
 * @returns {Object} Skill levels state and operations
 */
export function useSkillLevels() {
  const [skillLevels, setSkillLevels] = useState(defaultSkillLevels)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load skill levels from localStorage on mount
  useEffect(() => {
    const savedSkillLevels = safeGetJSON(STORAGE_KEYS.SKILL_LEVELS)
    const normalizedLevels = normalizeSkillLevelsList(savedSkillLevels)
    if (normalizedLevels) {
      setSkillLevels(normalizedLevels)
    }
    setIsLoaded(true)
  }, [])

  // Persist skill levels to localStorage when changed
  useEffect(() => {
    if (isLoaded) {
      safeSetJSON(STORAGE_KEYS.SKILL_LEVELS, skillLevels)
    }
  }, [skillLevels, isLoaded])

  /**
   * Add a new skill level at the top (highest value)
   * @param {string} labelName - Label for the new level
   * @returns {boolean} True if added, false if duplicate/invalid
   */
  const addSkillLevelAtTop = useCallback((labelName) => {
    const trimmedLabel = labelName?.trim()
    if (!trimmedLabel) return false

    if (skillLevels.some(level => level.label === trimmedLabel)) {
      return false // Duplicate label
    }

    const maxValue = skillLevels.length > 0 
      ? Math.max(...skillLevels.map(l => l.value)) 
      : -1
    const newLevel = { label: trimmedLabel, value: maxValue + 1 }

    setSkillLevels(prev => 
      [...prev, newLevel].sort((a, b) => b.value - a.value)
    )
    return true
  }, [skillLevels])

  /**
   * Add a new skill level at the bottom (lowest value)
   * @param {string} labelName - Label for the new level
   * @returns {boolean} True if added, false if duplicate/invalid
   */
  const addSkillLevelAtBottom = useCallback((labelName) => {
    const trimmedLabel = labelName?.trim()
    if (!trimmedLabel) return false

    if (skillLevels.some(level => level.label === trimmedLabel)) {
      return false // Duplicate label
    }

    const minValue = skillLevels.length > 0 
      ? Math.min(...skillLevels.map(l => l.value)) 
      : 1
    const newLevel = { label: trimmedLabel, value: minValue - 1 }

    setSkillLevels(prev => 
      [...prev, newLevel].sort((a, b) => b.value - a.value)
    )
    return true
  }, [skillLevels])

  /**
   * Delete a skill level by value
   * @param {number} levelValue - Value of the level to delete
   */
  const deleteSkillLevel = useCallback((levelValue) => {
    setSkillLevels(prev => prev.filter(l => l.value !== levelValue))
  }, [])

  /**
   * Update a skill level's label
   * @param {number} levelValue - Value of the level to update
   * @param {string} newLabel - New label text
   */
  const updateSkillLevelLabel = useCallback((levelValue, newLabel) => {
    const trimmedLabel = newLabel?.trim()
    if (!trimmedLabel) return false

    if (skillLevels.some(level => level.value !== levelValue && level.label === trimmedLabel)) {
      return false
    }

    setSkillLevels(prev => prev.map(level =>
      level.value === levelValue ? { ...level, label: trimmedLabel } : level
    ))
    return true
  }, [skillLevels])

  /**
   * Get a skill level by value
   * @param {number} value - The numeric value
   * @returns {Object|undefined} The skill level object or undefined
   */
  const getSkillLevelByValue = useCallback((value) => {
    return skillLevels.find(l => l.value === value)
  }, [skillLevels])

  /**
   * Check if a label already exists
   * @param {string} label - Label to check
   * @returns {boolean} True if label exists
   */
  const hasLabel = useCallback((label) => {
    return skillLevels.some(l => l.label === label?.trim())
  }, [skillLevels])

  /**
   * Reset skill levels to defaults
   */
  const resetSkillLevels = useCallback(() => {
    setSkillLevels(defaultSkillLevels)
  }, [])

  /**
   * Import skill levels from external data
   * @param {Array} importedLevels - Skill levels array to import
   * @returns {Object} Result with count and any warnings
   */
  const importSkillLevels = useCallback((importedLevels) => {
    if (!Array.isArray(importedLevels)) {
      return { success: false, warning: 'Skill levels were invalid and not imported.' }
    }

    const validSkillLevels = importedLevels.filter(level => 
      level && 
      typeof level === 'object' &&
      typeof level.label === 'string' && 
      level.label.trim().length > 0 &&
      typeof level.value === 'number' &&
      !isNaN(level.value)
    )

    if (validSkillLevels.length === 0) {
      return { success: false, warning: 'Skill levels were invalid and not imported.' }
    }

    setSkillLevels(validSkillLevels.sort((a, b) => b.value - a.value))
    return { success: true, count: validSkillLevels.length }
  }, [])

  /**
   * Get formatted skill levels for display (with +/- prefix)
   * @returns {Array} Formatted skill levels
   */
  const getFormattedLevels = useCallback(() => {
    return skillLevels.map(level => ({
      value: level.value,
      label: `${level.label} (${level.value >= 0 ? '+' : ''}${level.value})`
    }))
  }, [skillLevels])

  return {
    skillLevels,
    isLoaded,
    addSkillLevelAtTop,
    addSkillLevelAtBottom,
    deleteSkillLevel,
    updateSkillLevelLabel,
    getSkillLevelByValue,
    hasLabel,
    resetSkillLevels,
    importSkillLevels,
    getFormattedLevels,
    setSkillLevels
  }
}
