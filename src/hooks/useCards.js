import { useState, useEffect, useCallback } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'
import { normalizeCards } from '../utils/cardSchema'
import { normalizeColorToHex } from '../utils/colors'
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
  const resolveCardColor = useCallback((category, overrideColor = null) => {
    if (overrideColor) {
      const normalizedOverride = normalizeColorToHex(overrideColor)
      if (normalizedOverride) return normalizedOverride
    }

    if (getCategoryColor) {
      const normalizedCategory = normalizeColorToHex(getCategoryColor(category))
      if (normalizedCategory) return normalizedCategory
    }

    return '#1f2937'
  }, [getCategoryColor])

  const addCard = useCallback((category, color = null) => {
    const newCard = {
      id: crypto.randomUUID(),
      category,
      color: resolveCardColor(category, color),
      title: 'New Card',
      subtitle: '',
      elements: [],
      layout: 'auto'
    }
    setCards(prev => [...prev, newCard])
    return newCard
  }, [resolveCardColor])

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
      color: resolveCardColor(category, color),
      layout: 'auto',
      ...templateData
    }
    setCards(prev => [...prev, newCard])
    return newCard
  }, [resolveCardColor])

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
        const resolvedColor = newColor
          ? normalizeColorToHex(newColor) || card.color
          : card.color
        return {
          ...card,
          category: newCategory,
          color: resolvedColor
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
