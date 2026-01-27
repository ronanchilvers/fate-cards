# Detailed Implementation Plan: B.1, B.2, B.3

**Document Version**: 1.0  
**Created**: 2026-01-27  
**Target Issues**: B.1 (Monolithic App.jsx), B.2 (Card.jsx Complexity), B.3 (Inconsistent State Management)  
**Estimated Total Effort**: 20-25 hours

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Prerequisites and Preparation](#prerequisites-and-preparation)
3. [Phase 1: Custom Hooks Extraction](#phase-1-custom-hooks-extraction)
4. [Phase 2: Modal Component Extraction](#phase-2-modal-component-extraction)
5. [Phase 3: Element Component Extraction](#phase-3-element-component-extraction)
6. [Phase 4: State Management Standardization](#phase-4-state-management-standardization)
7. [Testing Requirements](#testing-requirements)
8. [Verification Checklist](#verification-checklist)
9. [Rollback Procedures](#rollback-procedures)

---

## Executive Summary

This plan addresses three related code quality issues:

| Issue | Current State | Target State |
|-------|---------------|--------------|
| B.1 | App.jsx: 831 lines, 20 state variables, 20+ handlers | App.jsx: <200 lines, orchestration only |
| B.2 | Card.jsx: 835 lines, renderElement: 570+ lines | Card.jsx: <200 lines, 8 element components |
| B.3 | Mixed localStorage patterns | Unified hook-based persistence |

**Approach**: Bottom-up extraction starting with custom hooks (safest, most reusable), then modals, then element components.

---

## Prerequisites and Preparation

### Task 0.1: Create Directory Structure

**Action**: Create the following directories:

```
src/
├── hooks/           # NEW - Custom React hooks
├── components/
│   ├── modals/      # NEW - Modal components
│   └── elements/    # NEW - Card element components
```

**Command**:
```bash
mkdir -p src/hooks src/components/modals src/components/elements
```

**Verification**: Directories exist

---

### Task 0.2: Create Index Files

**Action**: Create barrel export files for clean imports

**File**: `src/hooks/index.js`
```javascript
// Custom hooks barrel export
// Add exports as hooks are created
```

**File**: `src/components/modals/index.js`
```javascript
// Modal components barrel export
// Add exports as modals are created
```

**File**: `src/components/elements/index.js`
```javascript
// Element components barrel export
// Add exports as elements are created
```

**Verification**: Files created with placeholder comments

---

## Phase 1: Custom Hooks Extraction

### Overview

Extract state management logic from App.jsx into 6 custom hooks. This phase addresses B.1 and B.3 simultaneously.

**Order of extraction** (safest to most complex):
1. useTheme (self-contained, no dependencies)
2. useLocalStorage (utility hook)
3. useSkills
4. useSkillLevels
5. useCategories
6. useCards (most complex, depends on categories)

---

### Task 1.1: Create useLocalStorage Hook

**Purpose**: Standardize localStorage access pattern (addresses B.3)

**File**: `src/hooks/useLocalStorage.js`

```javascript
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
  const [value, setValue] = useState(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (serialize) {
      const saved = safeGetJSON(key)
      if (saved !== null) {
        setValue(saved)
      }
    } else {
      const saved = localStorage.getItem(key)
      if (saved !== null) {
        setValue(saved)
      }
    }
    setIsLoaded(true)
  }, [key, serialize])

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
```

**Test File**: `src/hooks/useLocalStorage.test.js`

```javascript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('should load existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    // Wait for effect
    expect(result.current[0]).toBe('stored-value')
  })

  it('should save value to localStorage when updated', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('new-value')
    })

    expect(JSON.parse(localStorage.getItem('test-key'))).toBe('new-value')
  })

  it('should return isLoaded as true after initialization', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[2]).toBe(true)
  })

  it('should handle non-serialized strings', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => 
      useLocalStorage('theme', 'light', { serialize: false })
    )
    expect(result.current[0]).toBe('dark')
  })

  it('should handle complex objects', () => {
    const initialValue = { cards: [], settings: { theme: 'light' } }
    const { result } = renderHook(() => useLocalStorage('data', initialValue))
    
    const newValue = { cards: [{ id: '1' }], settings: { theme: 'dark' } }
    act(() => {
      result.current[1](newValue)
    })

    expect(result.current[0]).toEqual(newValue)
    expect(JSON.parse(localStorage.getItem('data'))).toEqual(newValue)
  })

  it('should handle functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0))
    
    act(() => {
      result.current[1](prev => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })
})
```

**Verification**:
- [ ] Hook file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/hooks/index.js`

---

### Task 1.2: Create useTheme Hook

**Purpose**: Extract theme management from App.jsx

**File**: `src/hooks/useTheme.js`

```javascript
import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS, THEME_MODES } from '../constants'

/**
 * Custom hook for managing application theme
 * Handles light/dark/auto modes with system preference detection
 * 
 * @returns {Object} Theme state and controls
 */
export function useTheme() {
  const [themeMode, setThemeMode] = useState(THEME_MODES.AUTO)
  const [isDark, setIsDark] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved theme mode on mount
  useEffect(() => {
    const savedThemeMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE)
    if (savedThemeMode && Object.values(THEME_MODES).includes(savedThemeMode)) {
      setThemeMode(savedThemeMode)
    }
    setIsLoaded(true)
  }, [])

  // Save theme mode when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode)
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

  // Get appropriate icon for current theme mode
  const getThemeIcon = useCallback(() => {
    if (themeMode === THEME_MODES.LIGHT) return '☀️'
    if (themeMode === THEME_MODES.DARK) return '🌙'
    return '🌓'
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
    localStorage.removeItem(STORAGE_KEYS.THEME_MODE)
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
```

**Test File**: `src/hooks/useTheme.test.js`

```javascript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTheme } from './useTheme'
import { THEME_MODES, STORAGE_KEYS } from '../constants'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
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

  it('should set isDark based on theme mode', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setThemeMode(THEME_MODES.DARK)
    })
    expect(result.current.isDark).toBe(true)

    act(() => {
      result.current.setThemeMode(THEME_MODES.LIGHT)
    })
    expect(result.current.isDark).toBe(false)
  })

  it('should save theme mode to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setThemeMode(THEME_MODES.DARK)
    })

    expect(localStorage.getItem(STORAGE_KEYS.THEME_MODE)).toBe(THEME_MODES.DARK)
  })

  it('should reset theme to default', () => {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, THEME_MODES.DARK)
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.resetTheme()
    })

    expect(result.current.themeMode).toBe(THEME_MODES.AUTO)
    expect(localStorage.getItem(STORAGE_KEYS.THEME_MODE)).toBeNull()
  })
})
```

**Verification**:
- [ ] Hook file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/hooks/index.js`

---

### Task 1.3: Create useSkills Hook

**Purpose**: Extract skills management from App.jsx

**Source Lines in App.jsx**: 15, 22-23, 38, 56-58, 92-94, 243-259

**File**: `src/hooks/useSkills.js`

```javascript
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

    const validSkills = importedSkills.filter(skill => 
      typeof skill === 'string' && skill.trim().length > 0
    )

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
```

**Test File**: `src/hooks/useSkills.test.js`

```javascript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useSkills } from './useSkills'
import { STORAGE_KEYS } from '../constants'
import { defaultSkills } from '../data/defaults'

describe('useSkills', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with default skills', () => {
    const { result } = renderHook(() => useSkills())
    expect(result.current.skills).toEqual(defaultSkills)
  })

  it('should load saved skills from localStorage', () => {
    const savedSkills = ['Custom Skill 1', 'Custom Skill 2']
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(savedSkills))
    
    const { result } = renderHook(() => useSkills())
    expect(result.current.skills).toEqual(savedSkills)
  })

  it('should add a new skill alphabetically', () => {
    const { result } = renderHook(() => useSkills())
    
    act(() => {
      result.current.addSkill('Alchemy')
    })

    expect(result.current.skills).toContain('Alchemy')
    // Should be sorted
    expect(result.current.skills[0]).toBe('Alchemy')
  })

  it('should return false when adding duplicate skill', () => {
    const { result } = renderHook(() => useSkills())
    
    let addResult
    act(() => {
      addResult = result.current.addSkill('Athletics') // Default skill
    })

    expect(addResult).toBe(false)
  })

  it('should return false when adding empty skill', () => {
    const { result } = renderHook(() => useSkills())
    
    let addResult
    act(() => {
      addResult = result.current.addSkill('  ')
    })

    expect(addResult).toBe(false)
  })

  it('should delete a skill', () => {
    const { result } = renderHook(() => useSkills())
    const initialLength = result.current.skills.length
    
    act(() => {
      result.current.deleteSkill('Athletics')
    })

    expect(result.current.skills).not.toContain('Athletics')
    expect(result.current.skills.length).toBe(initialLength - 1)
  })

  it('should check if skill exists', () => {
    const { result } = renderHook(() => useSkills())
    
    expect(result.current.hasSkill('Athletics')).toBe(true)
    expect(result.current.hasSkill('NonExistent')).toBe(false)
  })

  it('should reset skills to defaults', () => {
    const { result } = renderHook(() => useSkills())
    
    act(() => {
      result.current.addSkill('Custom Skill')
    })
    expect(result.current.skills).toContain('Custom Skill')

    act(() => {
      result.current.resetSkills()
    })
    expect(result.current.skills).toEqual(defaultSkills)
  })

  it('should import valid skills', () => {
    const { result } = renderHook(() => useSkills())
    const importedSkills = ['Skill A', 'Skill B', 'Skill C']
    
    let importResult
    act(() => {
      importResult = result.current.importSkills(importedSkills)
    })

    expect(importResult.success).toBe(true)
    expect(importResult.count).toBe(3)
    expect(result.current.skills).toEqual(importedSkills)
  })

  it('should reject invalid skills import', () => {
    const { result } = renderHook(() => useSkills())
    
    let importResult
    act(() => {
      importResult = result.current.importSkills('not an array')
    })

    expect(importResult.success).toBe(false)
    expect(importResult.warning).toBeDefined()
  })

  it('should persist skills to localStorage', () => {
    const { result } = renderHook(() => useSkills())
    
    act(() => {
      result.current.addSkill('New Skill')
    })

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SKILLS))
    expect(saved).toContain('New Skill')
  })
})
```

