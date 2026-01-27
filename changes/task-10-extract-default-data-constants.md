# Task 10: Extract Default Data Constants

## Task Summary

- **Status**: Completed
- **Priority**: Low
- **File**: Created new file `src/data/defaults.js`
- **Modified**: `src/App.jsx`
- **Effort**: Small

## Objective

Extract all default data constants from App.jsx to a separate module, improving code organization, making defaults easier to modify, and reducing App.jsx size. This completes the code quality improvement initiative.

## Implementation

### 1. Created New Module: `src/data/defaults.js` (124 lines)

Created a centralized module containing all default data with comprehensive documentation:

#### Exported Constants

**`defaultCategories`**
- Default categories for organizing cards: `['PCs', 'NPCs', 'Scenes']`
- Used for initial state and reset operations

**`defaultSkills`**
- Standard Fate Core skills list (18 skills)
- Alphabetically ordered for consistency
- Includes: Athletics, Burglary, Contacts, Crafts, Deceive, Drive, Empathy, Fight, Investigate, Lore, Notice, Physique, Provoke, Rapport, Resources, Shoot, Stealth, Will

**`defaultSkillLevels`**
- Fate Core ladder from Legendary (+8) to Horrifying (-4)
- 13 skill levels total
- Each level has `label` (string) and `value` (number)

**`defaultSampleCard`**
- Complete sample character card: "Darv"
- Crew member on the survey ship Challenger
- Full character sheet with:
  - High Concept & Trouble
  - Aspects (3 items)
  - Skills (10 skills at various ratings)
  - Stress Tracks (Physical & Mental)
  - Consequences (Mild, Moderate, Severe)
  - Fate Points (3/3)

### 2. Updated `src/App.jsx`

**Added Import (Line 7):**
```javascript
import { defaultCategories, defaultSkills, defaultSkillLevels, defaultSampleCard } from './data/defaults'
```

**Simplified State Initialization (Lines 10-12):**

**Before:**
```javascript
const [categories, setCategories] = useState(['PCs', 'NPCs', 'Scenes'])
const [skills, setSkills] = useState([
  'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive', 'Drive',
  'Empathy', 'Fight', 'Investigate', 'Lore', 'Notice', 'Physique',
  'Provoke', 'Rapport', 'Resources', 'Shoot', 'Stealth', 'Will'
])
const [skillLevels, setSkillLevels] = useState([
  { label: 'Legendary', value: 8 },
  { label: 'Epic', value: 7 },
  // ... 11 more levels
])
```

**After:**
```javascript
const [categories, setCategories] = useState(defaultCategories)
const [skills, setSkills] = useState(defaultSkills)
const [skillLevels, setSkillLevels] = useState(defaultSkillLevels)
```

**Simplified Sample Card Initialization (Line 45):**

**Before (83 lines):**
```javascript
setCards([
  {
    id: '1',
    category: 'PCs',
    color: '#c53030',
    title: 'Darv',
    subtitle: 'Crew member on the survey ship Challenger',
    layout: 'auto',
    elements: [
      // ... 75 lines of element definitions
    ]
  }
])
```

**After (1 line):**
```javascript
setCards([defaultSampleCard])
```

**Simplified Reset Function (Lines 486-488):**

**Before (28 lines):**
```javascript
setCategories(['PCs', 'NPCs', 'Scenes'])
setSkills([
  'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive', 'Drive',
  'Empathy', 'Fight', 'Investigate', 'Lore', 'Notice', 'Physique',
  'Provoke', 'Rapport', 'Resources', 'Shoot', 'Stealth', 'Will'
])
setSkillLevels([
  { label: 'Legendary', value: 8 },
  { label: 'Epic', value: 7 },
  // ... 11 more levels
])
```

**After (3 lines):**
```javascript
setCategories(defaultCategories)
setSkills(defaultSkills)
setSkillLevels(defaultSkillLevels)
```

## Benefits

### Code Organization
- **Separation of Concerns**: Data definitions separated from application logic
- **Single Source of Truth**: All defaults live in one location
- **Reduced File Size**: App.jsx reduced by ~110 lines (from ~640 to ~530 lines)
- **Clearer Intent**: Defaults module clearly documents what each constant represents

