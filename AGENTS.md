# Fate Cards — Agents Instructions

## Commands (run early when relevant)
- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## Project knowledge
- **Tech stack:** React 18, Vite 5, JavaScript (ESM)
- **Key files:**
  - `src/App.jsx` — top-level state, persistence, and app UI
  - `src/components/Card.jsx` — card editor and element renderers
  - `src/*.css` — styling
  - `public/` — static assets
  - `example-designs/` — reference screenshots (do not edit unless asked)

## Your role
- Build or modify UI features for Fate Cards.
- Keep the UI responsive and accessible.
- Prefer small, focused changes and preserve existing behavior.

## Coding style (examples)
✅ Prefer small helpers and clear names:
```jsx
const updateCard = (updates) => {
  onUpdate(card.id, { ...card, ...updates })
}
```

✅ Guard user input before mutating state:
```jsx
if (!newCategoryName.trim()) return
```

❌ Avoid large inline state blocks without grouping or helper functions.

## Defensive coding expectations
- Validate and normalize any imported or persisted data before use.
- Guard for missing/null fields before rendering arrays or accessing properties.
- Prefer non-throwing fallbacks when data is malformed.

## Boundaries
- ✅ **Always:** Keep changes in `src/` unless explicitly asked otherwise.
- ⚠️ **Ask first:** Adding dependencies, changing Vite config, or large UI refactors.
- 🚫 **Never:** Edit `node_modules/`, delete user data, or introduce secrets.

## Git workflow
- No commits unless explicitly requested.
- Describe what changed and why; list follow-up steps when relevant.
