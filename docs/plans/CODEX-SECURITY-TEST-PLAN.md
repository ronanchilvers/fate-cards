# Fate Cards — Security Test Plan (CODEX)

Review Source: `docs/plans/CODEX-SECURITY-PLAN.md`
Plan Date: 2026-02-03
Scope: unit/integration tests (`src/**/*.test.*`)

Each task below is intentionally sized to fit in a single AI agent session.

## Task 1 — Import Size Limit Test
Goal: Ensure oversized imports are rejected before parsing.

Files:
- `src/App.test.jsx` (new) or `src/App.import.test.jsx` (new)

Tests to add:
- Render `App`, locate the hidden file input, and dispatch a `change` event with a mock `File` exceeding `FILE_CONSTRAINTS.MAX_IMPORT_SIZE`.
- Assert `window.alert` is called with the size error message.
- Assert `FileReader` is not invoked (mock/stub `FileReader` and verify no calls).

Acceptance:
- Oversized file path is blocked and no parsing occurs.

---

## Task 2 — Deep Element Normalization Tests
Goal: Validate new element-level sanitization.

Files:
- `src/utils/cardSchema.test.js`
- `src/test/importValidation.test.js` (if it stays aligned with normalization behavior)

Tests to add:
- `normalizeCard` drops elements with unknown `type` (or normalizes to a safe default) based on the chosen behavior.
- `normalizeCard` sanitizes element shapes (e.g., `note` must have `text`, `skills` must have `items` array, `stress-tracks` must have `tracks` with `boxes`).
- `normalizeCards` handles cards with mixed valid/invalid elements without throwing.

Acceptance:
- Malformed elements are removed or normalized deterministically.
- No runtime errors when rendering normalized data.

---

## Task 3 — Normalize LocalStorage Data on Load Tests
Goal: Ensure corrupted or noisy localStorage data is cleaned on load.

Files:
- `src/hooks/useCategories.test.js`
- `src/hooks/useSkills.test.js`
- `src/hooks/useSkillLevels.test.js`

Tests to add:
- When localStorage contains strings with whitespace and empty values, hooks load trimmed values and drop empties.
- If deduping is implemented, verify duplicates are removed.
- If ordering normalization is implemented (e.g., sorting), verify the resulting order.

Acceptance:
- Hooks return normalized arrays when localStorage is polluted.

