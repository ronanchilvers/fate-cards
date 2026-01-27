# Fate Cards — Potential Optimizations

**Source**: Codebase Review  
**Review Date**: 2026-01-27

---

## Overview

| Severity | Count |
|----------|-------|
| Medium   | 3     |
| Low      | 5     |

---

## D.1 [MEDIUM] Debounce localStorage Saves

**Location**: `src/App.jsx` useEffect hooks for saving

**Description**: Every state change triggers an immediate localStorage write:
```javascript
useEffect(() => {
  if (isLoaded) {
    safeSetJSON('fate-cards', cards)
  }
}, [cards, isLoaded])
```

**Impact**: Rapid edits cause many writes, potentially affecting performance.

**Recommendation**: Implement debounced saves:
```javascript
import { useDebouncedCallback } from 'use-debounce'

const debouncedSave = useDebouncedCallback((key, value) => {
  safeSetJSON(key, value)
}, 500)

useEffect(() => {
  if (isLoaded) {
    debouncedSave('fate-cards', cards)
  }
}, [cards, isLoaded])
```

---

## D.2 [MEDIUM] Memoize Expensive Computations

**Location**: `src/components/Card.jsx` skills rendering

**Description**: The skills element rendering computes groupings on every render:
```javascript
const existingRatings = [...new Set(element.items.map(skill => skill.rating))].sort((a, b) => b - a)
const existingLevels = existingRatings.map(rating => 
  allSkillLevels.find(level => level.value === rating)
).filter(Boolean)
```

**Recommendation**: Use `useMemo` for expensive computations:
```javascript
const { existingLevels, skillsByRating } = useMemo(() => {
  const existingRatings = [...new Set(element.items.map(skill => skill.rating))].sort((a, b) => b - a)
  // ...
  return { existingLevels, skillsByRating }
}, [element.items, skillLevels])
```

---

## D.3 [MEDIUM] Virtualize Long Lists

**Location**: Skills admin modal, cards list

**Description**: When there are many cards or skills, rendering all of them impacts performance.

**Recommendation**: For lists that could grow large, consider react-window or react-virtualized:
```javascript
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={400}
  itemCount={skills.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>{skills[index]}</div>
  )}
</FixedSizeList>
```

---

## D.4 [LOW] Reduce Re-renders with React.memo

**Location**: `src/components/Card.jsx`

**Description**: Card component re-renders on any parent state change, even if its props haven't changed.

**Recommendation**: Wrap Card with React.memo:
```javascript
export default React.memo(Card, (prevProps, nextProps) => {
  return (
    prevProps.card === nextProps.card &&
    prevProps.skills === nextProps.skills &&
    prevProps.skillLevels === nextProps.skillLevels &&
    prevProps.categories === nextProps.categories
  )
})
```

---

## D.5 [LOW] Lazy Load Modals

**Location**: `src/App.jsx` modal components

**Description**: All modal markup is rendered even when modals are closed, just hidden.

**Recommendation**: Only render modals when open:
```javascript
{showTemplateMenu && <TemplateModal ... />}
```

This is already done, but ensure it's consistent across all modals.

---

## D.6 [LOW] Bundle Size Optimization

**Location**: `package.json`

**Description**: The production bundle is 177KB gzipped (54KB). While reasonable, there may be room for optimization.

**Recommendations**:
- Analyze bundle with `vite-bundle-visualizer`
- Ensure tree-shaking is working
- Consider code-splitting for larger features

---

## D.7 [LOW] CSS Optimization

**Location**: CSS files

**Description**: Some CSS is duplicated between `App.css` and `Card.css`. Total CSS is ~21KB.

**Recommendations**:
- Extract common styles to shared utility classes
- Consider CSS Modules or styled-components for scoping
- Use PurgeCSS to remove unused styles

---

## D.8 [LOW] Image/Icon Optimization

**Location**: Various emoji usage

**Description**: The app uses emoji for icons (📋, 🔒, ⚙️, etc.). While convenient, this has inconsistent rendering across platforms.

**Recommendation**: Consider using a lightweight icon library like Lucide React or Heroicons for consistent appearance.

---

## Summary of Optimization Actions

### Medium Priority
1. Implement debounced localStorage saves
2. Add useMemo for expensive computations in Card.jsx
3. Consider virtualized lists for skills admin modal

### Low Priority
4. Wrap Card component with React.memo
5. Ensure modals are only rendered when open
6. Analyze and optimize bundle size
7. Consolidate and optimize CSS
8. Consider consistent icon library