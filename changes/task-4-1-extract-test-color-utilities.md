# Task 4.1: Extract and Test Color Utility Functions

**Completed**: 2026-01-27 21:20:59

## Task Summary

Extract color manipulation functions from React components into a testable utility module, create comprehensive tests, and update components to use the extracted functions.

## Implementation

### Files Created

1. **`src/utils/colors.js`** - Color utility module with three exported functions
2. **`src/utils/colors.test.js`** - Test suite with 8 test cases

### Files Modified

1. **`src/components/Card.jsx`** - Removed inline color functions, added import
2. **`src/App.jsx`** - Refactored to use imported getCategoryColor function

### Functions Extracted

#### 1. getPaleBackground(hexColor)

Converts a hex color to a pale background by mixing 90% white with 10% original color.

```javascript
export function getPaleBackground(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  const paleR = Math.round(r * 0.1 + 255 * 0.9)
  const paleG = Math.round(g * 0.1 + 255 * 0.9)
  const paleB = Math.round(b * 0.1 + 255 * 0.9)
  
  return `rgb(${paleR}, ${paleG}, ${paleB})`
}
```

**Previously**: Inline function in Card.jsx  
**Now**: Exported from colors.js and imported

#### 2. getMidToneBackground(hexColor)

Converts a hex color to a mid-tone background by mixing 50% white with 50% original color.

```javascript
export function getMidToneBackground(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  const midR = Math.round(r * 0.5 + 255 * 0.5)
  const midG = Math.round(g * 0.5 + 255 * 0.5)
  const midB = Math.round(b * 0.5 + 255 * 0.5)
  
  return `rgb(${midR}, ${midG}, ${midB})`
}
```

**Previously**: Inline function in Card.jsx  
**Now**: Exported from colors.js and imported

#### 3. getCategoryColor(category, defaultColors)

Generates a consistent color for a category, using defaults or hash-based HSL generation.

```javascript
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

**Previously**: Inline function in App.jsx with hardcoded defaults  
**Now**: Exported from colors.js with configurable defaults

### Tests Implemented

#### getPaleBackground Tests (3 tests)

**Test 1: Returns pale version of red**
```javascript
it('returns pale version of red', () => {
  const result = getPaleBackground('#ff0000')
  expect(result).toBe('rgb(255, 230, 230)')
})
```

Verifies that pure red (#ff0000) becomes a pale pink.

**Test 2: Returns pale version of blue**
```javascript
it('returns pale version of blue', () => {
  const result = getPaleBackground('#0000ff')
  expect(result).toBe('rgb(230, 230, 255)')
})
```

Verifies that pure blue (#0000ff) becomes a pale blue.

**Test 3: Returns near-white for black input**
```javascript
it('returns near-white for black input', () => {
  const result = getPaleBackground('#000000')
  expect(result).toBe('rgb(230, 230, 230)')
})
```

Verifies that black (#000000) becomes a light gray (90% white).

#### getMidToneBackground Tests (2 tests)

**Test 1: Returns mid-tone version of red**
```javascript
it('returns mid-tone version of red', () => {
  const result = getMidToneBackground('#ff0000')
  expect(result).toBe('rgb(255, 128, 128)')
})
```

Verifies 50/50 mix of red and white.

**Test 2: Returns mid-tone version of blue**
```javascript
it('returns mid-tone version of blue', () => {
  const result = getMidToneBackground('#0000ff')
  expect(result).toBe('rgb(128, 128, 255)')
})
```

Verifies 50/50 mix of blue and white.

#### getCategoryColor Tests (3 tests)

**Test 1: Returns default color when category is in defaults**
```javascript
it('returns default color when category is in defaults', () => {
  const defaults = { 'PCs': '#c53030', 'NPCs': '#2c5282' }
  expect(getCategoryColor('PCs', defaults)).toBe('#c53030')
  expect(getCategoryColor('NPCs', defaults)).toBe('#2c5282')
})
```

Verifies that provided default colors are used when available.

**Test 2: Generates consistent HSL for unknown categories**
```javascript
it('generates consistent HSL for unknown categories', () => {
  const color1 = getCategoryColor('Custom Category')
  const color2 = getCategoryColor('Custom Category')
  expect(color1).toBe(color2)
  expect(color1).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
})
```

Verifies hash-based color generation is deterministic and produces valid HSL.

**Test 3: Generates different colors for different categories**
```javascript
it('generates different colors for different categories', () => {
  const color1 = getCategoryColor('Category A')
  const color2 = getCategoryColor('Category B')
  expect(color1).not.toBe(color2)
})
```

Verifies that different category names produce different colors.

### Component Updates

#### Card.jsx Changes

**Before**: 28 lines of inline color functions  
**After**: 1 import line

```javascript
import { getPaleBackground, getMidToneBackground } from '../utils/colors'
```

Removed 27 lines of code, reducing component complexity.

#### App.jsx Changes

**Before**: Inline getCategoryColor function with hardcoded defaults  
**After**: Wrapper function using imported utility

```javascript
import { getCategoryColor } from './utils/colors'

