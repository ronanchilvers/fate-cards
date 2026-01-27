# Fate Cards — Code Quality Issues

**Extracted from**: Codebase Review  
**Review Date**: 2026-01-27  
**Category**: Code Quality

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 2 |
| Medium | 5 |
| Low | 4 |

---

## B.1 [HIGH] Monolithic Component (App.jsx)

**Location**: `src/App.jsx` (824 lines)

**Description**: The main App component is extremely large, containing:
- 17+ state variables
- 20+ handler functions
- 3 modal dialogs inline
- All application logic

This violates the Single Responsibility Principle and makes the code difficult to maintain, test, and debug.

**Impact**: 
- Difficult to understand and modify
- Hard to test individual pieces
- Poor separation of concerns
- Potential for bugs during modifications

**Recommendation**: Break into smaller components:
```
src/
├── components/
│   ├── App.jsx (orchestration only)
│   ├── Header/
│   │   ├── Header.jsx
│   │   └── MobileMenu.jsx
│   ├── Cards/
│   │   ├── CardList.jsx
│   │   └── CategorySection.jsx
│   └── Modals/
│       ├── TemplateModal.jsx
│       ├── CategoryModal.jsx
│       ├── SkillsAdminModal.jsx
│       └── SkillLevelsAdminModal.jsx
├── hooks/
│   ├── useCards.js
│   ├── useCategories.js
│   ├── useSkills.js
│   └── useTheme.js
└── context/
    └── AppContext.jsx
```

---

## B.2 [HIGH] Card.jsx Component Complexity

**Location**: `src/components/Card.jsx` (900 lines)

**Description**: The Card component contains a massive `renderElement` function (570+ lines) with a large switch statement handling 8+ element types. This function alone is larger than most entire components should be.

**Impact**:
- Very difficult to maintain
- High cognitive load to understand
- Testing individual element types is cumbersome
- Changes to one element type risk breaking others

**Recommendation**: Extract each element type into its own component:
```
src/components/
├── Card.jsx (main card chrome)
└── elements/
    ├── HighConceptElement.jsx
    ├── TroubleElement.jsx
    ├── AspectsElement.jsx
    ├── SkillsElement.jsx
    ├── StressTracksElement.jsx
    ├── ConsequencesElement.jsx
    ├── NoteElement.jsx
    └── FatePointsElement.jsx
```

---

## B.3 [MEDIUM] Inconsistent State Management

**Location**: `src/App.jsx`, `src/components/Card.jsx`

**Description**: The application mixes different patterns for state management:
- Top-level state in App.jsx passed via props
- Local component state in Card.jsx
- Direct localStorage access for some settings (theme)
- `safeSetJSON` for others (cards, categories)

```javascript
// Inconsistent: some use safeSetJSON
safeSetJSON('fate-cards', cards)

// Others use direct localStorage
localStorage.setItem('fate-thememode', themeMode)
```

**Recommendation**: Standardize on `safeSetJSON` for all JSON data and consider using React Context or a state management library (Zustand, Jotai) for cleaner state flow.

---

## B.4 [MEDIUM] Magic Strings Throughout Codebase

**Location**: Multiple files

**Description**: String literals are used extensively for:
- localStorage keys: `'fate-cards'`, `'fate-categories'`, etc.
- Element types: `'high-concept'`, `'trouble'`, `'aspects'`, etc.
- Layout values: `'auto'`, `'single-column'`, `'2-column'`
- Template keys: `'standard-pc'`, `'quick-npc'`, etc.

**Recommendation**: Create constants file:
```javascript
// src/constants.js
export const STORAGE_KEYS = {
  CARDS: 'fate-cards',
  CATEGORIES: 'fate-categories',
  SKILLS: 'fate-skills',
  SKILL_LEVELS: 'fate-skill-levels',
  THEME_MODE: 'fate-thememode',
  COLLAPSED_CATEGORIES: 'fate-collapsed-categories',
  LAST_EXPORT_FILENAME: 'fate-last-export-filename'
}

export const ELEMENT_TYPES = {
  HIGH_CONCEPT: 'high-concept',
  TROUBLE: 'trouble',
  ASPECTS: 'aspects',
  // ...
}

export const LAYOUTS = {
  AUTO: 'auto',
  SINGLE_COLUMN: 'single-column',
  TWO_COLUMN: '2-column'
}
```

