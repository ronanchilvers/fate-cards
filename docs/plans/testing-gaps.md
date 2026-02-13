# Testing Gaps Analysis

## Overview

An audit of all source files and their corresponding test files, identifying untested modules,
under-tested logic paths, and failing tests. This document serves as a roadmap for improving
test coverage across the project.

**Current state:** 31 test files, ~330 tests, **2 failing tests**

---

## 🔴 Failing Tests (2)

These should be investigated and fixed before any new test work begins, as they may indicate
regressions or stale assertions.

1. **`src/components/toast/ToastProvider.test.jsx`**
   - "renders an alert toast and allows dismiss"

2. **`src/components/elements/SkillsElement.test.jsx`**
   - "should include custom option in the skill dropdown"

---

## 🟥 High-Priority Gaps

### 1. `src/data/elementFactories.js` — No test file

Contains 10 factory functions plus `createElementByType` with a fallback-to-note default.
These are pure functions used by `Card.jsx` and `cardTemplates.js`, making them trivially testable.

**What to test:**
- Each factory returns the correct `type` and expected default fields
- `createAspectsElement(count)` generates the right number of slots
- `createElementByType` maps all known types correctly
- `createElementByType` falls back to a note element for unknown types
- Each call generates a unique `id`

---

### 2. `src/components/Card.jsx` — No test file (557 lines)

The largest component in the project with zero tests. Contains substantial logic.

**What to test:**
- Element CRUD: `addElement`, `updateElement`, `deleteElement`
- Drag-and-drop reordering: `moveElementToIndex`, `handleDragStart/Over/Drop/End`
- Settings panel: open / save with title, subtitle, color, category, layout
- Lock/unlock toggle: disabling editing when locked
- Element menu: adding elements from the menu
- Rendering of elements by type via `renderElement`

---

### 3. `src/App.jsx` — Only import size limit tested

The single App test (`App.import.test.jsx`) covers only oversized file rejection.
The entire import/export/reset flow is untested.

**What to test:**
- Export: data structure includes cards, categories, skills, skillLevels; filename generation
- Import legacy format: array of cards, warning about missing domains
- Import new format: object with cards, categories, skills, skillLevels
- Import with invalid JSON: error alert shown
- Import with partial domain failures: warning consolidation
- Reset all data: calls all `reset*` functions, clears localStorage
- Category delete with confirmation dialog
- Card delete with confirmation dialog
- Cards-by-category grouping and counting (`useMemo` block)
- Dice rolling orchestration (`handleRollDice`, `handleDiceResult`)

---

### 4. `src/utils/colors.js` — `normalizeColorToHex` untested

The `colors.test.js` tests cover `getPaleBackground`, `getMidToneBackground`, and
`getCategoryColor`, but `normalizeColorToHex` is completely untested despite being
exported and used by `cardSchema.js` and `useCards.js`.

**What to test for `normalizeColorToHex`:**
- Valid hex input → returns lowercase hex
- Valid HSL input → returns hex equivalent
- Invalid inputs (null, number, `"red"`, `"#fff"`, `"#gggggg"`) → returns null
- Edge HSL values (0°, 360°, 0% saturation, boundary lightness)

**Additional coverage for existing functions:**
- `getPaleBackground` and `getMidToneBackground` with HSL inputs
- `getPaleBackground` and `getMidToneBackground` with invalid/fallback inputs

---

### 5. `src/utils/cardSchema.test.js` — Element normalization gaps

Several element type normalizations lack explicit test coverage.

**What to add:**
- `FATE_POINTS`: `current`/`refresh` defaults when non-numeric or missing
- `GAME_TOOLS`: `dice` array normalization (non-array → empty array)
- `ASPECTS`: `items` normalization (should filter to strings only)
- `CONSEQUENCES`: items with non-string `label`/`text` → default to empty strings
- Element `id` generation: missing/empty `id` on an element triggers UUID generation

---

## 🟧 Medium-Priority Gaps

### 6. `src/components/elements/ElementWrapper.jsx` — No test file

Used by every element component. Has testable conditional rendering.

**What to test:**
- Renders title and children
- Shows delete button when unlocked and `onDelete` is provided
- Hides delete button when locked
- Shows/hides drag handle based on `showDragHandle`
- Applies correct CSS classes (`locked`, custom `className`)
- Passes `dragHandleProps` to drag handle button

---

### 7. `src/components/icons/Icon.jsx` — No test file

Has conditional rendering logic and accessibility attribute handling.

**What to test:**
- Returns `null` for unknown icon names
- `ariaHidden` defaults to `true` when no `ariaLabel` is provided
- `ariaHidden` is `false` when `ariaLabel` is provided
- Adds `role="img"` when `ariaLabel` is present
- Forwards extra props to the underlying LucideIcon