**Verification**:
- [ ] Hook file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/hooks/index.js`

---

### Task 1.4: Create useSkillLevels Hook

**Purpose**: Extract skill levels (the ladder) management from App.jsx

**Source Lines in App.jsx**: 16, 24-25, 39, 59-61, 100-105, 261-307

**File**: `src/hooks/useSkillLevels.js`

```javascript
import { useState, useEffect, useCallback } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'
import { STORAGE_KEYS } from '../constants'
import { defaultSkillLevels } from '../data/defaults'

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
    if (savedSkillLevels && Array.isArray(savedSkillLevels)) {
      setSkillLevels(savedSkillLevels)
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
    setSkillLevels(prev => prev.map(level =>
      level.value === levelValue ? { ...level, label: newLabel } : level
    ))
  }, [])

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
```

**Test File**: `src/hooks/useSkillLevels.test.js`

```javascript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useSkillLevels } from './useSkillLevels'
import { STORAGE_KEYS } from '../constants'
import { defaultSkillLevels } from '../data/defaults'

describe('useSkillLevels', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with default skill levels', () => {
    const { result } = renderHook(() => useSkillLevels())
    expect(result.current.skillLevels).toEqual(defaultSkillLevels)
  })

  it('should load saved skill levels from localStorage', () => {
    const savedLevels = [
      { label: 'Epic', value: 7 },
      { label: 'Good', value: 3 }
    ]
    localStorage.setItem(STORAGE_KEYS.SKILL_LEVELS, JSON.stringify(savedLevels))
    
    const { result } = renderHook(() => useSkillLevels())
    expect(result.current.skillLevels).toEqual(savedLevels)
  })

  it('should add skill level at top with highest value', () => {
    const { result } = renderHook(() => useSkillLevels())
    const maxBefore = Math.max(...result.current.skillLevels.map(l => l.value))
    
    act(() => {
      result.current.addSkillLevelAtTop('Legendary')
    })

    const newLevel = result.current.skillLevels.find(l => l.label === 'Legendary')
    expect(newLevel).toBeDefined()
    expect(newLevel.value).toBe(maxBefore + 1)
    expect(result.current.skillLevels[0].label).toBe('Legendary')
  })

  it('should add skill level at bottom with lowest value', () => {
    const { result } = renderHook(() => useSkillLevels())
    const minBefore = Math.min(...result.current.skillLevels.map(l => l.value))
    
    act(() => {
      result.current.addSkillLevelAtBottom('Terrible')
    })

    const newLevel = result.current.skillLevels.find(l => l.label === 'Terrible')
    expect(newLevel).toBeDefined()
    expect(newLevel.value).toBe(minBefore - 1)
    // Should be last in sorted array
    expect(result.current.skillLevels[result.current.skillLevels.length - 1].label).toBe('Terrible')
  })

  it('should return false when adding duplicate label', () => {
    const { result } = renderHook(() => useSkillLevels())
    const existingLabel = result.current.skillLevels[0].label
    
    let addResult
    act(() => {
      addResult = result.current.addSkillLevelAtTop(existingLabel)
    })

    expect(addResult).toBe(false)
  })

  it('should delete a skill level by value', () => {
    const { result } = renderHook(() => useSkillLevels())
    const levelToDelete = result.current.skillLevels[0]
    const initialLength = result.current.skillLevels.length
    
    act(() => {
      result.current.deleteSkillLevel(levelToDelete.value)
    })

    expect(result.current.skillLevels.length).toBe(initialLength - 1)
    expect(result.current.skillLevels.find(l => l.value === levelToDelete.value)).toBeUndefined()
  })

  it('should update a skill level label', () => {
    const { result } = renderHook(() => useSkillLevels())
    const levelValue = result.current.skillLevels[0].value
    
    act(() => {
      result.current.updateSkillLevelLabel(levelValue, 'Updated Label')
    })

    const updated = result.current.skillLevels.find(l => l.value === levelValue)
    expect(updated.label).toBe('Updated Label')
  })

  it('should get skill level by value', () => {
    const { result } = renderHook(() => useSkillLevels())
    const expected = result.current.skillLevels[0]
    
    const found = result.current.getSkillLevelByValue(expected.value)
    expect(found).toEqual(expected)
  })

  it('should check if label exists', () => {
    const { result } = renderHook(() => useSkillLevels())
    const existingLabel = result.current.skillLevels[0].label
    
    expect(result.current.hasLabel(existingLabel)).toBe(true)
    expect(result.current.hasLabel('NonExistent')).toBe(false)
  })

  it('should reset to defaults', () => {
    const { result } = renderHook(() => useSkillLevels())
    
    act(() => {
      result.current.addSkillLevelAtTop('Custom')
    })
    
    act(() => {
      result.current.resetSkillLevels()
    })

    expect(result.current.skillLevels).toEqual(defaultSkillLevels)
  })

  it('should import valid skill levels', () => {
    const { result } = renderHook(() => useSkillLevels())
    const imported = [
      { label: 'High', value: 5 },
      { label: 'Low', value: 1 }
    ]
    
    let importResult
    act(() => {
      importResult = result.current.importSkillLevels(imported)
    })

    expect(importResult.success).toBe(true)
    expect(result.current.skillLevels).toEqual(imported.sort((a, b) => b.value - a.value))
  })

  it('should get formatted levels with value prefix', () => {
    const { result } = renderHook(() => useSkillLevels())
    
    const formatted = result.current.getFormattedLevels()
    
    // Check format includes +/- prefix
    formatted.forEach(level => {
      if (level.value >= 0) {
        expect(level.label).toContain('+')
      } else {
        expect(level.label).toContain('-')
      }
    })
  })

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useSkillLevels())
    
    act(() => {
      result.current.addSkillLevelAtTop('Persisted')
    })

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SKILL_LEVELS))
    expect(saved.find(l => l.label === 'Persisted')).toBeDefined()
  })
})
```

**Verification**:
- [ ] Hook file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/hooks/index.js`

---

### Task 1.5: Create useCategories Hook

**Purpose**: Extract category management from App.jsx

**Source Lines in App.jsx**: 14, 20-21, 30, 37, 53-55, 85-87, 114-117, 208-241, 487-493

**File**: `src/hooks/useCategories.js`

```javascript
import { useState, useEffect, useCallback } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'
import { STORAGE_KEYS } from '../constants'
import { defaultCategories } from '../data/defaults'
import { getCategoryColor } from '../utils/colors'

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
    return getCategoryColor(categoryName, defaultColors)
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

    const validCategories = importedCategories.filter(cat => 
      typeof cat === 'string' && cat.trim().length > 0
    )

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
```

**Test File**: `src/hooks/useCategories.test.js`

```javascript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useCategories } from './useCategories'
import { STORAGE_KEYS } from '../constants'
import { defaultCategories } from '../data/defaults'

describe('useCategories', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with default categories', () => {
    const { result } = renderHook(() => useCategories())
    expect(result.current.categories).toEqual(defaultCategories)
  })

  it('should load saved categories from localStorage', () => {
    const saved = ['Custom 1', 'Custom 2']
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(saved))
    
    const { result } = renderHook(() => useCategories())
    expect(result.current.categories).toEqual(saved)
  })

  it('should load collapsed state from localStorage', () => {
    const categories = ['Cat1', 'Cat2', 'Cat3']
    const collapsed = ['Cat2']
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    localStorage.setItem(STORAGE_KEYS.COLLAPSED_CATEGORIES, JSON.stringify(collapsed))
    
    const { result } = renderHook(() => useCategories())
    expect(result.current.collapsedCategories).toEqual(collapsed)
  })

  it('should add a new category', () => {
    const { result } = renderHook(() => useCategories())
    
    let addResult
    act(() => {
      addResult = result.current.addCategory('New Category')
    })

    expect(addResult).toBe(true)
    expect(result.current.categories).toContain('New Category')
  })

  it('should return false when adding duplicate category', () => {
    const { result } = renderHook(() => useCategories())
    const existing = result.current.categories[0]
    
    let addResult
    act(() => {
      addResult = result.current.addCategory(existing)
    })

    expect(addResult).toBe(false)
  })

  it('should delete a category with no cards', () => {
    const { result } = renderHook(() => useCategories())
    const toDelete = result.current.categories[0]
    
    let deleteResult
    act(() => {
      deleteResult = result.current.deleteCategory(toDelete, 0)
    })

    expect(deleteResult.success).toBe(true)
    expect(result.current.categories).not.toContain(toDelete)
  })

  it('should not delete a category with cards', () => {
    const { result } = renderHook(() => useCategories())
    const toDelete = result.current.categories[0]
    
    let deleteResult
    act(() => {
      deleteResult = result.current.deleteCategory(toDelete, 3)
    })

    expect(deleteResult.success).toBe(false)
    expect(deleteResult.message).toContain('3 card(s)')
    expect(result.current.categories).toContain(toDelete)
  })

  it('should rename a category', () => {
    const { result } = renderHook(() => useCategories())
    const oldName = result.current.categories[0]
    
    let renameResult
    act(() => {
      renameResult = result.current.renameCategory(oldName, 'New Name')
    })

    expect(renameResult).toBe(true)
    expect(result.current.categories).toContain('New Name')
    expect(result.current.categories).not.toContain(oldName)
  })

  it('should toggle category collapsed state', () => {
    const { result } = renderHook(() => useCategories())
    const category = result.current.categories[0]
    
    expect(result.current.isCategoryCollapsed(category)).toBe(false)
    
    act(() => {
      result.current.toggleCategoryCollapse(category)
    })
    expect(result.current.isCategoryCollapsed(category)).toBe(true)

    act(() => {
      result.current.toggleCategoryCollapse(category)
    })
    expect(result.current.isCategoryCollapsed(category)).toBe(false)
  })

  it('should get category color', () => {
    const { result } = renderHook(() => useCategories())
    
    const color = result.current.getCategoryColorWithDefaults('PCs')
    expect(color).toBe('#c53030')
  })

  it('should check if category exists', () => {
    const { result } = renderHook(() => useCategories())
    
    expect(result.current.hasCategory('PCs')).toBe(true)
    expect(result.current.hasCategory('NonExistent')).toBe(false)
  })

  it('should reset to defaults', () => {
    const { result } = renderHook(() => useCategories())
    
    act(() => {
      result.current.addCategory('Custom')
      result.current.toggleCategoryCollapse('PCs')
    })
    
    act(() => {
      result.current.resetCategories()
    })

    expect(result.current.categories).toEqual(defaultCategories)
    expect(result.current.collapsedCategories).toEqual([])
  })

  it('should import valid categories', () => {
    const { result } = renderHook(() => useCategories())
    const imported = ['Imported 1', 'Imported 2']
    
    let importResult
    act(() => {
      importResult = result.current.importCategories(imported)
    })

    expect(importResult.success).toBe(true)
    expect(result.current.categories).toEqual(imported)
  })

  it('should persist categories to localStorage', () => {
    const { result } = renderHook(() => useCategories())
    
    act(() => {
      result.current.addCategory('Persisted')
    })

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES))
    expect(saved).toContain('Persisted')
  })

  it('should update collapsed state when category is renamed', () => {
    const { result } = renderHook(() => useCategories())
    const oldName = result.current.categories[0]
    
    act(() => {
      result.current.toggleCategoryCollapse(oldName)
    })
    expect(result.current.isCategoryCollapsed(oldName)).toBe(true)

    act(() => {
      result.current.renameCategory(oldName, 'Renamed')
    })
    expect(result.current.isCategoryCollapsed('Renamed')).toBe(true)
    expect(result.current.isCategoryCollapsed(oldName)).toBe(false)
  })
})
```

