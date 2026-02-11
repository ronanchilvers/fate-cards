# Task 3.2 - Clickable Skill Ratings for Dice Rolls

## Objective
Allow clicking the skill rating (+4, +3, etc) in the Skills element to roll the dice, automatically adding the skill rating to the end result.

## Requirements
- Skill ratings should be clickable in locked view
- Clicking a rating triggers a dice roll
- The dice roll result should include the skill rating bonus
- Display format: "Total: +X (Dice: +Y, Skill: +Z)" or similar
- Should work seamlessly with existing dice rolling system

## Current Implementation Analysis

### SkillsElement.jsx
**Locked View:**
- Displays skills grouped by rating level
- Shows rating label (e.g., "+4", "+3") next to level name
- Currently not interactive
- Located in: `.skill-level-heading` > `.skill-level-rating`

**Unlocked View:**
- Editing mode, should not trigger dice rolls
- Keep as-is

### App.jsx Dice Rolling System
**handleRollDice():**
- Sets rolling state and increments rollId
- No parameters currently
- Triggers FateDiceRoller via rollId prop

**handleDiceResult(total):**
- Receives dice total from FateDiceRoller
- Shows toast with result
- Duration: 10 seconds (recently updated)

**FateDiceRoller:**
- Rolls 4 Fate dice
- Returns total via `onResult` callback
- Total range: -4 to +4
- Self-contained, doesn't know about skill bonuses

### Data Flow
1. User clicks skill rating → Need to capture rating value
2. Trigger dice roll → handleRollDice needs to accept optional bonus
3. Store bonus in state → Need state to track pending bonus
4. Dice completes → handleDiceResult receives dice total
5. Calculate final total → dice total + skill bonus
6. Display result → show both dice total and final total

## Proposed Solution

### 1. Add State for Skill Bonus
**File:** `src/App.jsx`

Add state to track pending skill roll:
```javascript
const [pendingSkillBonus, setPendingSkillBonus] = useState(null)
```

### 2. Update handleRollDice to Accept Bonus
**File:** `src/App.jsx`

Modify to accept optional skillBonus parameter:
```javascript
const handleRollDice = (skillBonus = null) => {
  if (isDiceRolling) return
  setIsDiceRolling(true)
  setPendingSkillBonus(skillBonus)
  setDiceRollId((current) => current + 1)
  setShowMobileMenu(false)
}
```

### 3. Update handleDiceResult to Include Bonus
**File:** `src/App.jsx`

Modify to calculate and display total with skill bonus:
```javascript
const handleDiceResult = useCallback((diceTotal) => {
  const diceValue = Number.isFinite(diceTotal) ? diceTotal : 0
  const skillBonus = pendingSkillBonus ?? 0
  const finalTotal = diceValue + skillBonus
  
  const diceLabel = diceValue > 0 ? `+${diceValue}` : `${diceValue}`
  const finalLabel = finalTotal > 0 ? `+${finalTotal}` : `${finalTotal}`
  
  let message = `Total: ${finalLabel}`
  if (skillBonus !== null && skillBonus !== 0) {
    const bonusLabel = skillBonus > 0 ? `+${skillBonus}` : `${skillBonus}`
    message += ` (Dice: ${diceLabel}, Skill: ${bonusLabel})`
  } else {
    message = `Total: ${finalLabel}`
  }
  
  toast.alert({
    title: 'Fate Dice Result',
    message,
    duration: 10000,
    onDismiss: () => {
      setDiceDismissId((current) => current + 1)
      setPendingSkillBonus(null)
    }
  })
  
  // Clear pending bonus after result
  setPendingSkillBonus(null)
}, [toast, pendingSkillBonus])
```

### 4. Pass handleRollDice to Card Component
**File:** `src/App.jsx`

Add prop to Card components:
```javascript
<Card
  // ... existing props
  onRollDice={handleRollDice}
/>
```

### 5. Thread onRollDice Through Card
**File:** `src/components/Card.jsx`