---

### 8. `src/components/FloatingDiceButton.jsx` — No test file

Small but has keyboard accessibility to verify.

**What to test:**
- Calls `onClick` when clicked (unless disabled)
- Keyboard handler: Enter and Space keys trigger click
- `disabled` prop prevents action and applies `is-disabled` class
- Correct `aria-label` and `aria-disabled` attributes

---

### 9. `src/components/toast/ToastContainer.jsx` — No test file

Renders three toast variants. `ToastProvider` tests exercise some of this indirectly,
but `ToastContainer` itself deserves direct coverage.

**What to test:**
- Separate rendering paths for `confirm`, `diceResult`, and `alert` toasts
- Overlay presence for confirm toasts
- Progress bar with custom `duration`
- Click-to-dismiss behaviour
- Fallback for missing toast fields (`toast?.title`, etc.)
- Safe handling of non-array `toasts` prop

---

### 10. `src/hooks/useToast.js` — No test file

Has a fallback object when no `ToastContext` is available.

**What to test:**
- Returns context value when used inside `ToastProvider`
- Returns fallback object (no-op functions) when used outside `ToastProvider`
- `fallbackToast.alert()` returns `null`
- `fallbackToast.confirm()` resolves to `false`
- `fallbackToast.diceResult()` returns `null`

---

### 11. `src/hooks/useCards.test.js` — Logic gaps in existing tests

**Missing edge cases:**
- `addCardFromTemplate` with invalid template key → should fall back to `blank` template
- `importCards` with non-array input → should return `{ success: false, warning: '...' }`
- `importCards` with mixed valid/invalid cards → should report `skipped` count and warning
- `moveCardToCategory` with invalid color → should preserve existing card colour
- `duplicateCard` with deeply nested data (e.g. inventory items) → verify `structuredClone` behaviour

---

## 🟨 Low-Priority Gaps

### 12. `src/components/icons/iconMap.js`

A simple constant map. Low value to test, but could validate that all keys resolve to
actual Lucide components (not `undefined`).

### 13. `src/components/FateDiceRoller.jsx`

A Three.js / cannon-es 3D rendering component. Extremely difficult to unit test in jsdom.
If testing is desired, extracting pure logic (e.g. `readTopFaces`, dice value calculation,
physics constants) into a separate module would make it feasible.

### 14. `src/hooks/useCategories.test.js` — Minor gaps

- `importCategories` with non-array input: no test for this edge case
- `deleteCategory` for non-existent category: no test for graceful handling

---

## Summary Table

| Priority | File | Issue |
|----------|------|-------|
| 🔴 Fix | `toast/ToastProvider.test.jsx` | Failing test |
| 🔴 Fix | `elements/SkillsElement.test.jsx` | Failing test |
| 🟥 High | `data/elementFactories.js` | No tests — pure functions |
| 🟥 High | `components/Card.jsx` | No tests — 557-line core component |
| 🟥 High | `App.jsx` | Only 1 edge case tested |
| 🟥 High | `utils/colors.js` | `normalizeColorToHex` untested |
| 🟥 High | `utils/cardSchema.test.js` | Element normalization gaps |
| 🟧 Med | `elements/ElementWrapper.jsx` | No tests — shared wrapper |
| 🟧 Med | `icons/Icon.jsx` | No tests — conditional rendering |
| 🟧 Med | `FloatingDiceButton.jsx` | No tests — accessibility |
| 🟧 Med | `toast/ToastContainer.jsx` | No tests — three rendering paths |
| 🟧 Med | `hooks/useToast.js` | No tests — fallback behaviour |
| 🟧 Med | `hooks/useCards.test.js` | Missing edge case coverage |
| 🟨 Low | `icons/iconMap.js` | No tests — simple constant |
| 🟨 Low | `FateDiceRoller.jsx` | Hard to test (Three.js/WebGL) |
| 🟨 Low | `hooks/useCategories.test.js` | Minor edge cases |

---

## Suggested Implementation Order

1. Fix the 2 failing tests
2. Add tests for `elementFactories.js` (quick win, pure functions)
3. Add `normalizeColorToHex` tests to `colors.test.js`
4. Expand `cardSchema.test.js` element normalization coverage
5. Add tests for `ElementWrapper.jsx`, `Icon.jsx`, and `FloatingDiceButton.jsx`
6. Add tests for `useToast.js` and `ToastContainer.jsx`
7. Expand `useCards.test.js` edge case coverage
8. Tackle `Card.jsx` tests (likely needs breaking into smaller test groups)
9. Tackle `App.jsx` import/export/reset tests