**Verification**:
- [ ] Hook file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/hooks/index.js`

---

### Task 1.6: Create useCards Hook

**Purpose**: Extract cards management from App.jsx (most complex hook)

**Source Lines in App.jsx**: 13, 36, 44-52, 78-80, 147-205

**File**: `src/hooks/useCards.js`

```javascript
import { useState, useEffect, useCallback } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'
import { normalizeCards } from '../utils/cardSchema'
import { STORAGE_KEYS } from '../constants'
import { defaultSampleCard } from '../data/defaults'
import { cardTemplates } from '../data/cardTemplates'

/**
 * Custom hook for managing cards
 * Handles CRUD operations, templates, and localStorage persistence
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.getCategoryColor - Function to get category color
 * @returns {Object} Cards state and operations
 */
export function useCards({ getCategoryColor } = {}) {
  const [cards, setCards] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cards from localStorage on mount
  useEffect(() => {
    const savedCards = safeGetJSON(STORAGE_KEYS.CARDS)
    if (savedCards && Array.isArray(savedCards) && savedCards.length > 0) {
      setCards(normalizeCards(savedCards))
    } else {
      // Initialize with sample card
      setCards([defaultSampleCard])
    }
    setIsLoaded(true)
  }, [])

  // Persist cards to localStorage
  useEffect(() => {
    if (isLoaded) {
      safeSetJSON(STORAGE_KEYS.CARDS, cards)
    }
  }, [cards, isLoaded])

  /**
   * Add a new blank card
   * @param {string} category - Category for the new card
   * @param {string} color - Optional color override
   * @returns {Object} The new card
   */
  const addCard = useCallback((category, color = null) => {
    const newCard = {
      id: crypto.randomUUID(),
      category,
      color: color || (getCategoryColor ? getCategoryColor(category) : '#1f2937'),
      title: 'New Card',
      subtitle: '',
      elements: [],
      layout: 'auto'
    }
    setCards(prev => [...prev, newCard])
    return newCard
  }, [getCategoryColor])

  /**
   * Add a card from a template
   * @param {string} category - Category for the new card
   * @param {string} templateKey - Template key (e.g., 'standard-pc')
   * @param {string} color - Optional color override
   * @returns {Object} The new card
   */
  const addCardFromTemplate = useCallback((category, templateKey, color = null) => {
    const templateFactory = cardTemplates[templateKey] || cardTemplates['blank']
    const templateData = templateFactory()
    const newCard = {
      id: crypto.randomUUID(),
      category,
      color: color || (getCategoryColor ? getCategoryColor(category) : '#1f2937'),
      layout: 'auto',
      ...templateData
    }
    setCards(prev => [...prev, newCard])
    return newCard
  }, [getCategoryColor])

  /**
   * Update a card
   * @param {string} id - Card ID
   * @param {Object} updates - Fields to update
   */
  const updateCard = useCallback((id, updates) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ))
  }, [])

  /**
   * Delete a card
   * @param {string} id - Card ID to delete
   */
  const deleteCard = useCallback((id) => {
    setCards(prev => prev.filter(card => card.id !== id))
  }, [])

  /**
   * Duplicate a card
   * @param {Object} cardToDuplicate - Card object to duplicate
   * @returns {Object} The new duplicated card
   */
  const duplicateCard = useCallback((cardToDuplicate) => {
    const newCard = {
      ...structuredClone(cardToDuplicate),
      id: crypto.randomUUID(),
      title: cardToDuplicate.title + ' (Copy)',
      locked: false,
      elements: cardToDuplicate.elements.map(el => ({
        ...el,
        id: crypto.randomUUID()
      }))
    }
    setCards(prev => [...prev, newCard])
    return newCard
  }, [])

  /**
   * Get cards filtered by category
   * @param {string} category - Category to filter by
   * @returns {Array} Filtered cards
   */
  const getCardsByCategory = useCallback((category) => {
    return cards.filter(card => card.category === category)
  }, [cards])

  /**
   * Get count of cards in a category
   * @param {string} category - Category to count
   * @returns {number} Count of cards
   */
  const getCardCountByCategory = useCallback((category) => {
    return cards.filter(card => card.category === category).length
  }, [cards])

  /**
   * Move a card to a different category
   * @param {string} cardId - Card ID
   * @param {string} newCategory - New category
   * @param {string} newColor - Optional new color
   */
  const moveCardToCategory = useCallback((cardId, newCategory, newColor = null) => {
    setCards(prev => prev.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          category: newCategory,
          color: newColor || card.color
        }
      }
      return card
    }))
  }, [])

  /**
   * Reset cards (clear all)
   */
  const resetCards = useCallback(() => {
    setCards([])
  }, [])

  /**
   * Import cards from external data
   * @param {Array} importedCards - Cards to import
   * @returns {Object} Result with count and warnings
   */
  const importCards = useCallback((importedCards) => {
    if (!Array.isArray(importedCards)) {
      return { success: false, warning: 'Cards data was invalid.' }
    }

    const validCards = normalizeCards(importedCards)
    const skipped = importedCards.length - validCards.length

    setCards(validCards)
    
    return {
      success: true,
      count: validCards.length,
      skipped,
      warning: skipped > 0 ? `${skipped} invalid cards were skipped.` : null
    }
  }, [])

  return {
    cards,
    isLoaded,
    addCard,
    addCardFromTemplate,
    updateCard,
    deleteCard,
    duplicateCard,
    getCardsByCategory,
    getCardCountByCategory,
    moveCardToCategory,
    resetCards,
    importCards,
    setCards
  }
}
```

**Test File**: `src/hooks/useCards.test.js`

```javascript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCards } from './useCards'
import { STORAGE_KEYS } from '../constants'
import { defaultSampleCard } from '../data/defaults'

describe('useCards', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with sample card when localStorage is empty', () => {
    const { result } = renderHook(() => useCards())
    expect(result.current.cards).toHaveLength(1)
    expect(result.current.cards[0].id).toBe(defaultSampleCard.id)
  })

  it('should load saved cards from localStorage', () => {
    const savedCards = [
      { id: '1', title: 'Card 1', category: 'PCs', elements: [] },
      { id: '2', title: 'Card 2', category: 'NPCs', elements: [] }
    ]
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(savedCards))
    
    const { result } = renderHook(() => useCards())
    expect(result.current.cards).toHaveLength(2)
  })

  it('should add a new blank card', () => {
    const mockGetColor = vi.fn().mockReturnValue('#ff0000')
    const { result } = renderHook(() => useCards({ getCategoryColor: mockGetColor }))
    
    act(() => {
      result.current.addCard('PCs')
    })

    const newCard = result.current.cards.find(c => c.title === 'New Card')
    expect(newCard).toBeDefined()
    expect(newCard.category).toBe('PCs')
    expect(newCard.color).toBe('#ff0000')
  })

  it('should add a card from template', () => {
    const { result } = renderHook(() => useCards())
    
    act(() => {
      result.current.addCardFromTemplate('PCs', 'standard-pc')
    })

    const newCard = result.current.cards.find(c => c.title === 'New Character')
    expect(newCard).toBeDefined()
    expect(newCard.elements.length).toBeGreaterThan(0)
  })

  it('should update a card', () => {
    const { result } = renderHook(() => useCards())
    const cardId = result.current.cards[0].id
    
    act(() => {
      result.current.updateCard(cardId, { title: 'Updated Title' })
    })

    expect(result.current.cards[0].title).toBe('Updated Title')
  })

  it('should delete a card', () => {
    const { result } = renderHook(() => useCards())
    const cardId = result.current.cards[0].id
    const initialLength = result.current.cards.length
    
    act(() => {
      result.current.deleteCard(cardId)
    })

    expect(result.current.cards.length).toBe(initialLength - 1)
    expect(result.current.cards.find(c => c.id === cardId)).toBeUndefined()
  })

  it('should duplicate a card', () => {
    const { result } = renderHook(() => useCards())
    const original = result.current.cards[0]
    
    act(() => {
      result.current.duplicateCard(original)
    })

    expect(result.current.cards.length).toBe(2)
    const duplicate = result.current.cards.find(c => c.title === original.title + ' (Copy)')
    expect(duplicate).toBeDefined()
    expect(duplicate.id).not.toBe(original.id)
    expect(duplicate.locked).toBe(false)
  })

  it('should get cards by category', () => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify([
      { id: '1', title: 'Card 1', category: 'PCs', elements: [] },
      { id: '2', title: 'Card 2', category: 'NPCs', elements: [] },
      { id: '3', title: 'Card 3', category: 'PCs', elements: [] }
    ]))
    
    const { result } = renderHook(() => useCards())
    
    const pcCards = result.current.getCardsByCategory('PCs')
    expect(pcCards).toHaveLength(2)
  })

  it('should get card count by category', () => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify([
      { id: '1', category: 'PCs', elements: [] },
      { id: '2', category: 'NPCs', elements: [] },
      { id: '3', category: 'PCs', elements: [] }
    ]))
    
    const { result } = renderHook(() => useCards())
    
    expect(result.current.getCardCountByCategory('PCs')).toBe(2)
    expect(result.current.getCardCountByCategory('NPCs')).toBe(1)
    expect(result.current.getCardCountByCategory('Scenes')).toBe(0)
  })

  it('should move card to different category', () => {
    const { result } = renderHook(() => useCards())
    const cardId = result.current.cards[0].id
    
    act(() => {
      result.current.moveCardToCategory(cardId, 'NPCs', '#0000ff')
    })

    expect(result.current.cards[0].category).toBe('NPCs')
    expect(result.current.cards[0].color).toBe('#0000ff')
  })

  it('should reset cards', () => {
    const { result } = renderHook(() => useCards())
    
    act(() => {
      result.current.resetCards()
    })

    expect(result.current.cards).toEqual([])
  })

  it('should import valid cards', () => {
    const { result } = renderHook(() => useCards())
    const toImport = [
      { id: 'a', title: 'Imported 1', category: 'PCs', elements: [] },
      { id: 'b', title: 'Imported 2', category: 'NPCs', elements: [] }
    ]
    
    let importResult
    act(() => {
      importResult = result.current.importCards(toImport)
    })

    expect(importResult.success).toBe(true)
    expect(importResult.count).toBe(2)
    expect(result.current.cards).toHaveLength(2)
  })

  it('should persist cards to localStorage', () => {
    const { result } = renderHook(() => useCards())
    
    act(() => {
      result.current.addCard('PCs')
    })

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARDS))
    expect(saved.find(c => c.title === 'New Card')).toBeDefined()
  })

  it('should ensure duplicated card elements have new IDs', () => {
    const { result } = renderHook(() => useCards())
    const original = result.current.cards[0]
    
    act(() => {
      result.current.duplicateCard(original)
    })

    const duplicate = result.current.cards.find(c => c.title.includes('(Copy)'))
    
    original.elements.forEach((origEl, index) => {
      expect(duplicate.elements[index].id).not.toBe(origEl.id)
    })
  })
})
```

**Verification**:
- [ ] Hook file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/hooks/index.js`

