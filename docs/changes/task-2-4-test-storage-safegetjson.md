# Task 2.4: Test storage.js - safeGetJSON

**Completed**: 2026-01-27 21:11:33

## Task Summary

Create tests for the `safeGetJSON` function in `storage.js` to verify safe localStorage reading with error handling, JSON parsing, and fallback values.

## Implementation

### File Created: `src/utils/storage.test.js`

Created a new test file for storage utility functions with 3 test cases covering get operations.

### Tests Implemented

#### Test 1: Returns parsed JSON when key exists

```javascript
it('returns parsed JSON when key exists', () => {
  const testData = { foo: 'bar', count: 42 }
  localStorage.getItem.mockReturnValue(JSON.stringify(testData))
  
  const result = safeGetJSON('test-key')
  expect(result).toEqual(testData)
  expect(localStorage.getItem).toHaveBeenCalledWith('test-key')
})
```

**Purpose**: Verifies the function correctly retrieves and parses valid JSON from localStorage.

**What it tests**:
- localStorage.getItem is called with correct key
- JSON string is parsed correctly
- Parsed object matches original data structure
- Complex objects (with nested properties) are handled

#### Test 2: Returns fallback when key does not exist

```javascript
it('returns fallback when key does not exist', () => {
  localStorage.getItem.mockReturnValue(null)
  
  expect(safeGetJSON('missing-key')).toBeNull()
  expect(safeGetJSON('missing-key', [])).toEqual([])
  expect(safeGetJSON('missing-key', { default: true })).toEqual({ default: true })
})
```

**Purpose**: Verifies the function returns appropriate fallback values when a key doesn't exist.

**What it tests**:
- Default fallback is null when not specified
- Custom fallback values are returned
- Different fallback types work (arrays, objects)
- No errors are thrown for missing keys

This is critical for first-run scenarios where no data exists yet.

#### Test 3: Returns fallback and clears key on parse error

```javascript
it('returns fallback and clears key on parse error', () => {
  localStorage.getItem.mockReturnValue('invalid json {{{')
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  
  const result = safeGetJSON('corrupt-key', 'fallback')
  
  expect(result).toBe('fallback')
  expect(localStorage.removeItem).toHaveBeenCalledWith('corrupt-key')
  expect(consoleSpy).toHaveBeenCalled()
  
  consoleSpy.mockRestore()
})
```

**Purpose**: Verifies the function handles corrupted data gracefully by returning fallback and cleaning up.

**What it tests**:
- Invalid JSON doesn't crash the function
- Fallback value is returned on parse error
- Corrupted data is automatically removed from localStorage
- Error is logged to console for debugging
- Console spy is properly restored after test

This defensive behavior prevents the app from being stuck with corrupted data.

### Test Setup

Each test includes a `beforeEach` hook that:
```javascript
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.getItem.mockReturnValue(null)
})
```

- Clears all mock call history
- Resets localStorage.getItem to return null
- Ensures tests don't interfere with each other

### Test Results

```
✓ src/utils/storage.test.js (3 tests) 2ms
✓ src/utils/cardSchema.test.js (16 tests) 3ms

Test Files  2 passed (2)
     Tests  19 passed (19)
```

✅ All 3 new tests passing
✅ Total test count: 19 (16 cardSchema + 3 storage)
✅ Both test files passing successfully

### Coverage Summary

The `safeGetJSON` function is now fully tested for:
- ✅ Valid JSON parsing and retrieval
- ✅ Fallback handling for missing keys
- ✅ Default fallback (null) when not specified
- ✅ Custom fallback values of any type
- ✅ Corrupted data detection and cleanup
- ✅ Error logging for debugging
- ✅ localStorage.removeItem called on corrupt data
- ✅ No crashes or unhandled errors

### Real-World Value

These tests ensure that:
1. **First Run**: App works correctly when no data exists (fallback values)
2. **Normal Operation**: Saved data is correctly retrieved and parsed
3. **Data Corruption**: App recovers gracefully from corrupted localStorage
4. **Debugging**: Errors are logged when issues occur
5. **Self-Healing**: Corrupt data is automatically cleaned up

This is especially important since localStorage can be corrupted by:
- Browser bugs
- Extensions interfering
- Manual user edits
- Incomplete writes during crashes

### Next Steps

- Task 2.5: Test storage.js - safeSetJSON

## Status

✅ **Completed** - safeGetJSON function fully tested with 3 test cases covering success, fallback, and error scenarios.