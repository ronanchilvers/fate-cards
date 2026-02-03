import { useState, useEffect, useCallback } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'
import { STORAGE_KEYS } from '../constants'
import { defaultSkills } from '../data/defaults'

/**
 * Custom hook for managing skills list
 * Handles CRUD operations and localStorage persistence
 * 
 * @returns {Object} Skills state and operations
 */
export function useSkills() {
  const [skills, setSkills] = useState(defaultSkills)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load skills from localStorage on mount
  useEffect(() => {
    const savedSkills = safeGetJSON(STORAGE_KEYS.SKILLS)
    if (savedSkills && Array.isArray(savedSkills)) {
      setSkills(savedSkills)
    }
    setIsLoaded(true)
  }, [])

  // Persist skills to localStorage when changed
  useEffect(() => {
    if (isLoaded) {
      safeSetJSON(STORAGE_KEYS.SKILLS, skills)
    }
  }, [skills, isLoaded])

  /**
   * Add a new skill to the list
   * @param {string} skillName - Name of the skill to add
   * @returns {boolean} True if added, false if duplicate/invalid
   */
  const addSkill = useCallback((skillName) => {
    const trimmedName = skillName?.trim()
    if (!trimmedName) return false

    if (skills.includes(trimmedName)) {
      return false // Duplicate
    }

    setSkills(prev => [...prev, trimmedName].sort())
    return true
  }, [skills])

  /**
   * Delete a skill from the list
   * @param {string} skillName - Name of the skill to delete
   */
  const deleteSkill = useCallback((skillName) => {
    setSkills(prev => prev.filter(s => s !== skillName))
  }, [])

  /**
   * Check if a skill exists
   * @param {string} skillName - Name to check
   * @returns {boolean} True if skill exists
   */
  const hasSkill = useCallback((skillName) => {
    return skills.includes(skillName?.trim())
  }, [skills])

  /**
   * Reset skills to defaults
   */
  const resetSkills = useCallback(() => {
    setSkills(defaultSkills)
  }, [])

  /**
   * Import skills from external data
   * @param {Array<string>} importedSkills - Skills array to import
   * @returns {Object} Result with count and any warnings
   */
  const importSkills = useCallback((importedSkills) => {
    if (!Array.isArray(importedSkills)) {
      return { success: false, warning: 'Skills were invalid and not imported.' }
    }

    const trimmedSkills = importedSkills
      .filter(skill => typeof skill === 'string')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)

    const validSkills = [...new Set(trimmedSkills)]

    if (validSkills.length === 0) {
      return { success: false, warning: 'Skills were invalid and not imported.' }
    }

    setSkills(validSkills)
    return { success: true, count: validSkills.length }
  }, [])

  return {
    skills,
    isLoaded,
    addSkill,
    deleteSkill,
    hasSkill,
    resetSkills,
    importSkills,
    setSkills
  }
}
