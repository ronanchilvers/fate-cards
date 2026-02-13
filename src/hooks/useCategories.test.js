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

  it('should normalize categories loaded from localStorage', () => {
    const saved = [' PCs ', '', 'NPCs', 'PCs', '  ', 'Scenes', 'Scenes']
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(saved))

    const { result } = renderHook(() => useCategories())
    expect(result.current.categories).toEqual(['PCs', 'NPCs', 'Scenes'])
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

  it('should reject renaming to empty or whitespace-only names', () => {
    const { result } = renderHook(() => useCategories())
    const oldName = result.current.categories[0]

    let renameResult
    act(() => {
      renameResult = result.current.renameCategory(oldName, '   ')
    })

    expect(renameResult).toBe(false)
    expect(result.current.categories).toContain(oldName)
  })

  it('should reject renaming to a duplicate category after trimming', () => {
    const { result } = renderHook(() => useCategories())
    const oldName = result.current.categories[0]
    const existing = result.current.categories[1]

    let renameResult
    act(() => {
      renameResult = result.current.renameCategory(oldName, `  ${existing}  `)
    })

    expect(renameResult).toBe(false)
    expect(result.current.categories).toContain(oldName)
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

  it('should trim imported categories and drop empty entries', () => {
    const { result } = renderHook(() => useCategories())
    const imported = ['  Imported 1  ', '', '  ', 'Imported 2', '  Imported 3 ']

    let importResult
    act(() => {
      importResult = result.current.importCategories(imported)
    })

    expect(importResult.success).toBe(true)
    expect(importResult.count).toBe(3)
    expect(result.current.categories).toEqual(['Imported 1', 'Imported 2', 'Imported 3'])
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

  it('should reject invalid category imports', () => {
    const { result } = renderHook(() => useCategories())

    let importResult
    act(() => {
      importResult = result.current.importCategories('not-an-array')
    })

    expect(importResult.success).toBe(false)
    expect(importResult.warning).toBeDefined()
  })

  it('should handle deleting a non-existent category', () => {
    const { result } = renderHook(() => useCategories())

    let deleteResult
    act(() => {
      deleteResult = result.current.deleteCategory('Not a Category', 0)
    })

    expect(deleteResult.success).toBe(true)
  })
})
