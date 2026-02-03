# Fate Cards — Code Quality Review (CODEX)

Review Date: 2026-02-03
Scope: `src/`, `index.html`, `vite.config.js`

## Summary
The codebase is cleanly organized around hooks and components, with solid defensive storage helpers and a growing test suite. The primary quality risks are a color format mismatch that breaks card styling for custom categories, a React anti-pattern in the error boundary, and some avoidable performance and consistency gaps in state handling.

## Strengths
- Clear separation of concerns with domain hooks (`src/hooks/*`) and focused UI components.
- Defensive JSON parsing via `safeGetJSON` and schema normalization for cards (`src/utils/storage.js`, `src/utils/cardSchema.js`).
- Good baseline of unit/integration tests covering hooks and element components.

## Findings
- Color format mismatch: `getCategoryColor` returns HSL for non-default categories, but `getPaleBackground`/`getMidToneBackground` assume hex strings, leading to invalid RGB values and broken styling for custom category cards. Files: `src/utils/colors.js`, `src/hooks/useCategories.js`, `src/hooks/useCards.js`, `src/components/Card.jsx`.
- React state anti-pattern: `ErrorBoundary.componentDidCatch` mutates `this.state` directly instead of using `setState`, which can cause inconsistent render behavior. File: `src/components/ErrorBoundary.jsx`.
- Repeated filtering in render: `cardsHook.getCardsByCategory` and `getCardCountByCategory` are called multiple times per category; this scales poorly as card counts grow. File: `src/App.jsx`.
- Unused constants: several constant groups (e.g., `TEMPLATE_KEYS`, `DEFAULT_CATEGORY_*`, `FILE_CONSTRAINTS`, `SKILL_DEFAULTS`) are unused, which risks drift and confusion. File: `src/constants.js`.
- Validation consistency gaps: `updateSkillLevelLabel` accepts empty/duplicate labels and `importSkills`/`importCategories` do not normalize or dedupe, which can lead to inconsistent UI ordering and unexpected edits. Files: `src/hooks/useSkillLevels.js`, `src/hooks/useSkills.js`, `src/hooks/useCategories.js`.

## Suggested Next Steps
1. Normalize all colors to a single format (hex or HSL) and update color utility functions accordingly.
2. Fix `ErrorBoundary` state updates to use `setState` in `componentDidCatch`.
3. Pre-group cards by category once per render to avoid repeated filtering.
4. Remove or implement unused constants to reduce maintenance drift.
5. Add consistent trimming/deduping/empty checks for skill level and category updates.