---

## B.5 [MEDIUM] Duplicate Element Creation Logic

**Location**: `src/components/Card.jsx` lines 70-138, `src/data/cardTemplates.js`

**Description**: The element structure definitions are duplicated between:
1. `createNewElement()` in Card.jsx
2. Template factory functions in cardTemplates.js

**Recommendation**: Centralize element factory functions:
```javascript
// src/data/elementFactories.js
export const createHighConceptElement = () => ({
  id: crypto.randomUUID(),
  type: 'high-concept',
  text: ''
})

// Use in both Card.jsx and cardTemplates.js
```

---

## B.6 [MEDIUM] No Error Boundaries

**Location**: Application-wide

**Description**: The application lacks React Error Boundaries. If a component throws an error during rendering, the entire app crashes.

**Recommendation**: Add error boundaries around major sections:
```javascript
// src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  render() {
    if (this.state.hasError) {
      return <div className="error-fallback">Something went wrong. Please refresh.</div>
    }
    return this.props.children
  }
}
```

---

## B.7 [MEDIUM] Deep Object Cloning with JSON.parse/stringify

**Location**: `src/App.jsx` line 185

**Description**: Card duplication uses `JSON.parse(JSON.stringify())` for deep cloning:
```javascript
const newCard = {
  ...JSON.parse(JSON.stringify(cardToDuplicate)),
  // ...
}
```

**Issues**:
- Fails silently on circular references
- Loses undefined values, functions, and special objects
- Performance overhead

**Recommendation**: Use structured cloning or a dedicated library:
```javascript
// Modern browsers support structuredClone
const newCard = {
  ...structuredClone(cardToDuplicate),
  id: crypto.randomUUID(),
  // ...
}
```

---

## B.8 [LOW] Unused 'game-tools' Element Type

**Location**: `src/components/Card.jsx` line 131-135

**Description**: The `createNewElement` function defines a 'game-tools' element type, but:
- It's not in the element menu
- It has no corresponding render case
- No tests cover it

**Recommendation**: Either implement the feature or remove the dead code.

---

## B.9 [LOW] Inconsistent Layout Value

**Location**: `src/utils/cardSchema.js` line 60, `src/components/Card.jsx` line 870

**Description**: The schema allows `'single-column'` but the Card component checks for `'1-column'`:
```javascript
// cardSchema.js
const allowedLayouts = ['auto', 'single-column', '2-column']

// Card.jsx settings
<option value="1-column">1 Column</option>
```

**Recommendation**: Standardize on one naming convention.

---

## B.10 [LOW] Missing PropTypes/TypeScript

**Location**: All components

**Description**: Components don't have PropTypes definitions or TypeScript types, making it harder to understand expected props and catch errors.

**Recommendation**: Add PropTypes at minimum, or migrate to TypeScript:
```javascript
import PropTypes from 'prop-types'

Card.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    // ...
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  // ...
}
```

---

## B.11 [LOW] Console.error Used for Error Handling

**Location**: `src/utils/storage.js`

**Description**: Errors are logged to console but not surfaced to users:
```javascript
console.error(`Failed to save to localStorage key "${key}":`, err)
```

**Recommendation**: Implement proper error notification system for user-facing errors.

---

## Action Items

### Immediate (High Priority)
1. Plan component refactoring for App.jsx and Card.jsx
2. Create a detailed refactoring roadmap before starting

### Short-term (Medium Priority)
3. Create constants file for magic strings
4. Centralize element factory functions
5. Add Error Boundaries
6. Replace `JSON.parse/stringify` with `structuredClone`
7. Standardize state management patterns

### Long-term (Low Priority)
8. Migrate to TypeScript or add PropTypes
9. Remove or implement unused 'game-tools' element type
10. Fix layout value inconsistency
11. Add proper error notification system