---

### Task 1.7: Update hooks/index.js with All Exports

**File**: `src/hooks/index.js`

```javascript
// Custom hooks barrel export
export { useLocalStorage, useLocalStorageRemove } from './useLocalStorage'
export { useTheme } from './useTheme'
export { useSkills } from './useSkills'
export { useSkillLevels } from './useSkillLevels'
export { useCategories } from './useCategories'
export { useCards } from './useCards'
```

**Verification**:
- [ ] All hooks exported
- [ ] Can import with `import { useTheme, useCards } from './hooks'`

---

### Task 1.8: Integration Test for All Hooks

**Purpose**: Verify hooks work together correctly

**File**: `src/hooks/integration.test.js`

```javascript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useCards } from './useCards'
import { useCategories } from './useCategories'
import { useSkills } from './useSkills'
import { useSkillLevels } from './useSkillLevels'
import { useTheme } from './useTheme'

describe('Hooks Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should allow cards hook to use category colors', () => {
    const { result: categoriesResult } = renderHook(() => useCategories())
    const { result: cardsResult } = renderHook(() => 
      useCards({ getCategoryColor: categoriesResult.current.getCategoryColorWithDefaults })
    )
    
    act(() => {
      cardsResult.current.addCard('PCs')
    })

    const newCard = cardsResult.current.cards.find(c => c.title === 'New Card')
    expect(newCard.color).toBe('#c53030') // PCs default color
  })

  it('should correctly check card count before deleting category', () => {
    const { result: categoriesResult } = renderHook(() => useCategories())
    const { result: cardsResult } = renderHook(() => 
      useCards({ getCategoryColor: categoriesResult.current.getCategoryColorWithDefaults })
    )
    
    // Add a card to PCs
    act(() => {
      cardsResult.current.addCard('PCs')
    })

    // Try to delete PCs category
    const cardCount = cardsResult.current.getCardCountByCategory('PCs')
    
    let deleteResult
    act(() => {
      deleteResult = categoriesResult.current.deleteCategory('PCs', cardCount)
    })

    expect(deleteResult.success).toBe(false)
    expect(categoriesResult.current.categories).toContain('PCs')
  })

  it('should allow all hooks to initialize independently', () => {
    const { result: theme } = renderHook(() => useTheme())
    const { result: skills } = renderHook(() => useSkills())
    const { result: skillLevels } = renderHook(() => useSkillLevels())
    const { result: categories } = renderHook(() => useCategories())
    const { result: cards } = renderHook(() => useCards())

    expect(theme.current.isLoaded).toBe(true)
    expect(skills.current.isLoaded).toBe(true)
    expect(skillLevels.current.isLoaded).toBe(true)
    expect(categories.current.isLoaded).toBe(true)
    expect(cards.current.isLoaded).toBe(true)
  })

  it('should persist all hook data to localStorage', () => {
    const { result: theme } = renderHook(() => useTheme())
    const { result: skills } = renderHook(() => useSkills())
    const { result: categories } = renderHook(() => useCategories())

    act(() => {
      theme.current.cycleThemeMode()
      skills.current.addSkill('Custom Skill')
      categories.current.addCategory('Custom Category')
    })

    // Verify all saved to localStorage
    expect(localStorage.getItem('fate-thememode')).toBeDefined()
    expect(JSON.parse(localStorage.getItem('fate-skills'))).toContain('Custom Skill')
    expect(JSON.parse(localStorage.getItem('fate-categories'))).toContain('Custom Category')
  })
})
```

**Verification**:
- [ ] Integration test file created
- [ ] `npm test` passes for integration tests

---

## Phase 2: Modal Component Extraction

### Overview

Extract inline modal JSX from App.jsx into separate components. Each modal becomes a controlled component receiving state and callbacks as props.

---

### Task 2.1: Create TemplateModal Component

**Purpose**: Extract card template selection modal

**Source Lines in App.jsx**: 628-706

**File**: `src/components/modals/TemplateModal.jsx`

```javascript
import { useState } from 'react'
import './TemplateModal.css'

/**
 * Modal for selecting a card template and category when creating new cards
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {Array<string>} props.categories - Available categories
 * @param {Function} props.onCreateCard - Called with (category, templateKey) when card created
 * @param {string} props.defaultCategory - Initially selected category
 */
function TemplateModal({ 
  isOpen, 
  onClose, 
  categories, 
  onCreateCard,
  defaultCategory = ''
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || categories[0] || '')

  // Reset state when modal opens
  const handleOpen = () => {
    setSelectedTemplate('')
    setSelectedCategory(defaultCategory || categories[0] || '')
  }

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle create button
  const handleCreate = () => {
    if (!selectedTemplate || !selectedCategory) {
      alert('Please select both a template and a category.')
      return
    }
    onCreateCard(selectedCategory, selectedTemplate)
    onClose()
  }

  if (!isOpen) return null

  const templates = [
    {
      key: 'standard-pc',
      icon: '👤',
      title: 'Standard PC',
      description: 'Full character sheet with all Fate Core elements'
    },
    {
      key: 'quick-npc',
      icon: '🎭',
      title: 'Quick NPC',
      description: 'Simplified character for NPCs and minor characters'
    },
    {
      key: 'scene',
      icon: '🏛️',
      title: 'Scene',
      description: 'Location or situation aspects and description'
    },
    {
      key: 'blank',
      icon: '📄',
      title: 'Blank Card',
      description: 'Empty card, build your own'
    }
  ]

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Card</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="template-selection">
          <div className="template-options">
            {templates.map(template => (
              <div
                key={template.key}
                onClick={() => setSelectedTemplate(template.key)}
                className={`template-option ${selectedTemplate === template.key ? 'selected' : ''}`}
              >
                <div className="template-icon">{template.icon}</div>
                <div className="template-info">
                  <h4>{template.title}</h4>
                  <p>{template.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="template-controls">
            <div className="category-selector">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreate}
              className="add-template-btn"
              disabled={!selectedTemplate || !selectedCategory}
            >
              Add Card
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateModal
```

**File**: `src/components/modals/TemplateModal.css`

```css
/* Template modal styles - extracted from App.css */
/* Copy relevant .template-* and .category-* styles here */
```

**Test File**: `src/components/modals/TemplateModal.test.jsx`

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TemplateModal from './TemplateModal'

