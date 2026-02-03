# Fate Cards — Security Review (CODEX)

Review Date: 2026-02-03
Scope: `src/`, `index.html`

## Summary
No critical vulnerabilities were found. The app is a client-side React SPA with data stored in `localStorage` and optional file import/export. The main risks are availability/performance issues from unbounded imports and incomplete validation of imported structures.

## Findings
- [Medium] Import size not enforced: `FILE_CONSTRAINTS.MAX_IMPORT_SIZE` exists but is unused; large JSON imports can exhaust memory or freeze the UI. Files: `src/App.jsx`, `src/constants.js`.
- [Medium] Shallow validation of imported cards: `normalizeCard` validates top-level fields but does not validate nested `elements`, which can lead to malformed data being rendered and potential runtime errors. Files: `src/utils/cardSchema.js`, `src/components/elements/*`.
- [Low] Local data trust: categories/skills/skill levels loaded from `localStorage` are not normalized (only type-checked), so corrupted or oversized entries can degrade performance or UI. Files: `src/hooks/useCategories.js`, `src/hooks/useSkills.js`, `src/hooks/useSkillLevels.js`.

## Notable Protections
- React JSX rendering avoids direct HTML injection; no `dangerouslySetInnerHTML` usage was found.
- `safeGetJSON`/`safeSetJSON` reduce crash risk from malformed `localStorage` entries.
- A Content Security Policy meta tag is present in `index.html`.

## Recommended Mitigations
1. Enforce import size limits before reading files and reject oversized payloads.
2. Deep-validate and sanitize `elements` during import, stripping unknown fields and invalid shapes.
3. Normalize or cap category/skill arrays on load to guard against oversized localStorage data.
