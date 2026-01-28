import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCards } from './useCards'
import { useCategories } from './useCategories'
import { useSkills } from './useSkills'
import { useSkillLevels } from './useSkillLevels'
import { useTheme } from './useTheme'

describe('Hooks Integration', () => {
  let mockMediaQuery

  beforeEach(() => {
    localStorage.clear()
    
    // Mock matchMedia for useTheme
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

  it('should allow cards hook to use category colors', () => {
    const { result: categoriesResult } = renderHook(() => useCategories())
    const { result: cardsResult } = renderHook(() => 
      useCards({ getCategoryColor: categoriesResult.current.getCategoryColorWithDefaults })
    )
    
    act(() => {
      cardsResult.current.addCard('PCs')
    })

    const newCard = cardsResult.current.cards.find(c => c.title === 'New Card')
    expect(newCard).toBeDefined()
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