describe('TemplateModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    categories: ['PCs', 'NPCs', 'Scenes'],
    onCreateCard: vi.fn(),
    defaultCategory: 'PCs'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<TemplateModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Add Card')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<TemplateModal {...defaultProps} />)
    expect(screen.getByText('Add Card')).toBeInTheDocument()
  })

  it('should display all template options', () => {
    render(<TemplateModal {...defaultProps} />)
    expect(screen.getByText('Standard PC')).toBeInTheDocument()
    expect(screen.getByText('Quick NPC')).toBeInTheDocument()
    expect(screen.getByText('Scene')).toBeInTheDocument()
    expect(screen.getByText('Blank Card')).toBeInTheDocument()
  })

  it('should display category dropdown with all categories', () => {
    render(<TemplateModal {...defaultProps} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('PCs')
    
    defaultProps.categories.forEach(cat => {
      expect(screen.getByRole('option', { name: cat })).toBeInTheDocument()
    })
  })

  it('should call onClose when close button clicked', () => {
    render(<TemplateModal {...defaultProps} />)
    fireEvent.click(screen.getByText('×'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should call onClose when backdrop clicked', () => {
    render(<TemplateModal {...defaultProps} />)
    fireEvent.click(screen.getByClassName('modal-overlay'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should select template when clicked', () => {
    render(<TemplateModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Standard PC'))
    expect(screen.getByText('Standard PC').closest('.template-option')).toHaveClass('selected')
  })

  it('should call onCreateCard with correct params when Add Card clicked', () => {
    render(<TemplateModal {...defaultProps} />)
    
    // Select a template
    fireEvent.click(screen.getByText('Standard PC'))
    
    // Change category
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'NPCs' } })
    
    // Click add
    fireEvent.click(screen.getByText('Add Card'))
    
    expect(defaultProps.onCreateCard).toHaveBeenCalledWith('NPCs', 'standard-pc')
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should disable Add Card button when no template selected', () => {
    render(<TemplateModal {...defaultProps} />)
    expect(screen.getByText('Add Card')).toBeDisabled()
  })

  it('should enable Add Card button when template and category selected', () => {
    render(<TemplateModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Standard PC'))
    expect(screen.getByText('Add Card')).not.toBeDisabled()
  })
})
```

**Verification**:
- [ ] Component file created
- [ ] CSS file created (extract from App.css)
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/modals/index.js`

---

### Task 2.2: Create CategoryModal Component

**Purpose**: Extract add category modal

**Source Lines in App.jsx**: 708-738

**File**: `src/components/modals/CategoryModal.jsx`

```javascript
import { useState, useEffect, useRef } from 'react'

/**
 * Modal for adding a new category
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {Function} props.onAddCategory - Called with category name when added
 */
function CategoryModal({ isOpen, onClose, onAddCategory }) {
  const [categoryName, setCategoryName] = useState('')
  const inputRef = useRef(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCategoryName('')
    }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSubmit = () => {
    const trimmed = categoryName.trim()
    if (!trimmed) return

    const result = onAddCategory(trimmed)
    if (result !== false) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content small-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Category</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <input
            ref={inputRef}
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter category name..."
            className="category-input"
          />
          <div className="modal-actions">
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="confirm-btn"
              disabled={!categoryName.trim()}
            >
              Add Category
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryModal
```

**Test File**: `src/components/modals/CategoryModal.test.jsx`

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CategoryModal from './CategoryModal'

describe('CategoryModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onAddCategory: vi.fn().mockReturnValue(true)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<CategoryModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Add New Category')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<CategoryModal {...defaultProps} />)
    expect(screen.getByText('Add New Category')).toBeInTheDocument()
  })

  it('should focus input on open', () => {
    render(<CategoryModal {...defaultProps} />)
    expect(screen.getByPlaceholderText('Enter category name...')).toHaveFocus()
  })

  it('should call onClose when close button clicked', () => {
    render(<CategoryModal {...defaultProps} />)
    fireEvent.click(screen.getByText('×'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should call onClose when Cancel clicked', () => {
    render(<CategoryModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should call onAddCategory with trimmed name', () => {
    render(<CategoryModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter category name...'), {
      target: { value: '  New Category  ' }
    })
    fireEvent.click(screen.getByText('Add Category'))
    
    expect(defaultProps.onAddCategory).toHaveBeenCalledWith('New Category')
  })

  it('should close modal after successful add', () => {
    render(<CategoryModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter category name...'), {
      target: { value: 'New Category' }
    })
    fireEvent.click(screen.getByText('Add Category'))
    
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should not close modal if onAddCategory returns false', () => {
    const props = {
      ...defaultProps,
      onAddCategory: vi.fn().mockReturnValue(false)
    }
    render(<CategoryModal {...props} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter category name...'), {
      target: { value: 'Duplicate' }
    })
    fireEvent.click(screen.getByText('Add Category'))
    
    expect(props.onClose).not.toHaveBeenCalled()
  })

  it('should submit on Enter key', () => {
    render(<CategoryModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter category name...')
    fireEvent.change(input, { target: { value: 'New Category' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(defaultProps.onAddCategory).toHaveBeenCalledWith('New Category')
  })

  it('should disable Add button when input is empty', () => {
    render(<CategoryModal {...defaultProps} />)
    expect(screen.getByText('Add Category')).toBeDisabled()
  })

  it('should enable Add button when input has text', () => {
    render(<CategoryModal {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Enter category name...'), {
      target: { value: 'Category' }
    })
    expect(screen.getByText('Add Category')).not.toBeDisabled()
  })
})
```

**Verification**:
- [ ] Component file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/modals/index.js`

---

### Task 2.3: Create SkillsAdminModal Component

**Purpose**: Extract skills management modal

**Source Lines in App.jsx**: 740-778

**File**: `src/components/modals/SkillsAdminModal.jsx`

```javascript
import { useState, useEffect } from 'react'

/**
 * Modal for managing the skills list
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {Array<string>} props.skills - Current skills list
 * @param {Function} props.onAddSkill - Called with skill name to add
 * @param {Function} props.onDeleteSkill - Called with skill name to delete
 */
function SkillsAdminModal({ 
  isOpen, 
  onClose, 
  skills, 
  onAddSkill, 
  onDeleteSkill 
}) {
  const [newSkillName, setNewSkillName] = useState('')

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewSkillName('')
    }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleAdd = () => {
    const trimmed = newSkillName.trim()
    if (!trimmed) return

    const result = onAddSkill(trimmed)
    if (result !== false) {
      setNewSkillName('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  const handleDelete = (skillName) => {
    if (window.confirm(`Are you sure you want to delete the skill "${skillName}"?`)) {
      onDeleteSkill(skillName)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Skills</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="skills-admin-body">
          <p className="skills-admin-description">
            These skills are available for all characters. Add custom skills for your game setting.
          </p>
          <div className="skills-list">
            {skills.map(skill => (
              <div key={skill} className="skill-list-item">
                <span>{skill}</span>
                <button
                  onClick={() => handleDelete(skill)}
                  className="skill-list-delete"
                  title="Delete skill"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="add-skill-section">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new skill name..."
              className="skill-input"
            />
            <button 
              onClick={handleAdd} 
              className="add-skill-btn"
              disabled={!newSkillName.trim()}
            >
              Add Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillsAdminModal
```

**Test File**: `src/components/modals/SkillsAdminModal.test.jsx`

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SkillsAdminModal from './SkillsAdminModal'

describe('SkillsAdminModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    skills: ['Athletics', 'Burglary', 'Contacts'],
    onAddSkill: vi.fn().mockReturnValue(true),
    onDeleteSkill: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<SkillsAdminModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Manage Skills')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    expect(screen.getByText('Manage Skills')).toBeInTheDocument()
  })

  it('should display all skills', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    defaultProps.skills.forEach(skill => {
      expect(screen.getByText(skill)).toBeInTheDocument()
    })
  })

  it('should call onAddSkill when adding skill', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter new skill name...'), {
      target: { value: 'New Skill' }
    })
    fireEvent.click(screen.getByText('Add Skill'))
    
    expect(defaultProps.onAddSkill).toHaveBeenCalledWith('New Skill')
  })

  it('should clear input after successful add', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter new skill name...')
    fireEvent.change(input, { target: { value: 'New Skill' } })
    fireEvent.click(screen.getByText('Add Skill'))
    
    expect(input).toHaveValue('')
  })

  it('should call onDeleteSkill with confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<SkillsAdminModal {...defaultProps} />)
    
    const deleteButtons = screen.getAllByTitle('Delete skill')
    fireEvent.click(deleteButtons[0])
    
    expect(window.confirm).toHaveBeenCalled()
    expect(defaultProps.onDeleteSkill).toHaveBeenCalledWith('Athletics')
  })

  it('should not delete if confirmation cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<SkillsAdminModal {...defaultProps} />)
    
    const deleteButtons = screen.getAllByTitle('Delete skill')
    fireEvent.click(deleteButtons[0])
    
    expect(defaultProps.onDeleteSkill).not.toHaveBeenCalled()
  })

  it('should add skill on Enter key', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Enter new skill name...')
    fireEvent.change(input, { target: { value: 'New Skill' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(defaultProps.onAddSkill).toHaveBeenCalledWith('New Skill')
  })

  it('should disable Add button when input is empty', () => {
    render(<SkillsAdminModal {...defaultProps} />)
    expect(screen.getByText('Add Skill')).toBeDisabled()
  })
})
```

**Verification**:
- [ ] Component file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/modals/index.js`

---

### Task 2.4: Create SkillLevelsAdminModal Component

**Purpose**: Extract skill levels management modal

**Source Lines in App.jsx**: 780-824

**File**: `src/components/modals/SkillLevelsAdminModal.jsx`

```javascript
import { useState, useEffect } from 'react'

/**
 * Modal for managing skill levels (the Fate ladder)
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {Array} props.skillLevels - Current skill levels [{label, value}, ...]
 * @param {Function} props.onAddLevelAtTop - Called with label to add at top
 * @param {Function} props.onAddLevelAtBottom - Called with label to add at bottom
 * @param {Function} props.onDeleteLevel - Called with value to delete
 * @param {Function} props.onUpdateLabel - Called with (value, newLabel) to update
 */
function SkillLevelsAdminModal({ 
  isOpen, 
  onClose, 
  skillLevels,
  onAddLevelAtTop,
  onAddLevelAtBottom,
  onDeleteLevel,
  onUpdateLabel
}) {
  const [newLevelName, setNewLevelName] = useState('')

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewLevelName('')
    }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleAddTop = () => {
    const trimmed = newLevelName.trim()
    if (!trimmed) return

    const result = onAddLevelAtTop(trimmed)
    if (result !== false) {
      setNewLevelName('')
    }
  }

  const handleAddBottom = () => {
    const trimmed = newLevelName.trim()
    if (!trimmed) return

    const result = onAddLevelAtBottom(trimmed)
    if (result !== false) {
      setNewLevelName('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTop()
    }
  }

  const handleDelete = (level) => {
    if (window.confirm(`Are you sure you want to delete the skill level "${level.label}"?`)) {
      onDeleteLevel(level.value)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Skill Levels</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="skills-admin-body">
          <p className="skills-admin-description">
            These skill levels (the ladder) are used throughout your game. The numbers are automatically assigned.
          </p>
          <div className="skills-list">
            {skillLevels.map(level => (
              <div key={level.value} className="skill-level-admin-item">
                <span className="skill-level-value">
                  {level.value >= 0 ? '+' : ''}{level.value}
                </span>
                <input
                  type="text"
                  value={level.label}
                  onChange={(e) => onUpdateLabel(level.value, e.target.value)}
                  className="skill-level-label-edit"
                />
                <button
                  onClick={() => handleDelete(level)}
                  className="skill-list-delete"
                  title="Delete skill level"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="add-skill-section">
            <input
              type="text"
              value={newLevelName}
              onChange={(e) => setNewLevelName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new skill level name..."
              className="skill-input"
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleAddTop} 
                className="add-skill-btn"
                disabled={!newLevelName.trim()}
              >
                Add to Top
              </button>
              <button 
                onClick={handleAddBottom} 
                className="add-skill-btn"
                disabled={!newLevelName.trim()}
              >
                Add to Bottom
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillLevelsAdminModal
```

