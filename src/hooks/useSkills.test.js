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

  it('should trim imported skills and drop empty entries', () => {
    const { result } = renderHook(() => useSkills())
    const importedSkills = ['  Skill A  ', '', '  ', 'Skill B', '  Skill C ']

    let importResult
    act(() => {
      importResult = result.current.importSkills(importedSkills)
    })

    expect(importResult.success).toBe(true)
    expect(importResult.count).toBe(3)
    expect(result.current.skills).toEqual(['Skill A', 'Skill B', 'Skill C'])
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
