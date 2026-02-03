# Fate Cards — Security Implementation Plan (CODEX)

Review Source: `docs/review/CODEX-SECURITY-REVIEW.md`
Plan Date: 2026-02-03
Scope: `src/`, `index.html`

Each task below is intentionally sized to fit in a single AI agent session.

## Task 1 — Enforce Import Size Limit
Goal: Prevent oversized JSON imports from freezing the UI.

Files:
- `src/App.jsx`
- `src/constants.js`

Steps:
1. Wire `FILE_CONSTRAINTS.MAX_IMPORT_SIZE` into the import flow before reading the file.
2. Reject oversized files with a clear user message and reset the file input.

Acceptance:
- Oversized imports are blocked before `FileReader` runs.
- User sees an actionable error message.

---

## Task 2 — Deep-Validate Imported Elements
Goal: Sanitize imported card elements to avoid malformed structures.

Files:
- `src/utils/cardSchema.js`
- `src/data/elementFactories.js`
- `src/components/elements/*` (as needed for validation rules)

Steps:
1. Extend `normalizeCard` (or add helper) to validate `elements` array shape and known element types.
2. Strip unknown fields and invalid elements; default missing fields to safe values.
3. Add tests covering malformed elements and unknown types.

Acceptance:
- Invalid element entries are removed or normalized.
- No runtime errors when rendering imported data.

---

## Task 3 — Normalize LocalStorage Data on Load
Goal: Reduce risk from corrupted or oversized local data.

Files:
- `src/hooks/useCategories.js`
- `src/hooks/useSkills.js`
- `src/hooks/useSkillLevels.js`

Steps:
1. Normalize loaded arrays (trim strings, drop empty values, dedupe where appropriate).
2. Optionally cap list sizes to a reasonable maximum (if product requirements allow).

Acceptance:
- Empty/invalid entries are dropped on load.
- UI remains stable even with corrupted localStorage.

