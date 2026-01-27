# Fate Cards — Refactoring Roadmap

**Created**: 2026-01-27  
**Status**: Planning Phase  
**Related**: [CODE_QUALITY_ISSUES.md](./review/CODE_QUALITY_ISSUES.md)

---

## Executive Summary

This document outlines a phased approach to refactoring the two largest components in the Fate Cards application: `App.jsx` (824 lines) and `Card.jsx` (830 lines). These refactorings address the two HIGH-priority code quality issues that were deferred during the initial cleanup.

**Goals**:
- Improve maintainability and testability
- Reduce cognitive load for future developers
- Enable parallel development on different features
- Maintain 100% backward compatibility during transition

---

## Current State

### App.jsx Statistics
- **Lines**: 824
- **State Variables**: 17+
- **Handler Functions**: 20+
- **Inline Components**: 3 modal dialogs
- **Responsibilities**: State management, UI rendering, business logic, data persistence

### Card.jsx Statistics
- **Lines**: 830
- **Main Issues**: 
  - `renderElement()` function: 570+ lines
  - Switch statement with 8+ cases
  - Handles all element rendering inline

---

## Phase 1: Extract Modals from App.jsx

**Priority**: HIGH  
**Estimated Effort**: 2-3 hours  
**Risk**: LOW

### Objectives
Extract the three modal dialogs into separate components to reduce App.jsx complexity.

### Modals to Extract
1. **TemplateModal** — Card template selection
2. **CategoryModal** — Category management
3. **SkillsAdminModal** — Skills administration
4. **SkillLevelsAdminModal** — Skill levels administration

### Implementation Steps

#### Step 1.1: Create Modal Component Directory
```
src/components/modals/
├── TemplateModal.jsx
├── CategoryModal.jsx
├── SkillsAdminModal.jsx
└── SkillLevelsAdminModal.jsx
```

#### Step 1.2: Extract TemplateModal (Pilot)
- Copy template modal markup from App.jsx
- Identify required props and callbacks
- Create component with proper prop types
- Import and use in App.jsx
- Test functionality thoroughly

#### Step 1.3: Extract Remaining Modals
- Follow same pattern as TemplateModal
- Ensure all state and callbacks are properly passed
- Add PropTypes for each modal

#### Step 1.4: Add Modal Styles
- Extract modal-specific CSS to separate files or keep in shared modal.css
- Ensure dark mode support maintained

### Success Criteria
- [ ] All modals work identically to before
- [ ] App.jsx reduced by ~300 lines
- [ ] Modal components are reusable
- [ ] All tests pass
- [ ] No visual regressions

### Benefits
- App.jsx becomes more focused
- Modals can be tested independently
- Easier to add new modals in future

---

## Phase 2: Create Custom Hooks

**Priority**: HIGH  
**Estimated Effort**: 4-5 hours  
**Risk**: MEDIUM

### Objectives
Extract state management logic into custom hooks to simplify App.jsx.

### Hooks to Create

#### Hook 1: `useCards.js`
**Responsibilities**:
- Cards state management
- Add, update, delete, duplicate card operations
- Card filtering by category
- Cards persistence to localStorage

**Interface**:
```javascript
const {
  cards,
  addCard,
  updateCard,
  deleteCard,
  duplicateCard,
  getCardsByCategory
} = useCards(initialCards)
```

#### Hook 2: `useCategories.js`
**Responsibilities**:
- Categories state management
- Add, rename, delete, reorder categories
- Category color management
- Collapsed categories tracking
- Categories persistence

**Interface**:
```javascript
const {
  categories,
  collapsedCategories,
  addCategory,
  renameCategory,
  deleteCategory,
  reorderCategories,
  toggleCategoryCollapse,
  getCategoryColor
} = useCategories(initialCategories)
```

#### Hook 3: `useSkills.js`
**Responsibilities**:
- Skills state management
- Add, update, delete, reorder skills
- Skills persistence

**Interface**:
```javascript
const {
  skills,
  addSkill,
  updateSkill,
  deleteSkill,
  reorderSkills
} = useSkills(initialSkills)
```

