# Task 8: Extract Card Templates to Separate File

## Task Summary

- **Status**: Completed
- **Priority**: Low
- **File**: Created new file `src/data/cardTemplates.js`
- **Modified**: `src/App.jsx`
- **Effort**: Medium

## Objective

Extract the large `templates` object from inside the `addTemplateCard()` function (~140 lines) to a separate module. This improves code organization, reduces App.jsx size, and makes template definitions easier to maintain and modify.

## Implementation

### 1. Created New Module: `src/data/cardTemplates.js`

Created a new data module with well-documented template factory functions:

**Key Design Decisions:**

- **Factory Functions**: Each template is a function that generates fresh data, ensuring unique IDs on every call
- **Named Exports**: Individual templates are exported (`standardPC`, `quickNPC`, `scene`, `blank`)
- **Lookup Object**: Main `cardTemplates` object maps template keys to factory functions
- **Documentation**: Each template includes JSDoc comments explaining its purpose

**Template Structure:**

```javascript
export const standardPC = () => ({
  title: 'New Character',
  subtitle: 'Player Character',
  elements: [
    // ... element definitions with crypto.randomUUID() for IDs
  ]
})

export const cardTemplates = {
  'standard-pc': standardPC,
  'quick-npc': quickNPC,
  'scene': scene,
  'blank': blank
}
```

### 2. Updated `src/App.jsx`

**Added Import (Line 5):**
```javascript
import { cardTemplates } from './data/cardTemplates'
```

**Simplified `addTemplateCard` Function (Lines 271-283):**

**Before (145 lines):**
```javascript
const addTemplateCard = (category, template) => {
  const templates = {
    'standard-pc': { /* 60 lines */ },
    'quick-npc': { /* 50 lines */ },
    'scene': { /* 20 lines */ },
    'blank': { /* 5 lines */ }
  }
  
  const templateData = templates[template] || templates['blank']
  const newCard = {
    id: crypto.randomUUID(),
    category,
    color: getCategoryColor(category),
    layout: 'auto',
    ...templateData
  }
  setCards([...cards, newCard])
}
```

**After (13 lines):**
```javascript
const addTemplateCard = (category, template) => {
  // Get template factory function and call it to generate fresh data with new IDs
  const templateFactory = cardTemplates[template] || cardTemplates['blank']
  const templateData = templateFactory()
  const newCard = {
    id: crypto.randomUUID(),
    category,
    color: getCategoryColor(category),
    layout: 'auto',
    ...templateData
  }
  setCards([...cards, newCard])
}
```

### 3. Created `src/data/` Directory

- Created new directory structure for data modules
- Follows convention established by existing `src/utils/` and `src/components/` directories

## Benefits

### Code Organization
- **Separation of Concerns**: Template definitions are now separated from app logic
- **Reduced File Size**: App.jsx reduced by ~140 lines (from ~880 to ~740 lines)
- **Clearer Intent**: Template module clearly documents what each template contains

### Maintainability
- **Easier to Modify**: Template structures can be updated without navigating App.jsx
- **Reusability**: Templates can potentially be imported by other modules if needed
- **Testing**: Template module can be tested independently

### Developer Experience
- **Better Documentation**: Each template has clear comments explaining its purpose
- **Discoverability**: Developers know exactly where to find template definitions
- **Consistency**: Templates follow a uniform factory function pattern

## Template Definitions

### `standardPC` (Standard Player Character)
Full character sheet with:
- High Concept & Trouble
- 3 Aspect slots
- Skills section
- Physical & Mental Stress Tracks (4 boxes each, value 1)
- Consequences (Mild, Moderate, Severe)
- Fate Points (3 current, 3 refresh)

### `quickNPC` (Quick Non-Player Character)
Simplified NPC sheet with:
- High Concept & Trouble
- 1 Aspect slot
- Skills section
- Physical & Mental Stress Tracks (4 boxes each, values 1-4)
- Consequences (Mild, Moderate, Severe)

### `scene` (Scene/Location)
Minimal structure with:
- High Concept
- 2 Aspect slots
- Note section

### `blank` (Blank Card)
Empty card for custom use:
- Title: "New Card"
- No subtitle
- No elements

## Technical Notes

### Factory Pattern
Templates are implemented as factory functions rather than static objects to ensure:
- **Fresh IDs**: Each call generates new `crypto.randomUUID()` values
- **No Shared State**: Each card gets its own independent data structure
- **Consistency**: Follows the same pattern used elsewhere in the codebase

### Backward Compatibility
- No changes to template keys or data structures
- Existing functionality preserved exactly
- All template features work identically

## Testing

- Build completed successfully with no errors
- Module count increased from 35 to 36 (new cardTemplates module)
- Bundle size increased negligibly (~60 bytes)
- All template types generate correctly

## File Statistics

**App.jsx:**
- Before: ~880 lines
- After: ~740 lines
- Reduction: ~140 lines (16%)

**New Module:**
- cardTemplates.js: 187 lines (includes documentation)

## Next Steps

The next pending task is **Task 9: Extract localStorage helpers to utility module** (Low priority). This will further improve code organization by centralizing localStorage error handling.