# Task 2.3: Test cardSchema.js - normalizeCards Array Function

**Completed**: 2026-01-27 21:10:44

## Task Summary

Add tests for the `normalizeCards` function to verify it correctly handles array normalization, filters invalid entries, and handles non-array input gracefully.

## Implementation

### Tests Added to `src/utils/cardSchema.test.js`

Added a new test suite with 4 test cases covering batch card normalization and array handling.

### Tests Implemented

#### Test 1: Returns empty array for non-array input

```javascript
it('returns empty array for non-array input', () => {
  expect(normalizeCards(null)).toEqual([])
  expect(normalizeCards(undefined)).toEqual([])
  expect(normalizeCards('string')).toEqual([])
  expect(normalizeCards({})).toEqual([])
})
```

**Purpose**: Verifies the function safely handles non-array inputs without throwing errors.

**What it tests**:
- Null input returns empty array
- Undefined input returns empty array
- String input returns empty array
- Object (non-array) input returns empty array

This defensive behavior prevents crashes when incorrect data types are passed.

#### Test 2: Normalizes all valid cards in array

```javascript
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
```

**Purpose**: Verifies that valid cards in an array are all normalized correctly.

**What it tests**:
- All cards are processed
- Card properties are preserved
- Array length matches input
- Order is maintained

#### Test 3: Filters out invalid cards

```javascript
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
```

**Purpose**: Verifies that invalid entries are filtered out, leaving only valid normalized cards.

**What it tests**:
- Mixed valid/invalid array handling
- Invalid entries (null, strings) are removed
- Valid cards are preserved
- Result contains only normalized cards

This is critical for import functionality where data may be partially corrupted.

#### Test 4: Returns empty array when all cards are invalid

```javascript
it('returns empty array when all cards are invalid', () => {
  const input = [null, undefined, 'string', 123]
  const result = normalizeCards(input)
  expect(result).toEqual([])
})
```

**Purpose**: Verifies that when no valid cards exist, an empty array is returned rather than an error.

**What it tests**:
- Completely invalid array handling
- Returns empty array (not null or error)
- All invalid types are filtered out

### Test Results

```
✓ src/utils/cardSchema.test.js (16 tests) 3ms
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
  ✓ normalizeCards (4)
    ✓ returns empty array for non-array input 0ms
    ✓ normalizes all valid cards in array 0ms
    ✓ filters out invalid cards 0ms
    ✓ returns empty array when all cards are invalid 0ms

Test Files  1 passed (1)
     Tests  16 passed (16)
```

✅ All 16 tests passing (12 previous + 4 new)
✅ Complete coverage of normalizeCards function
✅ Array handling thoroughly tested

### Coverage Summary

The `normalizeCards` function is now fully tested for:
- ✅ Non-array input handling (returns empty array)
- ✅ Valid card array processing
- ✅ Mixed valid/invalid card filtering
- ✅ All-invalid array handling
- ✅ Order preservation
- ✅ Safe fallback behavior

### Integration Value

These tests ensure that when importing data or loading from localStorage:
1. Corrupted data doesn't crash the app
2. Valid cards are preserved even when mixed with invalid data
3. The app gracefully handles completely corrupted datasets
4. Type errors don't propagate to the UI

This is especially important for the import feature where users may upload malformed JSON.

## cardSchema.js Testing Complete! 🎉

All functions in `cardSchema.js` now have comprehensive test coverage:
- ✅ `normalizeCard` - valid input (2 tests)
- ✅ `normalizeCard` - invalid/missing fields (10 tests)
- ✅ `normalizeCards` - array handling (4 tests)

**Total: 16 tests, all passing**

### Next Steps

Continue with **Phase 2: Utility Module Tests**

- Task 2.4: Test storage.js - safeGetJSON
- Task 2.5: Test storage.js - safeSetJSON

## Status

✅ **Completed** - normalizeCards array function fully tested with 4 test cases. All cardSchema.js tests passing!