#### Hook 4: `useSkillLevels.js`
**Responsibilities**:
- Skill levels state management
- Add, update, delete, reorder skill levels
- Skill levels persistence

**Interface**:
```javascript
const {
  skillLevels,
  addSkillLevel,
  updateSkillLevel,
  deleteSkillLevel,
  reorderSkillLevels
} = useSkillLevels(initialSkillLevels)
```

#### Hook 5: `useTheme.js`
**Responsibilities**:
- Theme mode management (light/dark/auto)
- System preference detection
- Theme persistence

**Interface**:
```javascript
const {
  themeMode,
  isDark,
  cycleThemeMode,
  getThemeIcon,
  getThemeTitle
} = useTheme()
```

#### Hook 6: `useImportExport.js`
**Responsibilities**:
- Import cards from JSON
- Export cards to JSON
- File handling and validation

**Interface**:
```javascript
const {
  importCards,
  exportCards,
  triggerImport
} = useImportExport({ cards, categories, skills, skillLevels, onImport })
```

### Implementation Steps

#### Step 2.1: Create Hooks Directory
```
src/hooks/
├── useCards.js
├── useCategories.js
├── useSkills.js
├── useSkillLevels.js
├── useTheme.js
└── useImportExport.js
```

#### Step 2.2: Extract One Hook (Pilot)
- Start with `useTheme.js` (smallest, self-contained)
- Move theme-related state and logic
- Test thoroughly
- Document lessons learned

#### Step 2.3: Extract Remaining Hooks
- Follow pattern established in pilot
- Extract state and related functions
- Ensure localStorage operations work correctly
- Add JSDoc comments

#### Step 2.4: Update App.jsx
- Replace direct state management with hooks
- Simplify component to orchestration only
- Verify all functionality works

### Success Criteria
- [ ] All hooks function correctly
- [ ] App.jsx reduced by ~200 lines
- [ ] Each hook is testable independently
- [ ] All tests pass
- [ ] No behavior changes

### Benefits
- Separation of concerns
- Easier to test business logic
- Reusable hooks for future features
- Clearer component responsibilities

---

## Phase 3: Extract Element Renderers from Card.jsx

**Priority**: HIGH  
**Estimated Effort**: 6-8 hours  
**Risk**: MEDIUM-HIGH

### Objectives
Break down the massive `renderElement()` function into individual element components.

### Element Components to Create

```
src/components/elements/
├── HighConceptElement.jsx
├── TroubleElement.jsx
├── AspectsElement.jsx
├── SkillsElement.jsx
├── StressTracksElement.jsx
├── ConsequencesElement.jsx
├── NoteElement.jsx
└── FatePointsElement.jsx
```

### Common Props Interface
Each element component should accept:
```javascript
{
  element: Object,           // Element data
  onUpdate: Function,        // Update callback
  onDelete: Function,        // Delete callback
  onMoveUp: Function,        // Move up callback
  onMoveDown: Function,      // Move down callback
  isFirst: Boolean,          // First element flag
  isLast: Boolean,           // Last element flag
  isLocked: Boolean,         // Card locked state
  // Additional props specific to element type
  skills?: Array,            // For SkillsElement
  skillLevels?: Array        // For SkillsElement
}
```

### Implementation Steps

#### Step 3.1: Create Element Components Directory
```
src/components/elements/
├── index.js  // Re-export all elements
└── (individual element files)
```

#### Step 3.2: Extract Simple Element (Pilot)
- Start with `NoteElement.jsx` (simplest)
- Copy relevant rendering code from Card.jsx
- Create component with proper props
- Add PropTypes or TypeScript types
- Test thoroughly

#### Step 3.3: Extract Remaining Elements
- Follow pattern from NoteElement
- Handle complex elements (Skills, Stress Tracks)
- Ensure all interactions work correctly
- Extract element-specific CSS if needed