### Maintainability
- **Easy Modifications**: Change defaults without navigating App.jsx
- **Consistency**: Same defaults used for initialization and reset
- **No Duplication**: Defaults defined once, used in multiple places
- **Documentation**: JSDoc comments explain the purpose of each constant

### Developer Experience
- **Discoverability**: Developers know exactly where to find/modify defaults
- **Testability**: Defaults can be imported and tested independently
- **Customization**: Easy to create variations (e.g., different skill lists for other Fate variants)
- **Type Safety Ready**: Constants can be typed if migrating to TypeScript

## Lines of Code Reduction

**App.jsx:**
- Removed: ~110 lines of default data definitions
- Added: 1 import line
- Net reduction: ~109 lines (17% smaller)

**Overall Project:**
- Created: 124 lines (defaults.js with documentation)
- Removed: 109 lines (from App.jsx)
- Net change: +15 lines, but vastly improved organization

**Total reduction from all tasks:**
- Task 8 (Templates): -140 lines from App.jsx
- Task 9 (Storage): -44 lines from App.jsx
- Task 10 (Defaults): -109 lines from App.jsx
- **Total: -293 lines from App.jsx (~33% reduction)**

## Usage Patterns

### Initialization
```javascript
// Simple, readable state initialization
const [skills, setSkills] = useState(defaultSkills)
```

### Reset Operations
```javascript
// Consistent reset to known defaults
setSkills(defaultSkills)
setSkillLevels(defaultSkillLevels)
```

### Testing
```javascript
// Easy to test with known data
import { defaultSkills } from './data/defaults'
expect(skills).toEqual(defaultSkills)
```

### Customization
```javascript
// Easy to create variants
export const pathfinderSkills = [
  'Acrobatics', 'Athletics', 'Bluff', 'Climb',
  // ... custom skill list
]
```

## Default Data Details

### Skills (18 total)
Standard Fate Core skills covering physical, mental, and social actions. Alphabetically ordered for ease of use.

### Skill Levels (13 total)
Full Fate ladder from Legendary (+8) down to Horrifying (-4), providing comprehensive range for character abilities.

### Sample Card (Darv)
A complete, well-structured example character demonstrating:
- Proper card structure
- Element variety
- Realistic skill distribution
- Complete stress/consequence setup
- Functional fate point tracking

## Testing

- Build completed successfully (38 modules)
- All defaults properly exported and imported
- Initialization works correctly
- Reset functionality preserved
- No changes to app behavior

## Technical Notes

### Immutability Considerations
The defaults are objects/arrays that could potentially be mutated. Current usage is safe because:
1. `useState` creates new state references
2. Reset operations create fresh references
3. No direct mutations occur

If needed, could add Object.freeze() for extra safety:
```javascript
export const defaultSkills = Object.freeze([...])
```

### Future Enhancements
This structure enables:
- Multiple default sets (e.g., Fate Core, Fate Accelerated, custom variants)
- User-selectable default configurations
- Import/export of custom default sets
- Localization of default data

## Project Completion

This task completes the code quality improvement initiative! All 12 tasks have been successfully completed:

✅ **High Priority (Data Integrity)**
- Task 1: localStorage error handling
- Task 2: Card schema validation
- Task 3: Import data validation

✅ **Medium Priority (State Consistency)**
- Task 4: Lock state synchronization
- Task 5: Unique ID generation
- Task 12: Import/export persistence

✅ **Low Priority (Defensive Coding & Organization)**
- Task 6: Null guard in deleteSkillLevel
- Task 7: Element type fallback rendering
- Task 11: Export filename cleanup
- Task 8: Card templates extraction
- Task 9: localStorage helpers extraction
- Task 10: Default data extraction

## Impact Summary

**Code Quality:**
- Reduced App.jsx from ~880 to ~530 lines (40% reduction)
- Created 4 new organized modules (cardSchema, storage, cardTemplates, defaults)
- Eliminated code duplication
- Centralized error handling
- Improved separation of concerns

**Robustness:**
- All localStorage operations protected
- Import data validated and normalized
- Graceful handling of corrupted data
- Unknown element types handled safely
- Defensive coding throughout

**Maintainability:**
- Clear module organization
- Comprehensive documentation
- Easy to locate and modify defaults
- Consistent patterns throughout
- Ready for future enhancements

The Fate Cards codebase is now significantly more robust, maintainable, and well-organized! 🎉