# Task 5: Replace Date.now() IDs with crypto.randomUUID()

## Task Summary
Replace all `Date.now().toString()` ID generation with `crypto.randomUUID()` in `src/App.jsx` (`addCard`, `addTemplateCard`, `duplicateCard`) and `src/components/Card.jsx` (`createNewElement`). Remove the `Math.random()` workaround in `duplicateCard` by using `crypto.randomUUID()` for each element ID.

## Summary
Replaced `Date.now().toString()`-based ID generation with `crypto.randomUUID()` for cards and elements to eliminate collision risks during rapid operations. Updated add, template, duplicate, and element creation flows to use UUIDs consistently.

## Problem
Using timestamp-based IDs can create duplicates when multiple cards or elements are created quickly, leading to React key collisions and potential data overwrites.

## Solution
- **File Modified**: `src/App.jsx`
  - `addCard` now uses `crypto.randomUUID()` for card IDs.
  - Template element IDs now use `crypto.randomUUID()`.
  - `addTemplateCard` card IDs now use `crypto.randomUUID()`.
  - `duplicateCard` now uses `crypto.randomUUID()` for both the new card ID and each duplicated element ID, removing the `Math.random()` workaround.
- **File Modified**: `src/components/Card.jsx`
  - `createNewElement` now uses `crypto.randomUUID()` for element IDs.

## Notes
This preserves existing behavior while ensuring globally unique IDs across cards and elements.