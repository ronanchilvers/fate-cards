# Fate Cards — Code Quality Improvement Tasks

This document contains prioritized tasks to improve code quality, resilience, and maintainability. Each task is designed to be small and self-contained for easy consumption by an AI agent.


## Instructions

- Always pick the next highest priority task (1 being highest priority) that has a status of "Pending". 
- Once you have completed the task, change the status to "Completed" in the task description and in the Status column in the Summary table at the end of this document.
- Once you have completed a task, write a summary markdown file the "changes" folder in the codebase root describing what you have done. The filename should be the task title where possible. The file should include the task summary from this document at the start and then describe your implementation.
- Always make sure to leave the codebase in a clean and working state.
- Always write clean, concise code adding clear comments so that the functionality is clear and transparent.
- 

---

## High Priority (Data Integrity)

### Task 1: Wrap localStorage JSON parsing in try/catch

- **Status**: Completed
- **File**: `src/App.jsx`
- **Location**: Inside the initial `useEffect` that loads from localStorage (~lines 45-160)
- **Action**: Wrap each `JSON.parse(savedX)` call in try/catch. On failure:
  - Log the error to console
  - Clear the corrupted key with `localStorage.removeItem(key)`
  - Fall back to default values
- **Example**:
  ```javascript
  if (savedCards) {
    try {
      setCards(JSON.parse(savedCards))
    } catch (err) {
      console.error('Failed to parse saved cards:', err)
      localStorage.removeItem('fate-cards')
      // Will use default cards
    }
  }
  ```
- **Why**: Corrupted localStorage currently crashes the entire app with no recovery path.

---

### Task 2: Create a card schema validator/normalizer utility

- **Status**: Completed
- **File**: Create new file `src/utils/cardSchema.js`
- **Action**: Create and export a `normalizeCard(card)` function that:
  - Returns `null` if input is not an object
  - Ensures `id` exists (generate with `crypto.randomUUID()` if missing)
  - Ensures `title` is a string (default: `'Untitled'`)
  - Ensures `elements` is an array (default: `[]`)
  - Ensures `category` is a string (default: `'PCs'`)
  - Ensures `color` is a valid hex string (default: `'#1f2937'`)
  - Ensures `layout` is one of `'auto'`, `'single-column'`, `'2-column'` (default: `'auto'`)
  - Returns the normalized card object
- **Also export**: `normalizeCards(cards)` that filters and normalizes an array of cards
- **Why**: Foundation for safe imports and localStorage recovery.

---

### Task 3: Validate and normalize imported data

- **Status**: Completed
- **File**: `src/App.jsx`
- **Location**: `importCards` function (~lines 600-633)
- **Action**: 
  1. Import the normalizer from `src/utils/cardSchema.js`
  2. After parsing JSON, normalize cards before calling `setCards()`
  3. Filter out any cards that return `null` from normalization
  4. Show user feedback if some cards were skipped
- **Example**:
  ```javascript
  import { normalizeCards } from './utils/cardSchema'
  // ...
  const validCards = normalizeCards(importedData.cards)
  if (validCards.length < importedData.cards.length) {
    alert(`${importedData.cards.length - validCards.length} invalid cards were skipped.`)
  }
  setCards(validCards)
  ```
- **Why**: Malformed imports currently persist to localStorage and break the app on reload.

---

## Medium Priority (State Consistency)

### Task 4: Sync Card locked state with prop changes

- **Status**: Pending
- **File**: `src/components/Card.jsx`
- **Location**: Near the top of the component, after the `isLocked` useState (~line 7)
- **Action**: Add a `useEffect` that updates local `isLocked` state when `card.locked` prop changes:
  ```javascript
  useEffect(() => {
    setIsLocked(card.locked || false)
  }, [card.locked])
  ```
- **Why**: After imports or external updates, the UI can show the wrong lock state, allowing edits on supposedly locked cards.

---

### Task 5: Replace Date.now() IDs with crypto.randomUUID()

- **Status**: Pending
- **Files**: 
  - `src/App.jsx`: `addCard` (~L235), `addTemplateCard` (~L390), `duplicateCard` (~L413, L418)
  - `src/components/Card.jsx`: `createNewElement` (~L92)
- **Action**: 
  1. Replace all `Date.now().toString()` with `crypto.randomUUID()`
  2. In `duplicateCard`, remove the `Math.random()` workaround — just use `crypto.randomUUID()` for each element ID
- **Example**:
  ```javascript
  // Before
  id: Date.now().toString()
  // After
  id: crypto.randomUUID()
  ```
- **Why**: `Date.now()` can produce duplicate IDs during fast operations, causing React key collisions and data overwrites.

---

## Low Priority (Defensive Coding)

### Task 6: Guard null dereference in deleteSkillLevel

