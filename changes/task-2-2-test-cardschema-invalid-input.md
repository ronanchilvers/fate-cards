# Task 2.2: Test cardSchema.js - normalizeCard Invalid/Missing Fields

**Completed**: 2026-01-27 21:10:01

## Task Summary

Add comprehensive tests for the `normalizeCard` function to verify it correctly handles invalid input, missing fields, and provides appropriate default values.

## Implementation

### Tests Added to `src/utils/cardSchema.test.js`

Added a new test suite with 10 test cases covering defensive coding and default value handling.

### Tests Implemented

#### Test 1: Returns null for non-object input

```javascript
it('returns null for non-object input', () => {
  expect(normalizeCard(null)).toBeNull()
  expect(normalizeCard(undefined)).toBeNull()
  expect(normalizeCard('string')).toBeNull()
  expect(normalizeCard(123)).toBeNull()
  expect(normalizeCard([])).toBeNull()
})
```

**Purpose**: Verifies the function rejects invalid input types and returns null.

**What it tests**:
- Null and undefined inputs
- String inputs
- Number inputs
- Array inputs (arrays should not be treated as card objects)

#### Test 2: Generates UUID when id is missing

```javascript
it('generates UUID when id is missing', () => {
  const result = normalizeCard({})
  expect(result.id).toBeDefined()
  expect(typeof result.id).toBe('string')
})
```

**Purpose**: Ensures cards without IDs get automatically generated UUIDs.

#### Test 3: Defaults title to "Untitled"

```javascript
it('defaults title to "Untitled" when missing or empty', () => {
  expect(normalizeCard({}).title).toBe('Untitled')
  expect(normalizeCard({ title: '' }).title).toBe('Untitled')
  expect(normalizeCard({ title: '   ' }).title).toBe('Untitled')
})
```

**Purpose**: Verifies empty or whitespace-only titles are replaced with "Untitled".

#### Test 4-10: Other default values

Additional tests verify defaults for:
- **subtitle**: Empty string when missing
- **elements**: Empty array when missing or invalid
- **category**: "PCs" when missing or empty
- **color**: "#1f2937" (dark gray) for invalid hex colors
- **layout**: "auto" for invalid layout values
- **layout validation**: Accepts valid values (auto, single-column, 2-column)
- **locked**: false when missing or invalid

### Bug Fix: Array Input Handling

During test implementation, discovered that arrays were being accepted as valid card objects since `typeof [] === 'object'` in JavaScript.

**Fixed in `src/utils/cardSchema.js`**:

```javascript
// Before:
if (typeof card !== 'object' || card === null) {
  return null
}

// After:
if (typeof card !== 'object' || card === null || Array.isArray(card)) {
  return null
}
```

This ensures arrays are properly rejected and return null, as they should not be treated as card objects.

### Test Results

```
✓ src/utils/cardSchema.test.js (12 tests) 2ms
  ✓ normalizeCard (2)
    ✓ returns a normalized card when given a valid card object 1ms
    ✓ preserves all valid fields from input 0ms
  ✓ normalizeCard - default values (10)
    ✓ returns null for non-object input 0ms
    ✓ generates UUID when id is missing 0ms
    ✓ defaults title to "Untitled" when missing or empty 0ms
    ✓ defaults subtitle to empty string 0ms
    ✓ defaults elements to empty array 0ms
    ✓ defaults category to "PCs" 0ms
    ✓ defaults color to "#1f2937" for invalid colors 0ms
    ✓ defaults layout to "auto" for invalid layouts 0ms
    ✓ accepts valid layout values 0ms
    ✓ defaults locked to false 0ms

Test Files  1 passed (1)
     Tests  12 passed (12)
```

✅ All 12 tests passing
✅ Bug fix implemented and verified
✅ Defensive coding thoroughly tested

### Coverage Summary

These tests verify:
- ✅ Invalid input types are rejected (null, undefined, strings, numbers, arrays)
- ✅ Missing IDs trigger UUID generation
- ✅ Empty/whitespace titles default to "Untitled"
- ✅ Missing subtitle defaults to empty string
- ✅ Invalid elements default to empty array
- ✅ Missing/empty category defaults to "PCs"
- ✅ Invalid colors default to "#1f2937"
- ✅ Invalid layouts default to "auto"
- ✅ Valid layout values are accepted
- ✅ Missing/invalid locked state defaults to false

### Code Quality Improvement

The array check addition improves defensive coding by ensuring only plain objects are accepted as cards, preventing potential bugs from array inputs being processed incorrectly.

### Next Steps

- Task 2.3: Test cardSchema.js - normalizeCards Array Function
- Task 2.4: Test storage.js - safeGetJSON
- Task 2.5: Test storage.js - safeSetJSON

## Status

✅ **Completed** - Invalid input and default value tests implemented and passing. Bug fix applied to reject array inputs.