- Accept `onRollDice` prop
- Pass it to SkillsElement when rendering

In Card function signature:
```javascript
function Card({ 
  card, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  categories, 
  allSkills, 
  allSkillLevels,
  onRollDice  // Add this
}) {
```

In renderElement function, when rendering SkillsElement:
```javascript
case 'skills':
  ElementComponent = SkillsElement
  elementProps = { 
    skills: allSkills, 
    skillLevels: allSkillLevels,
    onRollDice  // Add this
  }
  break
```

### 6. Make Skill Ratings Clickable in SkillsElement
**File:** `src/components/elements/SkillsElement.jsx`

Update locked view to make ratings clickable:
```javascript
function SkillsElement({ 
  element, 
  skills = [], 
  skillLevels = [], 
  isLocked, 
  onUpdate, 
  onDelete, 
  showDragHandle, 
  dragHandleProps,
  onRollDice  // Add this prop
}) {
```

In locked view, make rating clickable:
```javascript
<div className="skill-level-heading">
  <Icon name="aspectBullet" className="aspect-bullet" size={12} aria-hidden="true" />
  <span className="skill-level-name">{level.label}</span>
  {onRollDice ? (
    <button
      className="skill-level-rating clickable"
      onClick={() => onRollDice(level.value)}
      title={`Roll dice with ${level.ratingLabel} skill bonus`}
      aria-label={`Roll dice with ${level.displayLabel}`}
    >
      {level.ratingLabel}
    </button>
  ) : (
    <span className="skill-level-rating">{level.ratingLabel}</span>
  )}
</div>
```

### 7. Add CSS for Clickable Rating
**File:** `src/App.css` or appropriate CSS file

Add styles for clickable skill rating:
```css
.skill-level-rating.clickable {
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  transition: background-color 0.2s ease;
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
}

.skill-level-rating.clickable:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.skill-level-rating.clickable:active {
  background-color: rgba(255, 255, 255, 0.2);
}
```

## Edge Cases to Handle

1. **Multiple quick clicks:** Prevent rolling if already rolling (already handled by `isDiceRolling` check)
2. **Skill bonus of 0:** Display appropriately in toast
3. **Negative skill bonuses:** Handle correctly in display
4. **No skill bonus (regular dice button):** Pass null/undefined, show simple format
5. **Toast dismissal:** Clear pending bonus when toast is dismissed

## Testing Considerations

- Test clicking different skill ratings (+4, +3, +2, etc.)
- Test with negative skill ratings (if any exist)
- Test regular dice button still works (no skill bonus)
- Test rapid clicking doesn't trigger multiple rolls
- Test toast displays correct breakdown
- Test on mobile (touch interaction)
- Verify locked/unlocked behavior (only locked should be clickable)

## Implementation Steps

1. Add `pendingSkillBonus` state to App.jsx
2. Update `handleRollDice` to accept and store bonus
3. Update `handleDiceResult` to calculate and display total with bonus
4. Pass `onRollDice` prop through Card to SkillsElement
5. Update SkillsElement to make ratings clickable in locked view
6. Add CSS styles for clickable ratings
7. Test with various skill levels and scenarios

## UI/UX Considerations

- **Visual feedback:** Hover effect on clickable ratings
- **Accessibility:** Proper aria-labels and button semantics
- **Clear indication:** Users should know ratings are clickable
- **Toast clarity:** Breakdown should be easy to understand
- **Consistency:** Style should match existing interactive elements

## Alternative Approaches Considered

**Approach A:** Pass dice roller as context
- More complex
- Overkill for this use case

**Approach B:** Custom event system
- Unnecessary complexity
- Props are simpler and more React-like

**Chosen Approach:** Props drilling
- Simple and clear
- Follows existing patterns in the codebase
- Easy to understand and maintain

## Notes

- Keep skill ratings non-clickable in unlocked/edit mode
- Preserve all existing functionality
- Ensure dice rolling system remains robust
- Toast format should be informative but not cluttered