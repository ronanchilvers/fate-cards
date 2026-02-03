# Fate Cards — Code Quality Implementation Plan (CODEX)

Review Source: `docs/review/CODEX-CODE-QUALITY.md`
Plan Date: 2026-02-03
Scope: `src/`

Each task below is intentionally sized to fit in a single AI agent session.

## Task 1 — Normalize Category Color Format
Goal: Ensure category colors are consistently handled so custom categories render correctly.

Files:
- `src/utils/colors.js`
- `src/hooks/useCategories.js`
- `src/hooks/useCards.js`
- `src/components/Card.jsx`

Steps:
1. Choose a single color format (hex or HSL) and normalize `getCategoryColor` output to that format.
2. Update `getPaleBackground` and `getMidToneBackground` to accept the chosen format or convert as needed.
3. Verify card backgrounds render for default and custom categories.

Acceptance:
- Custom category cards render with valid background colors.
- No console errors from color parsing.

---

## Task 2 — Fix ErrorBoundary State Update
Goal: Remove direct state mutation in the error boundary.

Files:
- `src/components/ErrorBoundary.jsx`

Steps:
1. Replace `this.state = {...}` in `componentDidCatch` with `this.setState({...})`.
2. Ensure error details still render in development mode.

Acceptance:
- No direct `this.state` mutation in `componentDidCatch`.
- Error boundary still shows fallback UI and details in DEV.

---

## Task 3 — Reduce Repeated Card Filtering
Goal: Avoid repeated array filtering inside render loops for categories.

Files:
- `src/App.jsx`

Steps:
1. Precompute `cardsByCategory` and `cardCounts` once per render.
2. Replace repeated calls to `cardsHook.getCardsByCategory` and `getCardCountByCategory` in the JSX.

Acceptance:
- Render logic uses precomputed per-category data.
- No behavioral change in UI.

---

## Task 4 — Address Unused Constants Drift
Goal: Remove or wire unused constants to reduce confusion.

Files:
- `src/constants.js`

Steps:
1. Identify constant groups that are unused (e.g., `TEMPLATE_KEYS`, `DEFAULT_CATEGORY_*`, `FILE_CONSTRAINTS`, `SKILL_DEFAULTS`).
2. Either remove them or integrate them where appropriate (choose minimal change).

Acceptance:
- Unused constants are removed or referenced in code.
- No lint/test regressions due to missing imports.

---

## Task 5 — Tighten Validation Consistency
Goal: Make skill level/category/skills updates more predictable and consistent.

Files:
- `src/hooks/useSkillLevels.js`
- `src/hooks/useSkills.js`
- `src/hooks/useCategories.js`

Steps:
1. Add trimming + non-empty checks for updates (e.g., `updateSkillLevelLabel`).
2. Prevent duplicates where relevant and optionally normalize ordering.
3. Keep API return values consistent with existing `true/false` semantics.

Acceptance:
- Empty or duplicate labels/names are rejected.
- UI behavior matches existing success/failure patterns.

