# Fate Cards — Code Quality Test Plan (CODEX)

Review Source: `docs/plans/CODEX-CODE-QUALITY-PLAN.md`
Plan Date: 2026-02-03
Scope: unit tests (`src/**/*.test.*`)

Each task below is intentionally sized to fit in a single AI agent session.

## Task 1 — Color Normalization Tests
Goal: Validate the new single-format color strategy and derived backgrounds.

Files:
- `src/utils/colors.test.js`

Tests to add/update:
- Assert `getCategoryColor` returns the normalized format chosen in the implementation (hex or HSL).
- Add a test that takes a custom category color from `getCategoryColor` and passes it into `getPaleBackground`/`getMidToneBackground`, asserting a valid `rgb(r, g, b)` output (regex + numeric bounds).
- Update any existing expectations that assume HSL if the implementation changes to hex (or vice-versa).

Acceptance:
- Tests reflect the final normalized color format.
- Background helpers are verified against non-default (custom) category colors.

---

## Task 2 — ErrorBoundary Behavior Tests
Goal: Ensure fallback UI and reset logic work without direct state mutation.

Files:
- `src/components/ErrorBoundary.test.jsx` (new)

Tests to add:
- Renders fallback UI when a child component throws during render.
- Clicking “Try Again” resets the boundary and allows children to render when the error condition is cleared.

Acceptance:
- ErrorBoundary tests pass and verify the core error + reset flow.

---

## Task 3 — Validation Consistency Tests
Goal: Cover new trimming/deduping/empty checks in hooks.

Files:
- `src/hooks/useSkillLevels.test.js`
- `src/hooks/useSkills.test.js`
- `src/hooks/useCategories.test.js`

Tests to add:
- `useSkillLevels.updateSkillLevelLabel` rejects empty/whitespace-only labels and rejects duplicates (after trimming).
- `useSkills.importSkills` trims values and drops empty entries; optionally dedupes if implemented.
- `useCategories.importCategories` trims values and drops empty entries; optionally dedupes if implemented.
- `useCategories.renameCategory` trims input and rejects duplicates (if updated).

Acceptance:
- New validation behavior is enforced by unit tests.

---

## Task 4 — No-Test-Needed Items (Documented)
Goal: Record why no tests are needed for purely structural changes.

Files:
- `docs/plans/CODEX-CODE-QUALITY-PLAN.md` (optional note)

Items:
- Pre-grouping cards by category in `src/App.jsx` (behavior should not change).
- Removing unused constants (no runtime impact).

Acceptance:
- Changes are noted as behavior-neutral, with no tests required.