#### Step 3.4: Create Element Selector
Replace switch statement with component map:
```javascript
import * as Elements from './elements'

const ELEMENT_COMPONENTS = {
  'high-concept': Elements.HighConceptElement,
  'trouble': Elements.TroubleElement,
  'aspects': Elements.AspectsElement,
  'skills': Elements.SkillsElement,
  'stress-tracks': Elements.StressTracksElement,
  'consequences': Elements.ConsequencesElement,
  'note': Elements.NoteElement,
  'fate-points': Elements.FatePointsElement
}

const renderElement = (element, props) => {
  const ElementComponent = ELEMENT_COMPONENTS[element.type]
  return ElementComponent ? <ElementComponent {...props} /> : null
}
```

#### Step 3.5: Update Card.jsx
- Replace massive renderElement switch with component map
- Simplify Card.jsx to card chrome only
- Verify all element types render correctly

### Success Criteria
- [ ] All element types render correctly
- [ ] All interactions work (edit, delete, move, etc.)
- [ ] Card.jsx reduced by ~500 lines
- [ ] Each element is testable independently
- [ ] All tests pass
- [ ] No visual regressions

### Benefits
- Much easier to maintain individual elements
- Reduced risk when modifying one element type
- Easier to add new element types
- Testable element components
- Clearer code organization

---

## Phase 4: Add PropTypes or Migrate to TypeScript

**Priority**: MEDIUM  
**Estimated Effort**: 8-12 hours  
**Risk**: MEDIUM

### Option A: Add PropTypes

#### Pros
- Faster to implement
- No build tooling changes
- Runtime validation

#### Cons
- Only runtime checking
- Less powerful than TypeScript
- No IDE autocomplete benefits

#### Implementation
```javascript
import PropTypes from 'prop-types'

Card.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    category: PropTypes.string.isRequired,
    color: PropTypes.string,
    layout: PropTypes.oneOf(['auto', 'single-column', '2-column']),
    locked: PropTypes.bool,
    elements: PropTypes.arrayOf(PropTypes.object).isRequired
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  skills: PropTypes.arrayOf(PropTypes.string).isRequired,
  skillLevels: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  })).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired
}
```

### Option B: Migrate to TypeScript

#### Pros
- Compile-time type checking
- Better IDE support
- Catches more errors
- Industry standard
- Better refactoring support

#### Cons
- More initial setup
- Learning curve
- Migration effort

#### Implementation Steps
1. Install TypeScript dependencies
2. Add `tsconfig.json`
3. Rename `.jsx` to `.tsx` incrementally
4. Add type definitions
5. Fix type errors
6. Update build configuration

#### Recommended Approach
Start with key interfaces:
```typescript
// types/card.ts
export interface Card {
  id: string
  title: string
  subtitle?: string
  category: string
  color?: string
  layout: 'auto' | 'single-column' | '2-column'
  locked?: boolean
  elements: CardElement[]
}

export interface CardElement {
  id: string
  type: ElementType
  // ... type-specific properties
}

export type ElementType =
  | 'high-concept'
  | 'trouble'
  | 'aspects'
  | 'skills'
  | 'stress-tracks'
  | 'consequences'
  | 'note'
  | 'fate-points'
```

### Recommendation
**Start with PropTypes** for immediate benefits, then evaluate TypeScript migration after completing Phase 3.

---

## Phase 5: Performance Optimizations

**Priority**: LOW  
**Estimated Effort**: 4-6 hours  
**Risk**: LOW

### Optimizations to Implement

#### 5.1: Memoize Card Components
```javascript
export default React.memo(Card, (prevProps, nextProps) => {
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card === nextProps.card &&
    prevProps.skills === nextProps.skills &&
    prevProps.skillLevels === nextProps.skillLevels
  )
})
```

#### 5.2: Memoize Element Components
```javascript
export default React.memo(SkillsElement, (prevProps, nextProps) => {
  return (
    prevProps.element === nextProps.element &&
    prevProps.isLocked === nextProps.isLocked &&
    prevProps.skills === nextProps.skills &&
    prevProps.skillLevels === nextProps.skillLevels
  )
})
```

#### 5.3: Add useMemo for Expensive Computations
Target areas:
- Card filtering by category
- Skill grouping by rating
- Category color calculations

### Success Criteria
- [ ] No unnecessary re-renders
- [ ] Improved performance with many cards
- [ ] React DevTools Profiler shows improvements

