# Fate Cards — Security Issues

**Extracted from**: CODEBASE_REVIEW.md  
**Review Date**: 2026-01-27  
**Category**: Security

---

## Risk Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 2 |

---

## A.1 [HIGH] Unvalidated JSON Import from User Files

**Location**: `src/App.jsx` lines 360-454 (`importCards` function)

**Description**: The application accepts JSON files from users and parses them with `JSON.parse()`. While basic validation exists for cards, categories, skills, and skill levels, there are gaps in the validation:

1. The `normalizeCards` function doesn't validate element structures deeply
2. Imported data could contain unexpected properties that persist in state
3. No size limits on imported files

**Risk**: A maliciously crafted JSON file could:
- Inject unexpected properties into the application state
- Cause performance issues with deeply nested or circular structures
- Exploit edge cases in rendering logic

**Recommendation**:
```javascript
// Add file size validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
if (file.size > MAX_FILE_SIZE) {
  alert('File too large. Maximum size is 5MB.');
  return;
}

// Deep validate element structures in normalizeCard
// Strip unknown properties during normalization
```

---

## A.2 [MEDIUM] localStorage Data Trust

**Location**: `src/App.jsx` lines 33-68, `src/utils/storage.js`

**Description**: The application loads data from localStorage on startup and trusts it to be valid. While `safeGetJSON` handles parse errors, the loaded data is not normalized before use:

```javascript
if (savedCards) {
  setCards(savedCards)  // Direct use without validation
}
```

**Risk**: Corrupted or tampered localStorage data could cause runtime errors or unexpected behavior.

**Recommendation**:
```javascript
if (savedCards) {
  const validCards = normalizeCards(savedCards)
  setCards(validCards)
}
```

---

## A.3 [MEDIUM] No Content Security Policy Headers

**Location**: `index.html`

**Description**: The HTML file doesn't specify Content Security Policy meta tags. While this is primarily a server-side concern for deployed applications, CSP can also be specified via meta tags.

**Risk**: Reduced protection against XSS attacks in deployment scenarios.

**Recommendation**: Add CSP meta tag to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

---

## A.4 [MEDIUM] User Input Rendered Without Sanitization

**Location**: `src/components/Card.jsx` (multiple render functions)

**Description**: User-entered text (card titles, aspects, notes, etc.) is rendered directly into the DOM via React's JSX. While React automatically escapes content in JSX expressions, certain patterns could be problematic:

```javascript
<h3>{card.title}</h3>
<span>{card.subtitle}</span>
```

**Risk**: Currently low due to React's built-in escaping, but if rendering patterns change (e.g., using `dangerouslySetInnerHTML`), this could become a vector for XSS.

**Recommendation**: Document the security reliance on React's escaping and add explicit sanitization if HTML rendering is ever needed:
```javascript
// If HTML rendering is needed in the future, use DOMPurify:
// import DOMPurify from 'dompurify';
// <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

---

## A.5 [LOW] Predictable Element IDs

**Location**: `src/data/defaults.js`

**Description**: The default sample card uses sequential, predictable IDs like `'1'`, `'1-1'`, `'1-2'`, etc. While not a security vulnerability per se, predictable IDs can sometimes be exploited in specific scenarios.

**Risk**: Minimal, as the application uses UUIDs for new cards/elements.

**Recommendation**: Consider using UUID-style IDs for default data as well, or document that these IDs are only used for the initial sample card.

---

## A.6 [LOW] No Rate Limiting on Data Operations

**Location**: Various localStorage operations in `src/App.jsx`

**Description**: There's no rate limiting on save operations. Every state change triggers a localStorage write via useEffect hooks.

**Risk**: Could cause performance issues with rapid changes, though not a direct security concern.

**Recommendation**: Implement debounced saves for better performance (see Optimization section).

---

## Summary

### Immediate Actions Required

1. **Add file size limits** to JSON import (A.1)
2. **Validate localStorage data on load** using `normalizeCards` (A.2)

### Short-term Improvements

3. Add Content Security Policy headers (A.3)
4. Document reliance on React's XSS protections (A.4)

### Long-term Considerations

5. Consider UUID-style IDs for defaults (A.5)
6. Implement debounced saves (A.6)