// Helper to get category color with default colors
const getCategoryColorWithDefaults = (category) => {
  const defaultColors = {
    'PCs': '#c53030',
    'NPCs': '#2c5282',
    'Scenes': '#ed8936'
  }
  return getCategoryColor(category, defaultColors)
}
```

This approach keeps the default colors in App.jsx where they're used, while making the color generation logic testable.

### Test Results

```
✓ src/utils/colors.test.js (8 tests) 3ms
  ✓ getPaleBackground (3)
    ✓ returns pale version of red
    ✓ returns pale version of blue
    ✓ returns near-white for black input
  ✓ getMidToneBackground (2)
    ✓ returns mid-tone version of red
    ✓ returns mid-tone version of blue
  ✓ getCategoryColor (3)
    ✓ returns default color when category is in defaults
    ✓ generates consistent HSL for unknown categories
    ✓ generates different colors for different categories

✓ src/utils/storage.test.js (6 tests)
✓ src/data/defaults.test.js (9 tests)
✓ src/data/cardTemplates.test.js (10 tests)
✓ src/utils/cardSchema.test.js (16 tests)

Test Files  5 passed (5)
     Tests  49 passed (49)
```

✅ All 8 new color tests passing  
✅ All existing tests still passing  
✅ Total: 49 tests across 5 files

### Build Verification

```
✓ 39 modules transformed
dist/index.html                   0.48 kB
dist/assets/index-_5bL_N2N.css   20.94 kB
dist/assets/index-CW8oM9sV.js   177.80 kB
✓ built in 286ms
```

✅ Production build successful  
✅ No runtime errors  
✅ All imports resolved correctly

### Benefits Achieved

1. **Testability**: Color logic can now be tested in isolation without React
2. **Reusability**: Functions can be imported anywhere in the codebase
3. **Maintainability**: Single source of truth for color operations
4. **Code Reduction**: Removed ~50 lines of duplicated code from components
5. **Documentation**: JSDoc comments describe function behavior
6. **Type Safety**: Clear function signatures with parameter descriptions

### Code Quality Improvements

- **Separation of Concerns**: Pure functions separated from UI components
- **Pure Functions**: No side effects, easy to reason about
- **DRY Principle**: Eliminated code duplication
- **Single Responsibility**: Each function has one clear purpose
- **Easy Refactoring**: Changes to color logic now happen in one place

### Coverage Summary

The color utility module is now fully tested for:
- ✅ Pale background generation (90% white mix)
- ✅ Mid-tone background generation (50% white mix)
- ✅ Default color lookups
- ✅ Consistent hash-based color generation
- ✅ Different colors for different inputs
- ✅ Valid HSL output format
- ✅ Edge cases (black input)

## Phase 4 Complete! 🎉

Phase 4 focused on extracting testable logic from React components.

### Task 4.1 Complete
- ✅ Color utilities extracted to `src/utils/colors.js`
- ✅ 8 comprehensive tests implemented
- ✅ Components updated to use extracted utilities
- ✅ Build verified successfully

**Phase 4 Total: 8 tests, all passing**

### Cumulative Progress

- ✅ Phase 1: Test Infrastructure (4 tasks)
- ✅ Phase 2: Utility Module Tests (5 tasks, 22 tests)
- ✅ Phase 3: Data Module Tests (2 tasks, 19 tests)
- ✅ Phase 4: Component Logic Tests (1 task, 8 tests)

**Total: 49 tests across 5 test files**

### Next Steps

Begin **Phase 5: Integration Tests**

- Task 5.1: Test Import Data Validation Flow

## Status

✅ **Completed** - Color utility functions extracted, tested, and integrated. Phase 4 complete with 8 passing tests!