# Task 4: Sync Card locked state with prop changes

## Summary
Added a `useEffect` hook to the Card component that synchronizes the local `isLocked` state whenever the `card.locked` prop changes. This ensures the UI always reflects the correct lock state after imports or external updates.

## Problem
After imports or external updates to card data, the Card component's local `isLocked` state could become out of sync with the actual `card.locked` prop value. This could allow users to edit cards that were supposed to be locked, leading to unintended modifications.

## Solution
- **File Modified**: `src/components/Card.jsx`
- **Changes Made**:
  1. Added `useEffect` to the React import statement (line 1)
  2. Added a `useEffect` hook after the `isLocked` state declaration (lines 9-11) that:
     - Watches the `card.locked` prop via the dependency array `[card.locked]`
     - Updates the local `isLocked` state whenever the prop changes
     - Uses the pattern `setIsLocked(card.locked || false)` to handle undefined values safely

## Code Changes
```javascript
// Before
import { useState } from 'react'
const [isLocked, setIsLocked] = useState(card.locked || false)

// After
import { useState, useEffect } from 'react'
const [isLocked, setIsLocked] = useState(card.locked || false)

// Sync locked state when card prop changes
useEffect(() => {
  setIsLocked(card.locked || false)
}, [card.locked])
```

## Testing
- Build verification: ✅ npm run build succeeds with no errors
- No breaking changes to existing functionality
- The UI will now properly reflect lock state changes from external sources (imports, parent component updates, etc.)

## Impact
- **Low risk**: Simple, targeted change using standard React patterns
- **High value**: Prevents data corruption by ensuring UI state stays in sync with actual card data