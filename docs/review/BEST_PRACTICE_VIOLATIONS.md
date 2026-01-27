# Fate Cards — Best Practice Violations

**Extracted from**: Codebase Review  
**Review Date**: 2026-01-27  
**Category**: Best Practice Violations

---

## Summary

| Severity | Count |
|----------|-------|
| High | 1 |
| Medium | 4 |
| Low | 6 |
| **Total** | **11** |

---

## C.1 [HIGH] Direct DOM Manipulation in Event Handlers

**Location**: `src/App.jsx` lines 349-356

**Description**: The export fallback creates DOM elements directly:
```javascript
const link = document.createElement('a')
link.href = url
link.download = defaultFilename
document.body.appendChild(link)
link.click()
document.body.removeChild(link)
```

**Issue**: This bypasses React's virtual DOM and can cause issues with React's reconciliation.

**Recommendation**: Use a ref or a dedicated download library. Consider react-download-link or file-saver:
```javascript
import { saveAs } from 'file-saver'
const dataBlob = new Blob([dataStr], { type: 'application/json' })
saveAs(dataBlob, defaultFilename)
```

---

## C.2 [MEDIUM] Alert/Confirm for User Feedback

**Location**: Multiple locations in `src/App.jsx`

**Description**: The application uses native `alert()` and `window.confirm()` for user feedback:
```javascript
alert('Please select both a template and a category.')
if (window.confirm('Are you sure you want to delete...'))
```

**Issues**:
- Blocks the main thread
- Not styleable
- Poor user experience
- Inconsistent with app's visual design

**Recommendation**: Implement custom modal dialogs for confirmations and toast notifications for alerts.

---

## C.3 [MEDIUM] Inline Styles Mixed with CSS

**Location**: `src/App.jsx` lines 569-576, `src/components/Card.jsx`

**Description**: The codebase mixes inline styles with CSS classes:
```javascript
<div style={{ backgroundColor: getCategoryColorWithDefaults(category), cursor: 'pointer' }}>
<span style={{ fontSize: '1.2rem', transition: 'transform 0.2s', transform: ... }}>
```

**Recommendation**: Move dynamic styles to CSS custom properties or use CSS-in-JS consistently:
```javascript
<div 
  className="category-header" 
  style={{ '--category-color': getCategoryColorWithDefaults(category) }}
>
```
```css
.category-header {
  background-color: var(--category-color);
}
```

---

## C.4 [MEDIUM] useEffect Dependencies Array Issues

**Location**: `src/App.jsx` lines 126-139

**Description**: Some useEffect hooks have potentially problematic dependency arrays:
```javascript
useEffect(() => {
  // ...theme handling logic
}, [themeMode])  // Missing other dependencies that are used
```

**Recommendation**: Run ESLint with `react-hooks/exhaustive-deps` rule and fix all warnings.

---

## C.5 [MEDIUM] No Loading States

**Location**: `src/App.jsx`

**Description**: While `isLoaded` prevents saving before data loads, there's no visual loading indicator for users. The app briefly shows an empty state before data loads.

**Recommendation**: Add loading UI:
```javascript
if (!isLoaded) {
  return <div className="loading-spinner">Loading...</div>
}
```

---

## C.6 [LOW] Event Handler Naming Convention

**Location**: Multiple files

**Description**: Event handlers use inconsistent naming:
- `addCard`, `deleteCard` (imperative)
- `openSettings`, `saveSettings` (imperative)
- `triggerImport` (imperative)
- `cycleThemeMode` (imperative)

**Recommendation**: Use consistent `handleX` or `onX` prefix for event handlers:
```javascript
const handleAddCard = () => { ... }
const handleDeleteCard = () => { ... }
```

---

## C.7 [LOW] No Accessibility Attributes

**Location**: Multiple interactive elements

**Description**: Interactive elements lack proper ARIA attributes:
- Color swatches in palette have no aria-label
- Stress boxes have no aria-checked
- Modals lack focus trap and proper aria-modal

**Recommendation**: Add ARIA attributes:
```javascript
<div
  className={`stress-box ${box.checked ? 'checked' : ''}`}
  role="checkbox"
  aria-checked={box.checked}
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && toggleBox()}
/>
```

---

## C.8 [LOW] Missing Key Prop Best Practices

**Location**: `src/components/Card.jsx` stress tracks rendering

**Description**: Some array indices are used as keys:
```javascript
{track.boxes.map((box, boxIndex) => (
  <div key={boxIndex} ...>
```

**Issue**: Using index as key can cause issues when items are reordered or deleted.

**Recommendation**: Use stable IDs where possible. For stress boxes, consider adding IDs to the data structure.

---

## C.9 [LOW] No .env Configuration

**Location**: Project root

**Description**: No environment configuration exists. All config is hardcoded.

**Recommendation**: Create `.env` file for configurable values:
```
VITE_APP_TITLE=Fate Cards
VITE_MAX_IMPORT_SIZE=5242880
```

---

## C.10 [LOW] Missing robots.txt and sitemap

**Location**: `public/` directory

**Description**: No SEO-related files exist for the deployed site.

**Recommendation**: Add basic `robots.txt` and optionally a sitemap if SEO matters.

---

## C.11 [LOW] Comments in Code Are Sparse

**Location**: All files

**Description**: While utility functions have good JSDoc comments, component files have minimal inline comments explaining complex logic.

**Recommendation**: Add comments explaining non-obvious logic, especially in the complex renderElement function.

---

## Recommended Actions

### Immediate (High Priority)
1. Refactor DOM manipulation for downloads to use file-saver or similar library

### Short-term (Medium Priority)
2. Replace `alert()`/`confirm()` with custom modal dialogs
3. Standardize CSS approach (prefer CSS custom properties for dynamic values)
4. Fix useEffect dependency warnings
5. Add loading states/indicators

### Long-term (Low Priority)
6. Standardize event handler naming conventions
7. Add comprehensive accessibility attributes (ARIA)
8. Use stable IDs for list keys instead of indices
9. Create environment configuration files
10. Add SEO files (robots.txt, sitemap)
11. Improve code documentation