- **Status**: Pending
- **File**: `src/App.jsx`
- **Location**: `deleteSkillLevel` function (~lines 535-540)
- **Action**: Add early return if `level` is not found:
  ```javascript
  const deleteSkillLevel = (levelValue) => {
    const level = skillLevels.find(l => l.value === levelValue)
    if (!level) return
    if (window.confirm(`Are you sure you want to delete the skill level "${level.label}"?`)) {
      setSkillLevels(skillLevels.filter(l => l.value !== levelValue))
    }
  }
  ```
- **Why**: Prevents crash if skill level data is malformed from bad imports or corrupted storage.

---

### Task 7: Add element type fallback in Card render

- **Status**: Pending
- **File**: `src/components/Card.jsx`
- **Location**: `renderElement` function's switch statement (find the `default` case)
- **Action**: Ensure the `default` case returns a safe fallback UI showing the unknown type:
  ```javascript
  default:
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
  ```
- **Why**: Imported data with unknown element types won't break rendering.

---

## Code Organization (Maintainability)

### Task 8: Extract card templates to separate file

- **Status**: Pending
- **File**: Create new file `src/data/cardTemplates.js`
- **Action**: 
  1. Move the `templates` object from inside `addTemplateCard()` (~L247-386 in App.jsx) to the new file
  2. Export it as `export const cardTemplates = { ... }`
  3. Import it in App.jsx: `import { cardTemplates } from './data/cardTemplates'`
  4. Update `addTemplateCard` to use the imported `cardTemplates`
- **Why**: Reduces App.jsx size by ~140 lines and improves maintainability.

---

### Task 9: Extract localStorage helpers to utility module

- **Status**: Pending
- **File**: Create new file `src/utils/storage.js`
- **Action**: Create and export helper functions:
  ```javascript
  export function safeGetJSON(key, fallback = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch (err) {
      console.error(`Failed to parse localStorage key "${key}":`, err)
      localStorage.removeItem(key)
      return fallback
    }
  }

  export function safeSetJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error(`Failed to save to localStorage key "${key}":`, err)
    }
  }
  ```
- **Then**: Update App.jsx to use these helpers in the load/save useEffects
- **Why**: Centralizes error handling, reduces repetition, makes App.jsx cleaner.

---

### Task 10: Extract default data constants

- **Status**: Pending
- **File**: Create new file `src/data/defaults.js`
- **Action**: Move to the new file and export:
  1. `defaultSkills` — the array of skill names (~L8-12 in App.jsx)
  2. `defaultSkillLevels` — the array of skill level objects (~L13-27 in App.jsx)
  3. `defaultSampleCard` — the sample "Darv" card (~L59-132 in App.jsx)
  4. `defaultCategories` — the `['PCs', 'NPCs', 'Scenes']` array
- **Then**: Import these in App.jsx and use them for initial state and reset
- **Why**: Cleaner separation of concerns, easier to modify defaults, reduces App.jsx size.

---

### Task 11: Clear stored export filename on app reset

- **Status**: Pending
- **File**: `src/App.jsx`
- **Location**: `resetAllData` function (~lines 675-720)
- **Action**: Add a call to clear the stored export filename when the user confirms the reset:
  ```javascript
  localStorage.removeItem('fate-last-export-filename')
  setLastExportFilename('')
  ```
  - Place this call alongside the other `localStorage.removeItem()` calls and state resets in the `resetAllData` function
- **Why**: When resetting all app data, the remembered export filename should also be cleared so the user gets a fresh default filename (with current timestamp) on their next export.

---

## Summary

| Status | # | Priority | Task | Effort | Files |
|------|---|----------|------|--------|-------|
| Completed | 1 | High | Wrap localStorage parsing in try/catch | Small | App.jsx |
| Completed | 2 | High | Create card schema validator | Medium | New: utils/cardSchema.js |
| Completed | 3 | High | Validate imports with schema | Small | App.jsx |
| Pending | 4 | Medium | Sync Card locked state with prop changes | Small | Card.jsx |
| Pending | 5 | Medium | Use crypto.randomUUID() for IDs | Small | App.jsx, Card.jsx |
| Pending | 6 | Low | Guard null in deleteSkillLevel | Small | App.jsx |
| Pending | 7 | Low | Add element type render fallback | Small | Card.jsx |
| Pending | 11 | Low | Clear stored export filename on reset | Small | App.jsx |
| Pending | 8 | Low | Extract templates to module | Medium | New: data/cardTemplates.js, App.jsx |
| Pending | 9 | Low | Extract storage helpers | Medium | New: utils/storage.js, App.jsx |
| Pending | 10 | Low | Extract default data constants | Small | New: data/defaults.js, App.jsx |

**Recommended order**: Tasks 1 → 2 → 3 → 6 → 7 → 11 → 4 → 5 → 9 → 10 → 8
