# Fate Cards — Test Implementation Plan

This document outlines tasks to add CLI-runnable test coverage for the Fate Cards application. Tasks are ordered by dependency and priority, designed for incremental implementation by an AI agent.

## Instructions

- Work through tasks sequentially; some tasks depend on earlier ones
- Mark each task status as "Completed" when done
- Run `npm test` after each task to verify tests pass
- Once you have completed a task, write a summary markdown file the "changes" folder in the codebase root describing what you have done. The filename should be the task title where possible. The file should include the task summary from this document at the start and then describe your implementation. The file should include a timestamp in a standard format (eg: YYYY-MM-DD hh:mm:ss) of when the task was completed.
- Keep tests focused, readable, and well-documented
- Use descriptive test names that explain what is being tested
- Always make sure to leave the codebase in a clean and working state.
- Always write clean, concise code with clear comments so that the functionality is clear and transparent.
- Always check and if needed, update the recommended order of tasks at the bottom of this document so it includes pending tasks, in priority order.

---

## Phase 1: Test Infrastructure Setup

### Task 1.1: Install Testing Dependencies

- **Status**: Pending
- **Priority**: High (Prerequisite)
- **Action**: Install Vitest and related testing libraries
- **Commands**:
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```
- **Why**: Vitest integrates seamlessly with Vite and provides fast, modern testing.

---

### Task 1.2: Configure Vitest

- **Status**: Pending
- **Priority**: High (Prerequisite)
- **File**: `vite.config.js`
- **Action**: Add Vitest configuration to the existing Vite config:
  ```javascript
  /// <reference types="vitest" />
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      include: ['src/**/*.{test,spec}.{js,jsx}'],
    },
  })
  ```
- **Why**: Enables running tests with React/DOM support.

---

### Task 1.3: Create Test Setup File

- **Status**: Pending
- **Priority**: High (Prerequisite)
- **File**: Create `src/test/setup.js`
- **Action**: Create setup file with common test utilities:
  ```javascript
  import '@testing-library/jest-dom'
  import { vi } from 'vitest'

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  global.localStorage = localStorageMock

  // Mock crypto.randomUUID
  global.crypto = {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
  }

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })
  ```
- **Why**: Provides consistent test environment and mocks for browser APIs.

---

### Task 1.4: Add Test Script to package.json

- **Status**: Pending
- **Priority**: High (Prerequisite)
- **File**: `package.json`
- **Action**: Add test scripts to the scripts section:
  ```json
  {
    "scripts": {
      "test": "vitest run",
      "test:watch": "vitest",
      "test:coverage": "vitest run --coverage"
    }
  }
  ```
- **Why**: Enables running tests via `npm test` from CLI.

---

## Phase 2: Utility Module Tests

### Task 2.1: Test cardSchema.js - normalizeCard Valid Input

- **Status**: Pending
- **Priority**: High
- **File**: Create `src/utils/cardSchema.test.js`
- **Action**: Test `normalizeCard` with valid card objects:
  ```javascript
  import { describe, it, expect } from 'vitest'
  import { normalizeCard } from './cardSchema'

  describe('normalizeCard', () => {
    it('returns a normalized card when given a valid card object', () => {
      const input = {
        id: 'test-id',
        title: 'Test Card',
        elements: [],
        category: 'PCs',
        color: '#ff0000',
        layout: 'auto'
      }
      const result = normalizeCard(input)
      expect(result).toMatchObject(input)
    })

    it('preserves all valid fields from input', () => {
      const input = {
        id: 'my-id',
        title: 'My Title',
        subtitle: 'My Subtitle',
        elements: [{ id: '1', type: 'note' }],
        category: 'NPCs',
        color: '#123456',
        layout: '2-column',
        locked: true
      }
      const result = normalizeCard(input)
      expect(result.id).toBe('my-id')
      expect(result.title).toBe('My Title')
      expect(result.subtitle).toBe('My Subtitle')
      expect(result.locked).toBe(true)
    })
  })
  ```
- **Tests**: 2 test cases for valid input handling
- **Why**: Verifies normalizer preserves valid data correctly.

---

### Task 2.2: Test cardSchema.js - normalizeCard Invalid/Missing Fields

- **Status**: Pending
- **Priority**: High
- **File**: `src/utils/cardSchema.test.js` (append)
- **Action**: Add tests for default value handling:
  ```javascript
  describe('normalizeCard - default values', () => {
    it('returns null for non-object input', () => {
      expect(normalizeCard(null)).toBeNull()
      expect(normalizeCard(undefined)).toBeNull()
      expect(normalizeCard('string')).toBeNull()
      expect(normalizeCard(123)).toBeNull()
      expect(normalizeCard([])).toBeNull()
    })

    it('generates UUID when id is missing', () => {
      const result = normalizeCard({})
      expect(result.id).toBeDefined()
      expect(typeof result.id).toBe('string')
    })

    it('defaults title to "Untitled" when missing or empty', () => {
      expect(normalizeCard({}).title).toBe('Untitled')
      expect(normalizeCard({ title: '' }).title).toBe('Untitled')
      expect(normalizeCard({ title: '   ' }).title).toBe('Untitled')
    })

    it('defaults subtitle to empty string', () => {
      expect(normalizeCard({}).subtitle).toBe('')
    })

    it('defaults elements to empty array', () => {
      expect(normalizeCard({}).elements).toEqual([])
      expect(normalizeCard({ elements: 'not-array' }).elements).toEqual([])
    })

    it('defaults category to "PCs"', () => {
      expect(normalizeCard({}).category).toBe('PCs')
      expect(normalizeCard({ category: '' }).category).toBe('PCs')
    })

    it('defaults color to "#1f2937" for invalid colors', () => {
      expect(normalizeCard({}).color).toBe('#1f2937')
      expect(normalizeCard({ color: 'red' }).color).toBe('#1f2937')
      expect(normalizeCard({ color: '#fff' }).color).toBe('#1f2937')
      expect(normalizeCard({ color: '#gggggg' }).color).toBe('#1f2937')
    })

    it('defaults layout to "auto" for invalid layouts', () => {
      expect(normalizeCard({}).layout).toBe('auto')
      expect(normalizeCard({ layout: 'invalid' }).layout).toBe('auto')
    })

    it('accepts valid layout values', () => {
      expect(normalizeCard({ layout: 'auto' }).layout).toBe('auto')
      expect(normalizeCard({ layout: 'single-column' }).layout).toBe('single-column')
      expect(normalizeCard({ layout: '2-column' }).layout).toBe('2-column')
    })

    it('defaults locked to false', () => {
      expect(normalizeCard({}).locked).toBe(false)
      expect(normalizeCard({ locked: 'yes' }).locked).toBe(false)
    })
  })
  ```
- **Tests**: 11 test cases for default value handling
- **Why**: Verifies defensive coding handles malformed data.

---

### Task 2.3: Test cardSchema.js - normalizeCards Array Function

- **Status**: Pending
- **Priority**: High
- **File**: `src/utils/cardSchema.test.js` (append)
- **Action**: Add tests for the array normalization function:
  ```javascript
  import { normalizeCards } from './cardSchema'

  describe('normalizeCards', () => {
    it('returns empty array for non-array input', () => {
      expect(normalizeCards(null)).toEqual([])
      expect(normalizeCards(undefined)).toEqual([])
      expect(normalizeCards('string')).toEqual([])
      expect(normalizeCards({})).toEqual([])
    })

    it('normalizes all valid cards in array', () => {
      const input = [
        { id: '1', title: 'Card 1' },
        { id: '2', title: 'Card 2' }
      ]
      const result = normalizeCards(input)
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Card 1')
      expect(result[1].title).toBe('Card 2')
    })

    it('filters out invalid cards', () => {
      const input = [
        { id: '1', title: 'Valid' },
        null,
        'string',
        { id: '2', title: 'Also Valid' }
      ]
      const result = normalizeCards(input)
      expect(result).toHaveLength(2)
    })

    it('returns empty array when all cards are invalid', () => {
      const input = [null, undefined, 'string', 123]
      const result = normalizeCards(input)
      expect(result).toEqual([])
    })
  })
  ```
- **Tests**: 4 test cases for array handling
- **Why**: Verifies batch normalization works correctly.

---

### Task 2.4: Test storage.js - safeGetJSON

- **Status**: Pending
- **Priority**: High
- **File**: Create `src/utils/storage.test.js`
- **Action**: Test localStorage get wrapper:
  ```javascript
  import { describe, it, expect, vi, beforeEach } from 'vitest'
  import { safeGetJSON } from './storage'

  describe('safeGetJSON', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      localStorage.getItem.mockReturnValue(null)
    })

    it('returns parsed JSON when key exists', () => {
      const testData = { foo: 'bar', count: 42 }
      localStorage.getItem.mockReturnValue(JSON.stringify(testData))
      
      const result = safeGetJSON('test-key')
      expect(result).toEqual(testData)
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('returns fallback when key does not exist', () => {
      localStorage.getItem.mockReturnValue(null)
      
      expect(safeGetJSON('missing-key')).toBeNull()
      expect(safeGetJSON('missing-key', [])).toEqual([])
      expect(safeGetJSON('missing-key', { default: true })).toEqual({ default: true })
    })

    it('returns fallback and clears key on parse error', () => {
      localStorage.getItem.mockReturnValue('invalid json {{{')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const result = safeGetJSON('corrupt-key', 'fallback')
      
      expect(result).toBe('fallback')
      expect(localStorage.removeItem).toHaveBeenCalledWith('corrupt-key')
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })
  ```
- **Tests**: 3 test cases for get operations
- **Why**: Verifies safe localStorage reading with error handling.

---

### Task 2.5: Test storage.js - safeSetJSON

- **Status**: Pending
- **Priority**: High
- **File**: `src/utils/storage.test.js` (append)
- **Action**: Test localStorage set wrapper:
  ```javascript
  import { safeSetJSON } from './storage'

  describe('safeSetJSON', () => {
    it('stringifies and saves value to localStorage', () => {
      const testData = { cards: [1, 2, 3] }
      
      const result = safeSetJSON('test-key', testData)
      
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData)
      )
    })

    it('returns true on successful save', () => {
      expect(safeSetJSON('key', 'value')).toBe(true)
    })

    it('returns false and logs error on failure', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceeded')
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const result = safeSetJSON('key', 'value')
      
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })
  ```
- **Tests**: 3 test cases for set operations
- **Why**: Verifies safe localStorage writing with error handling.

---

## Phase 3: Data Module Tests

### Task 3.1: Test defaults.js - Exported Constants

- **Status**: Pending
- **Priority**: Medium
- **File**: Create `src/data/defaults.test.js`
- **Action**: Test that default data exports are valid:
  ```javascript
  import { describe, it, expect } from 'vitest'
  import {
    defaultCategories,
    defaultSkills,
    defaultSkillLevels,
    defaultSampleCard
  } from './defaults'

  describe('defaultCategories', () => {
    it('is an array with expected categories', () => {
      expect(Array.isArray(defaultCategories)).toBe(true)
      expect(defaultCategories).toContain('PCs')
      expect(defaultCategories).toContain('NPCs')
      expect(defaultCategories).toContain('Scenes')
    })

    it('contains only non-empty strings', () => {
      defaultCategories.forEach(cat => {
        expect(typeof cat).toBe('string')
        expect(cat.trim().length).toBeGreaterThan(0)
      })
    })
  })

  describe('defaultSkills', () => {
    it('is an array of strings', () => {
      expect(Array.isArray(defaultSkills)).toBe(true)
      expect(defaultSkills.length).toBeGreaterThan(0)
      defaultSkills.forEach(skill => {
        expect(typeof skill).toBe('string')
      })
    })

    it('contains expected Fate Core skills', () => {
      expect(defaultSkills).toContain('Athletics')
      expect(defaultSkills).toContain('Fight')
      expect(defaultSkills).toContain('Will')
    })
  })

  describe('defaultSkillLevels', () => {
    it('is an array of objects with label and value', () => {
      expect(Array.isArray(defaultSkillLevels)).toBe(true)
      defaultSkillLevels.forEach(level => {
        expect(typeof level.label).toBe('string')
        expect(typeof level.value).toBe('number')
      })
    })

    it('is sorted by value descending', () => {
      for (let i = 1; i < defaultSkillLevels.length; i++) {
        expect(defaultSkillLevels[i - 1].value).toBeGreaterThan(defaultSkillLevels[i].value)
      }
    })

    it('contains expected levels', () => {
      const labels = defaultSkillLevels.map(l => l.label)
      expect(labels).toContain('Legendary')
      expect(labels).toContain('Average')
      expect(labels).toContain('Terrible')
    })
  })

  describe('defaultSampleCard', () => {
    it('has required card properties', () => {
      expect(defaultSampleCard.id).toBeDefined()
      expect(defaultSampleCard.title).toBe('Darv')
      expect(defaultSampleCard.category).toBe('PCs')
      expect(typeof defaultSampleCard.color).toBe('string')
      expect(Array.isArray(defaultSampleCard.elements)).toBe(true)
    })

    it('has valid element structure', () => {
      defaultSampleCard.elements.forEach(element => {
        expect(element.id).toBeDefined()
        expect(element.type).toBeDefined()
      })
    })
  })
  ```
- **Tests**: 9 test cases for default data validation
- **Why**: Ensures default data integrity for initialization and reset.

---

### Task 3.2: Test cardTemplates.js - Template Factory Functions

- **Status**: Pending
- **Priority**: Medium
- **File**: Create `src/data/cardTemplates.test.js`
- **Action**: Test template factory functions:
  ```javascript
  import { describe, it, expect } from 'vitest'
  import {
    standardPC,
    quickNPC,
    scene,
    blank,
    cardTemplates
  } from './cardTemplates'

  describe('standardPC template', () => {
    it('returns a new object each time (factory pattern)', () => {
      const card1 = standardPC()
      const card2 = standardPC()
      expect(card1).not.toBe(card2)
      expect(card1.elements[0].id).not.toBe(card2.elements[0].id)
    })

    it('has correct structure', () => {
      const card = standardPC()
      expect(card.title).toBe('New Character')
      expect(card.subtitle).toBe('Player Character')
      expect(Array.isArray(card.elements)).toBe(true)
    })

    it('includes all standard PC elements', () => {
      const card = standardPC()
      const types = card.elements.map(e => e.type)
      expect(types).toContain('high-concept')
      expect(types).toContain('trouble')
      expect(types).toContain('aspects')
      expect(types).toContain('skills')
      expect(types).toContain('stress-tracks')
      expect(types).toContain('consequences')
      expect(types).toContain('fate-points')
    })
  })

  describe('quickNPC template', () => {
    it('returns object with NPC structure', () => {
      const card = quickNPC()
      expect(card.title).toBe('New NPC')
      expect(card.elements.length).toBeGreaterThan(0)
    })

    it('does not include fate-points element', () => {
      const card = quickNPC()
      const types = card.elements.map(e => e.type)
      expect(types).not.toContain('fate-points')
    })
  })

  describe('scene template', () => {
    it('returns object with scene structure', () => {
      const card = scene()
      expect(card.title).toBe('New Scene')
      expect(card.subtitle).toBe('Location or Situation')
    })

    it('includes note element', () => {
      const card = scene()
      const types = card.elements.map(e => e.type)
      expect(types).toContain('note')
    })
  })

  describe('blank template', () => {
    it('returns empty card structure', () => {
      const card = blank()
      expect(card.title).toBe('New Card')
      expect(card.subtitle).toBe('')
      expect(card.elements).toEqual([])
    })
  })

  describe('cardTemplates lookup', () => {
    it('maps all template keys to factory functions', () => {
      expect(typeof cardTemplates['standard-pc']).toBe('function')
      expect(typeof cardTemplates['quick-npc']).toBe('function')
      expect(typeof cardTemplates['scene']).toBe('function')
      expect(typeof cardTemplates['blank']).toBe('function')
    })

    it('returns correct templates from lookup', () => {
      expect(cardTemplates['standard-pc']().title).toBe('New Character')
      expect(cardTemplates['quick-npc']().title).toBe('New NPC')
      expect(cardTemplates['scene']().title).toBe('New Scene')
      expect(cardTemplates['blank']().title).toBe('New Card')
    })
  })
  ```
- **Tests**: 11 test cases for template validation
- **Why**: Ensures templates generate correct card structures.

---

## Phase 4: Component Logic Tests (Extractable Functions)

### Task 4.1: Extract and Test Color Utility Functions

- **Status**: Pending
- **Priority**: Medium
- **Files**: 
  - Create `src/utils/colors.js`
  - Create `src/utils/colors.test.js`
  - Update `src/components/Card.jsx`
- **Action**: Extract color functions from Card.jsx to testable module:
  
  **Create `src/utils/colors.js`:**
  ```javascript
  /**
   * Color Utility Functions
   * 
   * Helper functions for color manipulation used in card rendering.
   */

  /**
   * Converts hex color to pale background (90% white mix)
   * @param {string} hexColor - Hex color string (e.g., '#c53030')
   * @returns {string} RGB color string
   */
  export function getPaleBackground(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    
    const paleR = Math.round(r * 0.1 + 255 * 0.9)
    const paleG = Math.round(g * 0.1 + 255 * 0.9)
    const paleB = Math.round(b * 0.1 + 255 * 0.9)
    
    return `rgb(${paleR}, ${paleG}, ${paleB})`
  }

  /**
   * Converts hex color to mid-tone background (50% white mix)
   * @param {string} hexColor - Hex color string
   * @returns {string} RGB color string
   */
  export function getMidToneBackground(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    
    const midR = Math.round(r * 0.5 + 255 * 0.5)
    const midG = Math.round(g * 0.5 + 255 * 0.5)
    const midB = Math.round(b * 0.5 + 255 * 0.5)
    
    return `rgb(${midR}, ${midG}, ${midB})`
  }

  /**
   * Generates consistent color for category name
   * @param {string} category - Category name
   * @param {Object} defaultColors - Map of category names to default colors
   * @returns {string} Hex or HSL color string
   */
  export function getCategoryColor(category, defaultColors = {}) {
    if (defaultColors[category]) {
      return defaultColors[category]
    }

    let hash = 0
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash)
    }

    const hue = Math.abs(hash % 360)
    const saturation = 60 + (Math.abs(hash) % 20)
    const lightness = 35 + (Math.abs(hash >> 8) % 15)

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }
  ```

  **Create `src/utils/colors.test.js`:**
  ```javascript
  import { describe, it, expect } from 'vitest'
  import { getPaleBackground, getMidToneBackground, getCategoryColor } from './colors'

  describe('getPaleBackground', () => {
    it('returns pale version of red', () => {
      const result = getPaleBackground('#ff0000')
      expect(result).toBe('rgb(255, 230, 230)')
    })

    it('returns pale version of blue', () => {
      const result = getPaleBackground('#0000ff')
      expect(result).toBe('rgb(230, 230, 255)')
    })

    it('returns near-white for black input', () => {
      const result = getPaleBackground('#000000')
      expect(result).toBe('rgb(230, 230, 230)')
    })
  })

  describe('getMidToneBackground', () => {
    it('returns mid-tone version of red', () => {
      const result = getMidToneBackground('#ff0000')
      expect(result).toBe('rgb(255, 128, 128)')
    })

    it('returns mid-tone version of blue', () => {
      const result = getMidToneBackground('#0000ff')
      expect(result).toBe('rgb(128, 128, 255)')
    })
  })

  describe('getCategoryColor', () => {
    it('returns default color when category is in defaults', () => {
      const defaults = { 'PCs': '#c53030', 'NPCs': '#2c5282' }
      expect(getCategoryColor('PCs', defaults)).toBe('#c53030')
      expect(getCategoryColor('NPCs', defaults)).toBe('#2c5282')
    })

    it('generates consistent HSL for unknown categories', () => {
      const color1 = getCategoryColor('Custom Category')
      const color2 = getCategoryColor('Custom Category')
      expect(color1).toBe(color2)
      expect(color1).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
    })

    it('generates different colors for different categories', () => {
      const color1 = getCategoryColor('Category A')
      const color2 = getCategoryColor('Category B')
      expect(color1).not.toBe(color2)
    })
  })
  ```
- **Then**: Update Card.jsx and App.jsx to import from `./utils/colors`
- **Tests**: 8 test cases for color utilities
- **Why**: Makes color logic testable without React components.

---

## Phase 5: Integration Tests

### Task 5.1: Test Import Data Validation Flow

- **Status**: Pending
- **Priority**: Medium
- **File**: Create `src/test/importValidation.test.js`
- **Action**: Test the complete import validation flow:
  ```javascript
  import { describe, it, expect } from 'vitest'
  import { normalizeCards } from '../utils/cardSchema'

  describe('Import Data Validation', () => {
    it('handles valid import data structure', () => {
      const importData = {
        cards: [
          { id: '1', title: 'Card 1', category: 'PCs', color: '#ff0000' },
          { id: '2', title: 'Card 2', category: 'NPCs', color: '#0000ff' }
        ],
        categories: ['PCs', 'NPCs', 'Scenes'],
        skills: ['Fight', 'Shoot'],
        skillLevels: [{ label: 'Good', value: 3 }]
      }

      const validCards = normalizeCards(importData.cards)
      expect(validCards).toHaveLength(2)
    })

    it('filters invalid cards from import', () => {
      const importData = {
        cards: [
          { id: '1', title: 'Valid Card' },
          null,
          'not a card',
          { id: '2', title: 'Another Valid' }
        ]
      }

      const validCards = normalizeCards(importData.cards)
      expect(validCards).toHaveLength(2)
    })

    it('normalizes cards with missing fields', () => {
      const importData = {
        cards: [
          { title: 'No ID Card' },
          { id: '1' },
          {}
        ]
      }

      const validCards = normalizeCards(importData.cards)
      expect(validCards).toHaveLength(3)
      expect(validCards[0].id).toBeDefined()
      expect(validCards[1].title).toBe('Untitled')
      expect(validCards[2].category).toBe('PCs')
    })

    it('handles empty import data', () => {
      expect(normalizeCards([])).toEqual([])
      expect(normalizeCards(null)).toEqual([])
      expect(normalizeCards(undefined)).toEqual([])
    })
  })

  describe('Import Categories Validation', () => {
    it('validates category array structure', () => {
      const validCategories = ['PCs', 'NPCs', 'Custom']
        .filter(cat => typeof cat === 'string' && cat.trim().length > 0)
      
      expect(validCategories).toHaveLength(3)
    })

    it('filters invalid category entries', () => {
      const categories = ['Valid', '', null, 'Also Valid', 123, '   ']
        .filter(cat => typeof cat === 'string' && cat.trim().length > 0)
      
      expect(categories).toHaveLength(2)
    })
  })

  describe('Import Skill Levels Validation', () => {
    it('validates skill level structure', () => {
      const levels = [
        { label: 'Good', value: 3 },
        { label: 'Fair', value: 2 },
        { label: '', value: 1 },
        { label: 'Bad', value: 'not a number' },
        null
      ]

      const validLevels = levels.filter(level =>
        level &&
        typeof level === 'object' &&
        typeof level.label === 'string' &&
        level.label.trim().length > 0 &&
        typeof level.value === 'number' &&
        !isNaN(level.value)
      )

      expect(validLevels).toHaveLength(2)
    })
  })
  ```
- **Tests**: 7 test cases for import validation
- **Why**: Tests the data flow that protects against malformed imports.

---

## Phase 6: Snapshot Tests (Optional)

### Task 6.1: Add Snapshot Tests for Default Data

- **Status**: Pending
- **Priority**: Low
- **File**: Create `src/data/defaults.snapshot.test.js`
- **Action**: Create snapshot tests to detect unintended changes:
  ```javascript
  import { describe, it, expect } from 'vitest'
  import {
    defaultCategories,
    defaultSkills,
    defaultSkillLevels,
    defaultSampleCard
  } from './defaults'

  describe('Default Data Snapshots', () => {
    it('defaultCategories matches snapshot', () => {
      expect(defaultCategories).toMatchSnapshot()
    })

    it('defaultSkills matches snapshot', () => {
      expect(defaultSkills).toMatchSnapshot()
    })

    it('defaultSkillLevels matches snapshot', () => {
      expect(defaultSkillLevels).toMatchSnapshot()
    })

    it('defaultSampleCard structure matches snapshot', () => {
      // Test structure without IDs which may vary
      const structure = {
        ...defaultSampleCard,
        elements: defaultSampleCard.elements.map(e => ({
          type: e.type,
          // Omit id and content for stable snapshot
        }))
      }
      expect(structure).toMatchSnapshot()
    })
  })
  ```
- **Tests**: 4 snapshot tests
- **Why**: Catches unintended changes to default data structures.

---

## Summary

| Phase | # | Priority | Task | Tests | Files |
|-------|---|----------|------|-------|-------|
| 1 | 1.1 | High | Install testing dependencies | - | package.json |
| 1 | 1.2 | High | Configure Vitest | - | vite.config.js |
| 1 | 1.3 | High | Create test setup file | - | src/test/setup.js |
| 1 | 1.4 | High | Add test scripts | - | package.json |
| 2 | 2.1 | High | Test normalizeCard valid input | 2 | cardSchema.test.js |
| 2 | 2.2 | High | Test normalizeCard defaults | 11 | cardSchema.test.js |
| 2 | 2.3 | High | Test normalizeCards array | 4 | cardSchema.test.js |
| 2 | 2.4 | High | Test safeGetJSON | 3 | storage.test.js |
| 2 | 2.5 | High | Test safeSetJSON | 3 | storage.test.js |
| 3 | 3.1 | Medium | Test default constants | 9 | defaults.test.js |
| 3 | 3.2 | Medium | Test card templates | 11 | cardTemplates.test.js |
| 4 | 4.1 | Medium | Extract and test color utilities | 8 | colors.js, colors.test.js |
| 5 | 5.1 | Medium | Test import validation flow | 7 | importValidation.test.js |
| 6 | 6.1 | Low | Snapshot tests for defaults | 4 | defaults.snapshot.test.js |

**Total estimated tests**: ~62 test cases

**Recommended implementation order**: Tasks 1.1 → 1.2 → 1.3 → 1.4 → 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 3.1 → 3.2 → 4.1 → 5.1 → 6.1

---

## Notes

- **React Component Testing**: Full component testing with React Testing Library is possible but requires more complex setup. The tasks above focus on testable logic extraction.
- **E2E Testing**: For user interaction testing, consider adding Playwright or Cypress in a future phase.
- **Coverage**: Run `npm run test:coverage` after implementation to measure coverage and identify gaps.
- **CI Integration**: After tests pass locally, add a GitHub Actions workflow to run tests on PR/push.
