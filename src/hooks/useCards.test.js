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

  it('falls back to blank template when template key is invalid', () => {
    const { result } = renderHook(() => useCards())
    
    act(() => {
      result.current.addCardFromTemplate('PCs', 'not-a-template')
    })

    const newCard = result.current.cards.find(c => c.title === 'New Card')
    expect(newCard).toBeDefined()
    expect(newCard.elements).toEqual([])
  })

  it('returns warning for invalid import payloads', () => {
    const { result } = renderHook(() => useCards())
    
    let importResult
    act(() => {
      importResult = result.current.importCards('not-an-array')
    })

    expect(importResult.success).toBe(false)
    expect(importResult.warning).toBeDefined()
  })

  it('reports skipped cards during import', () => {
    const { result } = renderHook(() => useCards())
    const toImport = [
      { id: 'a', title: 'Imported 1', category: 'PCs', elements: [] },
      null,
      { id: 'b', title: 'Imported 2', category: 'NPCs', elements: [] }
    ]
    
    let importResult
    act(() => {
      importResult = result.current.importCards(toImport)
    })

    expect(importResult.success).toBe(true)
    expect(importResult.count).toBe(2)
    expect(importResult.skipped).toBe(1)
    expect(importResult.warning).toContain('invalid cards')
  })

  it('preserves card color when moveCardToCategory receives invalid color', () => {
    const { result } = renderHook(() => useCards())
    const cardId = result.current.cards[0].id
    const originalColor = result.current.cards[0].color
    
    act(() => {
      result.current.moveCardToCategory(cardId, 'NPCs', 'not-a-color')
    })

    expect(result.current.cards[0].color).toBe(originalColor)
  })
})