**Test File**: `src/components/modals/SkillLevelsAdminModal.test.jsx`

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SkillLevelsAdminModal from './SkillLevelsAdminModal'

describe('SkillLevelsAdminModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    skillLevels: [
      { label: 'Superb', value: 5 },
      { label: 'Great', value: 4 },
      { label: 'Good', value: 3 }
    ],
    onAddLevelAtTop: vi.fn().mockReturnValue(true),
    onAddLevelAtBottom: vi.fn().mockReturnValue(true),
    onDeleteLevel: vi.fn(),
    onUpdateLabel: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<SkillLevelsAdminModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Manage Skill Levels')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    expect(screen.getByText('Manage Skill Levels')).toBeInTheDocument()
  })

  it('should display all skill levels with formatted values', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    expect(screen.getByText('+5')).toBeInTheDocument()
    expect(screen.getByText('+4')).toBeInTheDocument()
    expect(screen.getByText('+3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Superb')).toBeInTheDocument()
  })

  it('should call onAddLevelAtTop when Add to Top clicked', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter new skill level name...'), {
      target: { value: 'Epic' }
    })
    fireEvent.click(screen.getByText('Add to Top'))
    
    expect(defaultProps.onAddLevelAtTop).toHaveBeenCalledWith('Epic')
  })

  it('should call onAddLevelAtBottom when Add to Bottom clicked', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    fireEvent.change(screen.getByPlaceholderText('Enter new skill level name...'), {
      target: { value: 'Terrible' }
    })
    fireEvent.click(screen.getByText('Add to Bottom'))
    
    expect(defaultProps.onAddLevelAtBottom).toHaveBeenCalledWith('Terrible')
  })

  it('should call onUpdateLabel when label edited', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const labelInput = screen.getByDisplayValue('Superb')
    fireEvent.change(labelInput, { target: { value: 'Legendary' } })
    
    expect(defaultProps.onUpdateLabel).toHaveBeenCalledWith(5, 'Legendary')
  })

  it('should call onDeleteLevel with confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<SkillLevelsAdminModal {...defaultProps} />)
    
    const deleteButtons = screen.getAllByTitle('Delete skill level')
    fireEvent.click(deleteButtons[0])
    
    expect(window.confirm).toHaveBeenCalled()
    expect(defaultProps.onDeleteLevel).toHaveBeenCalledWith(5)
  })

  it('should disable Add buttons when input is empty', () => {
    render(<SkillLevelsAdminModal {...defaultProps} />)
    expect(screen.getByText('Add to Top')).toBeDisabled()
    expect(screen.getByText('Add to Bottom')).toBeDisabled()
  })

  it('should format negative values correctly', () => {
    const propsWithNegative = {
      ...defaultProps,
      skillLevels: [{ label: 'Terrible', value: -2 }]
    }
    render(<SkillLevelsAdminModal {...propsWithNegative} />)
    expect(screen.getByText('-2')).toBeInTheDocument()
  })
})
```

**Verification**:
- [ ] Component file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/modals/index.js`

---

### Task 2.5: Update Modal Index File

**File**: `src/components/modals/index.js`

```javascript
// Modal components barrel export
export { default as TemplateModal } from './TemplateModal'
export { default as CategoryModal } from './CategoryModal'
export { default as SkillsAdminModal } from './SkillsAdminModal'
export { default as SkillLevelsAdminModal } from './SkillLevelsAdminModal'
```

**Verification**:
- [ ] All modals exported
- [ ] Can import with `import { TemplateModal, CategoryModal } from './components/modals'`

---

## Phase 3: Element Component Extraction

### Overview

Extract element rendering from Card.jsx's `renderElement` function into separate components. Each element becomes a self-contained component.

---

### Task 3.1: Create Base Element Wrapper Component

**Purpose**: Shared wrapper for all element types with common header/delete functionality

**File**: `src/components/elements/ElementWrapper.jsx`

```javascript
/**
 * Wrapper component providing common element structure
 * Includes header with title and delete button
 * 
 * @param {Object} props
 * @param {string} props.title - Element title (e.g., "High Concept")
 * @param {React.ReactNode} props.children - Element content
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onDelete - Called when delete button clicked
 * @param {React.ReactNode} props.headerExtra - Extra content for header (optional)
 */
function ElementWrapper({ 
  title, 
  children, 
  isLocked, 
  onDelete,
  headerExtra = null,
  className = ''
}) {
  return (
    <div className={`card-element ${isLocked ? 'locked' : ''} ${className}`}>
      <div className="element-header">
        <h4>{title}</h4>
        {headerExtra}
        {!isLocked && onDelete && (
          <button 
            onClick={onDelete}
            className="element-delete-btn"
          >
            ×
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export default ElementWrapper
```

**Verification**:
- [ ] Component file created
- [ ] Export added to `src/components/elements/index.js`

---

### Task 3.2: Create HighConceptElement Component

**Purpose**: Extract high concept rendering

**Source Lines in Card.jsx**: 88-115

**File**: `src/components/elements/HighConceptElement.jsx`

```javascript
import ElementWrapper from './ElementWrapper'

/**
 * High Concept element renderer
 * Single text field for character's core concept
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, text}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 */
function HighConceptElement({ element, isLocked, onUpdate, onDelete }) {
  const handleTextChange = (e) => {
    onUpdate({ text: e.target.value })
  }

  return (
    <ElementWrapper 
      title="High Concept" 
      isLocked={isLocked} 
      onDelete={onDelete}
    >
      <input
        type="text"
        value={element.text}
        onChange={handleTextChange}
        placeholder="Enter high concept..."
        className="element-input"
        disabled={isLocked}
      />
    </ElementWrapper>
  )
}

export default HighConceptElement
```

**Test File**: `src/components/elements/HighConceptElement.test.jsx`

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HighConceptElement from './HighConceptElement'

describe('HighConceptElement', () => {
  const defaultProps = {
    element: { id: '1', type: 'high-concept', text: 'Test Concept' },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render with element text', () => {
    render(<HighConceptElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Test Concept')).toBeInTheDocument()
  })

  it('should render title', () => {
    render(<HighConceptElement {...defaultProps} />)
    expect(screen.getByText('High Concept')).toBeInTheDocument()
  })

  it('should call onUpdate when text changes', () => {
    render(<HighConceptElement {...defaultProps} />)
    
    fireEvent.change(screen.getByDisplayValue('Test Concept'), {
      target: { value: 'New Concept' }
    })
    
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ text: 'New Concept' })
  })

  it('should disable input when locked', () => {
    render(<HighConceptElement {...defaultProps} isLocked={true} />)
    expect(screen.getByDisplayValue('Test Concept')).toBeDisabled()
  })

  it('should hide delete button when locked', () => {
    render(<HighConceptElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByText('×')).not.toBeInTheDocument()
  })

  it('should show delete button when unlocked', () => {
    render(<HighConceptElement {...defaultProps} />)
    expect(screen.getByText('×')).toBeInTheDocument()
  })

  it('should call onDelete when delete clicked', () => {
    render(<HighConceptElement {...defaultProps} />)
    fireEvent.click(screen.getByText('×'))
    expect(defaultProps.onDelete).toHaveBeenCalled()
  })
})
```

**Verification**:
- [ ] Component file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/elements/index.js`

---

### Task 3.3: Create TroubleElement Component

**Purpose**: Extract trouble rendering (nearly identical to HighConcept)

**Source Lines in Card.jsx**: 116-142

**File**: `src/components/elements/TroubleElement.jsx`

```javascript
import ElementWrapper from './ElementWrapper'

/**
 * Trouble element renderer
 * Single text field for character's trouble aspect
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, text}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 */
function TroubleElement({ element, isLocked, onUpdate, onDelete }) {
  const handleTextChange = (e) => {
    onUpdate({ text: e.target.value })
  }

  return (
    <ElementWrapper 
      title="Trouble" 
      isLocked={isLocked} 
      onDelete={onDelete}
    >
      <input
        type="text"
        value={element.text}
        onChange={handleTextChange}
        placeholder="Enter trouble..."
        className="element-input"
        disabled={isLocked}
      />
    </ElementWrapper>
  )
}

export default TroubleElement
```

**Verification**:
- [ ] Component file created
- [ ] Test file created (similar to HighConceptElement)
- [ ] Export added to `src/components/elements/index.js`

---

### Task 3.4: Create AspectsElement Component

**Purpose**: Extract aspects list rendering

**Source Lines in Card.jsx**: 143-189

**File**: `src/components/elements/AspectsElement.jsx`

```javascript
import ElementWrapper from './ElementWrapper'

/**
 * Aspects element renderer
 * Dynamic list of aspect text fields
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, items: string[]}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 */
function AspectsElement({ element, isLocked, onUpdate, onDelete }) {
  const handleItemChange = (index, value) => {
    const newItems = [...element.items]
    newItems[index] = value
    onUpdate({ items: newItems })
  }

  const handleDeleteItem = (index) => {
    const newItems = element.items.filter((_, i) => i !== index)
    onUpdate({ items: newItems })
  }

  const handleAddItem = () => {
    onUpdate({ items: [...element.items, ''] })
  }

  return (
    <ElementWrapper 
      title="Aspects" 
      isLocked={isLocked} 
      onDelete={onDelete}
    >
      {element.items.map((item, index) => (
        <div key={index} className="aspect-item">
          <span className="aspect-bullet">📋</span>
          <input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder="---"
            className="element-input"
            disabled={isLocked}
          />
          {!isLocked && (
            <button
              onClick={() => handleDeleteItem(index)}
              className="aspect-delete-btn"
            >
              ×
            </button>
          )}
        </div>
      ))}
      {!isLocked && (
        <button onClick={handleAddItem} className="add-item-btn">
          + Add Aspect
        </button>
      )}
    </ElementWrapper>
  )
}

export default AspectsElement
```