---

## Implementation Timeline

### Week 1: Modals and Initial Hooks
- Days 1-2: Extract modals (Phase 1)
- Days 3-5: Create and test custom hooks (Phase 2)

### Week 2: Element Extraction
- Days 1-3: Extract simple elements
- Days 4-5: Extract complex elements (Skills, Stress Tracks)

### Week 3: Polish and Type Safety
- Days 1-2: Add PropTypes to all components
- Days 3-4: Performance optimizations
- Day 5: Documentation and testing

### Week 4: TypeScript Evaluation (Optional)
- Evaluate TypeScript migration
- Create migration plan if approved
- Begin gradual migration

---

## Risk Mitigation

### Strategy 1: Incremental Changes
- Make small, focused changes
- Test after each change
- Commit frequently
- Keep main branch stable

### Strategy 2: Feature Flags
Consider adding feature flags for major changes:
```javascript
const USE_NEW_MODALS = import.meta.env.DEV || 
                       localStorage.getItem('feature-new-modals') === 'true'
```

### Strategy 3: Parallel Branches
- Create feature branch for each phase
- Keep main branch deployable
- Merge only after thorough testing

### Strategy 4: Automated Testing
- Run test suite before and after each phase
- Add new tests for extracted components
- Maintain 100% test pass rate

---

## Testing Strategy

### Unit Tests
- Test each custom hook independently
- Test each element component in isolation
- Test modal components with mock data

### Integration Tests
- Test hook interactions
- Test element rendering with various data
- Test modal workflows

### Visual Regression Tests
- Screenshot testing for each element type
- Compare before/after for each phase
- Ensure dark mode works correctly

### Manual Testing Checklist
- [ ] Create new card from each template
- [ ] Edit each element type
- [ ] Delete cards and elements
- [ ] Duplicate cards
- [ ] Import/export data
- [ ] Change categories
- [ ] Manage skills and skill levels
- [ ] Test theme switching
- [ ] Test on mobile viewport
- [ ] Test locked card behavior

---

## Rollback Plan

For each phase, maintain ability to rollback:

1. **Create git tags** before each phase
2. **Document breaking changes** if any
3. **Keep old code** in comments initially
4. **Test rollback** procedure before deployment

Rollback command:
```bash
git checkout phase-N-complete
npm install
npm test
npm run build
```

---

## Success Metrics

### Code Metrics
- **App.jsx**: Target <400 lines (currently 824)
- **Card.jsx**: Target <300 lines (currently 830)
- **Test Coverage**: Maintain >80%
- **Bundle Size**: Keep <200KB gzipped

### Quality Metrics
- **All Tests Passing**: 100%
- **Zero ESLint Warnings**: For new code
- **TypeScript Errors**: 0 (if migrated)
- **Lighthouse Score**: >90

### Developer Experience
- **Time to Add New Element**: <30 minutes
- **Time to Add New Modal**: <20 minutes
- **New Developer Onboarding**: Easier navigation

---

## Post-Refactoring Benefits

### Maintainability
- Smaller, focused components
- Clear separation of concerns
- Easier to understand code flow

### Testability
- Individual components testable
- Hooks testable in isolation
- Better test coverage possible

### Extensibility
- Easy to add new element types
- Simple to add new features
- Clear patterns to follow

### Performance
- Reduced re-renders
- Better code splitting
- Faster development cycles

---

## Approval Required

Before beginning Phase 1, please confirm:
- [ ] Roadmap reviewed and approved
- [ ] Timeline is acceptable
- [ ] Resources are allocated
- [ ] Risk mitigation strategy is sound

---

## Related Documents

- [CODE_QUALITY_FIXES.md](./CODE_QUALITY_FIXES.md) — Completed improvements
- [CODE_QUALITY_ISSUES.md](./review/CODE_QUALITY_ISSUES.md) — Original issues
- [CODEBASE_REVIEW.md](./CODEBASE_REVIEW.md) — Full review

---

## Notes

This roadmap is a living document and should be updated as work progresses. Adjust timeline and approach based on learnings from each phase.