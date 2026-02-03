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
      result.current.addSkillLevelAtTop('Mythical')
    })

    const newLevel = result.current.skillLevels.find(l => l.label === 'Mythical')
    expect(newLevel).toBeDefined()
    expect(newLevel.value).toBe(maxBefore + 1)
    expect(result.current.skillLevels[0].label).toBe('Mythical')
  })

  it('should add skill level at bottom with lowest value', () => {
    const { result } = renderHook(() => useSkillLevels())
    const minBefore = Math.min(...result.current.skillLevels.map(l => l.value))
    
    act(() => {
      result.current.addSkillLevelAtBottom('Abysmal')
    })

    const newLevel = result.current.skillLevels.find(l => l.label === 'Abysmal')
    expect(newLevel).toBeDefined()
    expect(newLevel.value).toBe(minBefore - 1)
    // Should be last in sorted array
    expect(result.current.skillLevels[result.current.skillLevels.length - 1].label).toBe('Abysmal')
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

  it('should reject empty or whitespace-only label updates', () => {
    const { result } = renderHook(() => useSkillLevels())
    const level = result.current.skillLevels[0]

    act(() => {
      result.current.updateSkillLevelLabel(level.value, '   ')
    })

    const updated = result.current.skillLevels.find(l => l.value === level.value)
    expect(updated.label).toBe(level.label)
  })

  it('should reject duplicate label updates after trimming', () => {
    const { result } = renderHook(() => useSkillLevels())
    const target = result.current.skillLevels[0]
    const existing = result.current.skillLevels[1]

    act(() => {
      result.current.updateSkillLevelLabel(target.value, `  ${existing.label}  `)
    })

    const updated = result.current.skillLevels.find(l => l.value === target.value)
    expect(updated.label).toBe(target.label)
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