**Test File**: `src/components/elements/AspectsElement.test.jsx`

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AspectsElement from './AspectsElement'

describe('AspectsElement', () => {
  const defaultProps = {
    element: { id: '1', type: 'aspects', items: ['Aspect 1', 'Aspect 2'] },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render all aspect items', () => {
    render(<AspectsElement {...defaultProps} />)
    expect(screen.getByDisplayValue('Aspect 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Aspect 2')).toBeInTheDocument()
  })

  it('should call onUpdate when aspect text changes', () => {
    render(<AspectsElement {...defaultProps} />)
    
    fireEvent.change(screen.getByDisplayValue('Aspect 1'), {
      target: { value: 'Updated Aspect' }
    })
    
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({
      items: ['Updated Aspect', 'Aspect 2']
    })
  })

  it('should add new aspect when add button clicked', () => {
    render(<AspectsElement {...defaultProps} />)
    
    fireEvent.click(screen.getByText('+ Add Aspect'))
    
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({
      items: ['Aspect 1', 'Aspect 2', '']
    })
  })

  it('should delete aspect when delete button clicked', () => {
    render(<AspectsElement {...defaultProps} />)
    
    const deleteButtons = screen.getAllByText('×').filter(
      btn => btn.classList.contains('aspect-delete-btn')
    )
    fireEvent.click(deleteButtons[0])
    
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({
      items: ['Aspect 2']
    })
  })

  it('should hide add/delete buttons when locked', () => {
    render(<AspectsElement {...defaultProps} isLocked={true} />)
    expect(screen.queryByText('+ Add Aspect')).not.toBeInTheDocument()
  })

  it('should disable inputs when locked', () => {
    render(<AspectsElement {...defaultProps} isLocked={true} />)
    expect(screen.getByDisplayValue('Aspect 1')).toBeDisabled()
    expect(screen.getByDisplayValue('Aspect 2')).toBeDisabled()
  })
})
```

**Verification**:
- [ ] Component file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/elements/index.js`

---

### Task 3.5: Create NoteElement Component

**Purpose**: Extract note/textarea rendering

**Source Lines in Card.jsx**: 545-571

**File**: `src/components/elements/NoteElement.jsx`

```javascript
import ElementWrapper from './ElementWrapper'

/**
 * Note element renderer
 * Multi-line text area for notes
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, text}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 */
function NoteElement({ element, isLocked, onUpdate, onDelete }) {
  const handleTextChange = (e) => {
    onUpdate({ text: e.target.value })
  }

  return (
    <ElementWrapper 
      title="Note" 
      isLocked={isLocked} 
      onDelete={onDelete}
    >
      <textarea
        value={element.text}
        onChange={handleTextChange}
        placeholder="Enter notes..."
        className="element-textarea"
        rows="4"
        disabled={isLocked}
      />
    </ElementWrapper>
  )
}

export default NoteElement
```

**Verification**:
- [ ] Component file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/elements/index.js`

---

### Task 3.6: Create FatePointsElement Component

**Purpose**: Extract fate points rendering

**Source Lines in Card.jsx**: 572-637

**File**: `src/components/elements/FatePointsElement.jsx`

```javascript
import ElementWrapper from './ElementWrapper'

/**
 * Fate Points element renderer
 * Visual fate point tracker with refresh value
 * 
 * @param {Object} props
 * @param {Object} props.element - Element data {id, type, current, refresh}
 * @param {boolean} props.isLocked - Whether card is locked
 * @param {Function} props.onUpdate - Called with updates object
 * @param {Function} props.onDelete - Called to delete element
 */
function FatePointsElement({ element, isLocked, onUpdate, onDelete }) {
  const handleDecrement = () => {
    onUpdate({ current: Math.max(0, element.current - 1) })
  }

  const handleIncrement = () => {
    onUpdate({ current: element.current + 1 })
  }

  const handleRefreshChange = (e) => {
    const value = Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
    onUpdate({ refresh: value })
  }

  // Render fate point tokens
  const renderTokens = () => {
    const tokens = []
    const filled = Math.min(element.current, element.refresh)
    const empty = Math.max(0, element.refresh - element.current)
    const extra = Math.max(0, element.current - element.refresh)

    // Filled tokens up to refresh
    for (let i = 0; i < filled; i++) {
      tokens.push(
        <div 
          key={`filled-${i}`}
          className="fate-point filled"
          onClick={isLocked ? handleDecrement : undefined}
          style={isLocked ? { cursor: 'pointer' } : undefined}
        >
          ●
        </div>
      )
    }

    // Empty tokens up to refresh
    for (let i = 0; i < empty; i++) {
      tokens.push(
        <div key={`empty-${i}`} className="fate-point empty">○</div>
      )
    }

    // Extra tokens beyond refresh
    for (let i = 0; i < extra; i++) {
      tokens.push(
        <div 
          key={`extra-${i}`}
          className="fate-point filled"
          onClick={isLocked ? handleDecrement : undefined}
          style={isLocked ? { cursor: 'pointer' } : undefined}
        >
          ●
        </div>
      )
    }

    return tokens
  }

  const headerExtra = isLocked ? (
    <span className="refresh-label">Refresh {element.refresh}</span>
  ) : null

  return (
    <ElementWrapper 
      title="Fate Points" 
      isLocked={isLocked} 
      onDelete={onDelete}
      headerExtra={headerExtra}
    >
      <div className="fate-points">
        {renderTokens()}
      </div>
      {!isLocked && (
        <div className="fate-points-controls">
          <button onClick={handleDecrement}>-</button>
          <span>{element.current} / </span>
          <input
            type="number"
            min="0"
            max="10"
            value={element.refresh}
            onChange={handleRefreshChange}
            className="refresh-input"
          />
          <button onClick={handleIncrement}>+</button>
        </div>
      )}
    </ElementWrapper>
  )
}

export default FatePointsElement
```

**Test File**: `src/components/elements/FatePointsElement.test.jsx`

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FatePointsElement from './FatePointsElement'

describe('FatePointsElement', () => {
  const defaultProps = {
    element: { id: '1', type: 'fate-points', current: 3, refresh: 3 },
    isLocked: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn()
  }

  it('should render correct number of fate point tokens', () => {
    render(<FatePointsElement {...defaultProps} />)
    const filled = screen.getAllByText('●')
    expect(filled).toHaveLength(3)
  })

  it('should decrement current when minus clicked', () => {
    render(<FatePointsElement {...defaultProps} />)
    fireEvent.click(screen.getByText('-'))
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ current: 2 })
  })

  it('should increment current when plus clicked', () => {
    render(<FatePointsElement {...defaultProps} />)
    fireEvent.click(screen.getByText('+'))
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ current: 4 })
  })

  it('should update refresh when changed', () => {
    render(<FatePointsElement {...defaultProps} />)
    fireEvent.change(screen.getByDisplayValue('3'), { target: { value: '5' } })
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ refresh: 5 })
  })

  it('should show empty tokens when current < refresh', () => {
    const props = { ...defaultProps, element: { ...defaultProps.element, current: 1 } }
    render(<FatePointsElement {...props} />)
    expect(screen.getAllByText('●')).toHaveLength(1)
    expect(screen.getAllByText('○')).toHaveLength(2)
  })
})
```

**Verification**:
- [ ] Component file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/elements/index.js`

---

### Task 3.7: Create SkillsElement Component

**Purpose**: Extract skills rendering (most complex element)

**Source Lines in Card.jsx**: 190-340 (approximately)

**File**: `src/components/elements/SkillsElement.jsx`

This is the most complex element component. Create separately due to size. See Card.jsx lines 190-340 for full implementation details.

Key features to implement:
- Locked view: compact grouped display by level
- Unlocked view: organized sections by level with skill dropdowns
- Add/remove skill levels
- Add/remove skills within levels
- Integration with skillLevels prop for formatted labels

**Verification**:
- [ ] Component file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/elements/index.js`

---

### Task 3.8: Create StressTracksElement Component

**Purpose**: Extract stress tracks rendering

**Source Lines in Card.jsx**: 341-475 (approximately)

**File**: `src/components/elements/StressTracksElement.jsx`

Key features to implement:
- Multiple named tracks
- Toggleable stress boxes
- Editable box values
- Add/remove boxes per track
- Add/remove tracks
- Track name editing

**Verification**:
- [ ] Component file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/elements/index.js`

---

### Task 3.9: Create ConsequencesElement Component

**Purpose**: Extract consequences rendering

**Source Lines in Card.jsx**: 476-544 (approximately)

**File**: `src/components/elements/ConsequencesElement.jsx`

Key features to implement:
- List of consequence items with label and text
- Editable labels (e.g., "Mild (2)")
- Editable consequence text
- Add/remove consequences

**Verification**:
- [ ] Component file created
- [ ] Test file created
- [ ] `npm test` passes
- [ ] Export added to `src/components/elements/index.js`

---

### Task 3.10: Create Element Index and Registry

**File**: `src/components/elements/index.js`

```javascript
// Element components barrel export
export { default as ElementWrapper } from './ElementWrapper'
export { default as HighConceptElement } from './HighConceptElement'
export { default as TroubleElement } from './TroubleElement'
export { default as AspectsElement } from './AspectsElement'
export { default as SkillsElement } from './SkillsElement'
export { default as StressTracksElement } from './StressTracksElement'
export { default as ConsequencesElement } from './ConsequencesElement'
export { default as NoteElement } from './NoteElement'
export { default as FatePointsElement } from './FatePointsElement'

// Element type to component mapping
import { ELEMENT_TYPES } from '../../constants'

export const ELEMENT_COMPONENTS = {
  [ELEMENT_TYPES.HIGH_CONCEPT]: HighConceptElement,
  [ELEMENT_TYPES.TROUBLE]: TroubleElement,
  [ELEMENT_TYPES.ASPECTS]: AspectsElement,
  [ELEMENT_TYPES.SKILLS]: SkillsElement,
  [ELEMENT_TYPES.STRESS_TRACKS]: StressTracksElement,
  [ELEMENT_TYPES.CONSEQUENCES]: ConsequencesElement,
  [ELEMENT_TYPES.NOTE]: NoteElement,
  [ELEMENT_TYPES.FATE_POINTS]: FatePointsElement
}

