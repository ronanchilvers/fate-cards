# Task 3: Validate and normalize imported data

## Summary

Imported card data is now validated and normalized before being persisted to the app state. Malformed cards are filtered out with user feedback, preventing corrupted data from breaking the app on reload.

## Changes Made

### File: `src/App.jsx`

#### 1. Added import for normalizeCards utility
```javascript
import { normalizeCards } from './utils/cardSchema'
```

#### 2. Updated importCards function
The `importCards` function now validates and normalizes all imported cards in both old and new format:

**Old format (array of cards):**
- Calls `normalizeCards(importedData)` to validate and normalize cards
- Filters out any invalid cards
- Shows user feedback if cards were skipped
- Only persists valid cards to state

**New format (object with cards, skills, skillLevels):**
- Calls `normalizeCards(importedData.cards)` to validate and normalize cards
- Filters out any invalid cards
- Shows user feedback if cards were skipped
- Only persists valid cards to state
- Skills and skill levels are still imported as-is (they will be enhanced in future tasks)

## Implementation Details

### Card Validation Flow
1. User selects a JSON file to import
2. File is parsed with JSON.parse (with existing error handling)
3. Cards array is passed through `normalizeCards()` utility
4. The utility:
   - Returns `null` for invalid entries
   - Normalizes all valid entries with safe defaults
   - Filters out invalid entries
5. User is alerted if any cards were skipped
6. Only valid cards are persisted to state

### User Experience
- If all cards are valid: Silent import (no alert)
- If some cards are invalid: Alert shows number of skipped cards (e.g., "2 invalid cards were skipped during import.")
- If all cards are invalid: Empty cards array with alert
- Bad data never reaches localStorage

## Benefits

✅ **Data Integrity**: Corrupted or malformed cards cannot persist to localStorage
✅ **Resilience**: App won't crash on reload from bad imports
✅ **User Feedback**: Users know when data was skipped during import
✅ **Safe Defaults**: All missing or invalid fields get sensible defaults
✅ **Prevention**: Prevents cascading failures in Card rendering components

## Testing Recommendations

1. Import a file with some invalid card objects (missing id, wrong color, etc.)
2. Verify the alert shows correct count of skipped cards
3. Verify only valid cards appear in the app
4. Reload the app and confirm valid cards persist correctly
5. Import a file with all invalid cards and verify empty state works

## Depends On

- Task 2: Create a card schema validator/normalizer utility

## Enables

- Task 3 completes the high-priority data integrity improvements
- Provides foundation for more robust import/export features