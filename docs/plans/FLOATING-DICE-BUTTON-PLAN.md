# Floating Dice Roller Button - Implementation Plan

## Overview
Update the dice rolling mechanism to use a floating action button (FAB) in the bottom-right corner instead of a navigation item in the header.

## Current State
- Dice roller is triggered by a "Roll Fate Dice" button in the header navigation (`src/App.jsx` lines 310-317)
- Button uses the `rollDice` icon (which maps to Lucide's `Dices` icon)
- Button is disabled while dice are rolling (`isDiceRolling` state)
- `FateDiceRoller` component renders as a fixed fullscreen overlay when active

## Proposed Changes

### 1. Remove Navigation Button (App.jsx)
**Location:** `src/App.jsx` lines 310-317

**Action:** Delete the entire button element:
```jsx
<button
  onClick={handleRollDice}
  className="action-btn roll-dice-btn"
  disabled={isDiceRolling}
  aria-disabled={isDiceRolling}
>
  <Icon name="rollDice" className="action-icon" aria-hidden="true" />
  Roll Fate Dice
</button>
```

### 2. Create Floating Action Button Component
**Location:** Create new file `src/components/FloatingDiceButton.jsx`

**Features:**
- Fixed positioning in bottom-right corner
- Circular button design (FAB pattern)
- Uses `Dices` icon from Lucide (via Icon component with `name="rollDice"`)
- Disabled state while dice are rolling
- Appropriate hover/active states
- Accessible (aria-label, disabled state)

**Props:**
- `onClick` - handler to trigger dice roll
- `disabled` - boolean for rolling state
- `isDark` - theme awareness for styling

### 3. Create Floating Button Styles
**Location:** Create new file `src/components/FloatingDiceButton.css`

**Styling requirements:**
- Position: `fixed`, bottom-right corner
- Spacing: ~24px from bottom and right edges (adjust for mobile)
- Size: ~56px diameter (standard FAB size)
- z-index: Should be above cards but below modals (z-index: 10)
- Border-radius: 50% for circular shape
- Box-shadow: Elevated shadow for floating appearance
- Background: Theme-aware colors
- Transitions: Smooth hover and active states
- Disabled state: Reduced opacity, no pointer events/cursor change
- Responsive: Adjust positioning for mobile if needed

**Color scheme:**
- Light mode: Background similar to action buttons or primary accent
- Dark mode: Complementary dark background
- Icon color: High contrast for visibility

### 4. Integrate FAB into App
**Location:** `src/App.jsx`

**Action:** Add FloatingDiceButton after the FateDiceRoller component (after line 352)
```jsx
<FloatingDiceButton
  onClick={handleRollDice}
  disabled={isDiceRolling}
  isDark={theme.isDark}
/>
```

**Import:** Add to imports section (after line 6)
```jsx
import FloatingDiceButton from './components/FloatingDiceButton'
```

### 5. Mobile Menu Cleanup
**Location:** `src/App.jsx` and `src/App.css`

**Optional:** Since the dice button is removed from the header, verify that mobile menu layout still looks good. No CSS changes should be needed, but test the mobile hamburger menu to ensure proper spacing.

## Implementation Order

1. **Create FloatingDiceButton.jsx** - Build the component with all props and accessibility features
2. **Create FloatingDiceButton.css** - Style the FAB with theme support and states
3. **Integrate into App.jsx** - Import and render the new component
4. **Remove old button** - Delete the navigation button from header
5. **Test** - Verify functionality, accessibility, and responsive behavior

## Testing Checklist

- [ ] FAB appears in bottom-right corner
- [ ] FAB triggers dice roll on click
- [ ] FAB shows disabled state while dice are rolling
- [ ] FAB styling works in both light and dark themes
- [ ] FAB has appropriate hover states
- [ ] FAB is accessible (keyboard navigation, screen readers)
- [ ] FAB doesn't interfere with card interactions
- [ ] FAB is properly positioned on mobile devices
- [ ] Navigation button is completely removed
- [ ] No console errors or warnings

## File Changes Summary

### New Files
- `src/components/FloatingDiceButton.jsx`
- `src/components/FloatingDiceButton.css`

### Modified Files
- `src/App.jsx` (remove button, add FAB import and render)

### No Changes Required
- `src/components/FateDiceRoller.jsx` (unchanged)
- `src/components/FateDiceRoller.css` (unchanged)
- `src/components/icons/iconMap.js` (already has Dices icon)

## Design Notes

- The FAB should feel like a persistent, always-available action
- Use subtle animation/transition for polish (scale on hover, etc.)
- Consider pulse animation or visual feedback when becoming available after roll completes
- Ensure the button doesn't cover important UI elements (cards, modals)
- Follow Material Design FAB guidelines for familiarity

## Accessibility Considerations

- Include `aria-label="Roll Fate Dice"`
- Use `aria-disabled` when rolling is in progress
- Ensure keyboard focus is visible
- Maintain color contrast ratios (WCAG AA minimum)
- Consider adding tooltips on hover for clarity

## Implementation Complete ✓

All changes have been successfully implemented:

### Files Created
- ✅ `src/components/FloatingDiceButton.jsx` - FAB component with full accessibility
- ✅ `src/components/FloatingDiceButton.css` - Theme-aware styling with responsive breakpoints

### Files Modified
- ✅ `src/App.jsx` - Added FloatingDiceButton import and render, removed navigation button

### Implementation Details

**FloatingDiceButton.jsx:**
- Uses Lucide `Dices` icon via Icon component (`name="rollDice"`)
- Props: `onClick`, `disabled`, `isDark`
- Full keyboard support (Enter/Space)
- Visual press feedback with temporary state
- Accessible with `aria-label`, `aria-disabled`, and `title`

**FloatingDiceButton.css:**
- 56px diameter FAB (52px on tablet, 48px on mobile)
- Fixed positioning: 24px from bottom-right (20px tablet, 16px mobile)
- z-index: 10 (above cards, below modals)
- Theme-aware colors (slate-700 light, slate-200 dark)
- Elevated shadows with hover enhancement
- Scale animations: 1.05 on hover, 0.95 on press
- Focus-visible outline for keyboard navigation
- Disabled state with 50% opacity

**App.jsx Changes:**
- Line 7: Added `import FloatingDiceButton from './components/FloatingDiceButton'`
- Lines 310-318: Removed "Roll Fate Dice" navigation button
- Lines 349-353: Added FloatingDiceButton component after FateDiceRoller

### Verification
- ✅ No TypeScript/linting errors
- ✅ Import correctly added
- ✅ Old button completely removed
- ✅ FAB integrated with existing state handlers
- ✅ Theme support maintained
- ✅ All files in correct locations

The floating dice button is now ready for testing!