/**
 * Get the component for an element type
 * @param {string} type - Element type
 * @returns {React.Component|null} The component or null
 */
export function getElementComponent(type) {
  return ELEMENT_COMPONENTS[type] || null
}
```

**Verification**:
- [ ] All elements exported
- [ ] ELEMENT_COMPONENTS registry created
- [ ] getElementComponent helper works

---

### Task 3.11: Update Card.jsx to Use Element Components

**Purpose**: Replace renderElement switch with component registry

**File**: `src/components/Card.jsx` (refactored)

Replace the ~570 line `renderElement` function with:

```javascript
import { ELEMENT_COMPONENTS } from './elements'

// Inside Card component:
const renderElement = (element) => {
  const ElementComponent = ELEMENT_COMPONENTS[element.type]
  
  if (!ElementComponent) {
    return (
      <div key={element.id} className="card-element">
        <div className="element-header">
          <h4>Unknown Element</h4>
          {!isLocked && (
            <button onClick={() => deleteElement(element.id)} className="element-delete-btn">×</button>
          )}
        </div>
        <p className="card-placeholder">Element type "{element.type}" is not supported.</p>
      </div>
    )
  }

  return (
    <ElementComponent
      key={element.id}
      element={element}
      isLocked={isLocked}
      onUpdate={(updates) => updateElement(element.id, updates)}
      onDelete={() => deleteElement(element.id)}
      skills={skills}
      skillLevels={skillLevels}
    />
  )
}
```

**Verification**:
- [ ] Card.jsx updated to use element components
- [ ] All element types render correctly
- [ ] All interactions work as before
- [ ] Card.jsx reduced from ~835 lines to ~250 lines

---

## Phase 4: State Management Standardization

### Overview

Standardize state management patterns across the application (addresses B.3).

---

### Task 4.1: Update App.jsx to Use Custom Hooks

**Purpose**: Replace inline state management with custom hooks

**File**: `src/App.jsx` (refactored)

```javascript
import { useRef } from 'react'
import './App.css'
import Card from './components/Card'
import ErrorBoundary from './components/ErrorBoundary'
import { 
  TemplateModal, 
  CategoryModal, 
  SkillsAdminModal, 
  SkillLevelsAdminModal 
} from './components/modals'
import { 
  useTheme, 
  useSkills, 
  useSkillLevels, 
  useCategories, 
  useCards 
} from './hooks'

function App() {
  // Custom hooks for state management
  const theme = useTheme()
  const skillsHook = useSkills()
  const skillLevelsHook = useSkillLevels()
  const categoriesHook = useCategories()
  const cardsHook = useCards({ 
    getCategoryColor: categoriesHook.getCategoryColorWithDefaults 
  })

  // Modal visibility state (local - no persistence needed)
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showSkillsAdmin, setShowSkillsAdmin] = useState(false)
  const [showSkillLevelsAdmin, setShowSkillLevelsAdmin] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // File input ref for import
  const fileInputRef = useRef(null)

  // ... rest of component using hook values
}
```

**Verification**:
- [ ] App.jsx uses all custom hooks
- [ ] All state comes from hooks
- [ ] Modal state remains local (no persistence needed)
- [ ] All functionality works as before
- [ ] App.jsx reduced from ~831 lines to ~200 lines

---

### Task 4.2: Standardize All localStorage Access

**Purpose**: Ensure all localStorage uses safeGetJSON/safeSetJSON

**Action**: Audit and update any remaining direct localStorage calls

**Files to check**:
- `src/App.jsx` - line 109 (`localStorage.setItem('fate-thememode', ...)`)
- `src/hooks/useTheme.js` - ensure uses STORAGE_KEYS

**Pattern to enforce**:
```javascript
// For JSON data:
safeSetJSON(STORAGE_KEYS.KEY_NAME, value)
const value = safeGetJSON(STORAGE_KEYS.KEY_NAME, defaultValue)

// For simple strings (only theme mode):
localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode)
localStorage.getItem(STORAGE_KEYS.THEME_MODE)
```

**Verification**:
- [ ] No magic strings in localStorage calls
- [ ] All JSON data uses safeGetJSON/safeSetJSON
- [ ] All keys use STORAGE_KEYS constants

---

## Testing Requirements

### Unit Tests Summary

| Hook/Component | Test File | Test Count |
|----------------|-----------|------------|
| useLocalStorage | useLocalStorage.test.js | 7 |
| useTheme | useTheme.test.js | 8 |
| useSkills | useSkills.test.js | 11 |
| useSkillLevels | useSkillLevels.test.js | 13 |
| useCategories | useCategories.test.js | 14 |
| useCards | useCards.test.js | 13 |
| Hooks Integration | integration.test.js | 4 |
| TemplateModal | TemplateModal.test.jsx | 10 |
| CategoryModal | CategoryModal.test.jsx | 11 |
| SkillsAdminModal | SkillsAdminModal.test.jsx | 9 |
| SkillLevelsAdminModal | SkillLevelsAdminModal.test.jsx | 9 |
| HighConceptElement | HighConceptElement.test.jsx | 7 |
| AspectsElement | AspectsElement.test.jsx | 6 |
| FatePointsElement | FatePointsElement.test.jsx | 5 |
| **Total New Tests** | | **~127** |

### Test Commands

```bash
# Run all tests
npm test

# Run specific hook tests
npm test -- --grep "useTheme"

# Run with coverage
npm test -- --coverage

# Watch mode during development
npm test -- --watch
```

---

## Verification Checklist

### Phase 1 Complete
- [ ] All 6 hooks created and tested
- [ ] hooks/index.js exports all hooks
- [ ] Integration tests pass
- [ ] No localStorage regressions

### Phase 2 Complete
- [ ] All 4 modals extracted
- [ ] modals/index.js exports all modals
- [ ] All modal tests pass
- [ ] Modals work identically to before

### Phase 3 Complete
- [ ] All 8 element components created
- [ ] elements/index.js exports all elements
- [ ] Element registry works
- [ ] Card.jsx reduced to ~250 lines
- [ ] All element interactions work

### Phase 4 Complete
- [ ] App.jsx uses custom hooks
- [ ] App.jsx reduced to ~200 lines
- [ ] All localStorage standardized
- [ ] No B.3 issues remaining

### Final Verification
- [ ] `npm test` - All tests pass
- [ ] `npm run build` - Build succeeds
- [ ] Manual testing - All features work
- [ ] No console errors
- [ ] Bundle size similar or smaller

---

## Rollback Procedures

### If Phase 1 Fails
```bash
# Revert hooks directory
git checkout HEAD -- src/hooks/
# Keep App.jsx unchanged
```

### If Phase 2 Fails
```bash
# Revert modals directory
git checkout HEAD -- src/components/modals/
# Revert App.jsx modal changes only
```

### If Phase 3 Fails
```bash
# Revert elements directory
git checkout HEAD -- src/components/elements/
# Revert Card.jsx
git checkout HEAD -- src/components/Card.jsx
```

### Full Rollback
```bash
# Return to pre-refactoring state
git checkout [pre-refactor-commit-hash]
```

---

## Success Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| App.jsx lines | 831 | ~200 | <300 |
| Card.jsx lines | 835 | ~250 | <300 |
| Total test count | 60 | ~187 | >150 |
| Hook test coverage | 0% | >80% | >80% |
| Component test coverage | 0% | >70% | >70% |
| Build size | 178KB | ~180KB | <200KB |

---

## Timeline Estimate

| Phase | Tasks | Estimated Hours |
|-------|-------|-----------------|
| Phase 1: Hooks | 1.1-1.8 | 6-8 hours |
| Phase 2: Modals | 2.1-2.5 | 4-5 hours |
| Phase 3: Elements | 3.1-3.11 | 6-8 hours |
| Phase 4: Integration | 4.1-4.2 | 2-3 hours |
| Testing & Verification | - | 2-3 hours |
| **Total** | | **20-27 hours** |

---

## Appendix: File Creation Checklist

### Hooks (src/hooks/)
- [ ] `index.js`
- [ ] `useLocalStorage.js`
- [ ] `useLocalStorage.test.js`
- [ ] `useTheme.js`
- [ ] `useTheme.test.js`
- [ ] `useSkills.js`
- [ ] `useSkills.test.js`
- [ ] `useSkillLevels.js`
- [ ] `useSkillLevels.test.js`
- [ ] `useCategories.js`
- [ ] `useCategories.test.js`
- [ ] `useCards.js`
- [ ] `useCards.test.js`
- [ ] `integration.test.js`

### Modals (src/components/modals/)
- [ ] `index.js`
- [ ] `TemplateModal.jsx`
- [ ] `TemplateModal.test.jsx`
- [ ] `TemplateModal.css`
- [ ] `CategoryModal.jsx`
- [ ] `CategoryModal.test.jsx`
- [ ] `SkillsAdminModal.jsx`
- [ ] `SkillsAdminModal.test.jsx`
- [ ] `SkillLevelsAdminModal.jsx`
- [ ] `SkillLevelsAdminModal.test.jsx`

### Elements (src/components/elements/)
- [ ] `index.js`
- [ ] `ElementWrapper.jsx`
- [ ] `HighConceptElement.jsx`
- [ ] `HighConceptElement.test.jsx`
- [ ] `TroubleElement.jsx`
- [ ] `TroubleElement.test.jsx`
- [ ] `AspectsElement.jsx`
- [ ] `AspectsElement.test.jsx`
- [ ] `SkillsElement.jsx`
- [ ] `SkillsElement.test.jsx`
- [ ] `StressTracksElement.jsx`
- [ ] `StressTracksElement.test.jsx`
- [ ] `ConsequencesElement.jsx`
- [ ] `ConsequencesElement.test.jsx`
- [ ] `NoteElement.jsx`
- [ ] `NoteElement.test.jsx`
- [ ] `FatePointsElement.jsx`
- [ ] `FatePointsElement.test.jsx`

---

**Document End**
