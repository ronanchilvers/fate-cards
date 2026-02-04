# Fate Cards — Lucide Icons Implementation Plan (CODEX)

Plan Date: 2026-02-03
Scope: `src/` (plus `package.json` for Lucide dependency)

Each task below is intentionally sized to fit in a single AI agent session.

## Task 1 — Add Lucide + Icon Wrapper
Goal: Establish a single Lucide icon interface for consistent sizing, styling, and accessibility.

Files:
- `package.json`
- `src/components/icons/Icon.jsx` (new)
- `src/components/icons/iconMap.js` (new)

Steps:
1. Confirm adding `lucide-react` as a dependency, then install it.
2. Create an `Icon` wrapper that accepts `name`, `size`, `className`, and `aria-label`, and provides default size/strokeWidth.
3. Define an icon map for common actions (add, remove, close, delete, settings, duplicate, lock, unlock, theme light/dark/auto, chevron, drag handle, list bullet, import/export/reset).

Acceptance:
- Lucide icons can be rendered by name with consistent sizing.
- All icons render with appropriate aria labels or `aria-hidden` where purely decorative.

---

## Task 2 — Replace App + Modal Icons
Goal: Swap app-level and modal icons to Lucide components.

Files:
- `src/App.jsx`
- `src/hooks/useTheme.js`
- `src/components/modals/TemplateModal.jsx`
- `src/components/modals/CategoryModal.jsx`
- `src/components/modals/SkillsAdminModal.jsx`
- `src/components/modals/SkillLevelsAdminModal.jsx`
- `src/App.css`
- `src/components/modals/TemplateModal.css`

Steps:
1. Replace header action button emojis with Lucide icons, keeping button labels where they exist.
2. Update theme handling to return an icon name or component instead of emoji, and align tooltip text with icons.
3. Replace modal close buttons and template icons with Lucide equivalents; update styles for consistent icon sizing.
4. Replace the category collapse chevron and delete-category glyph with Lucide icons.

Acceptance:
- No emoji or symbol icons remain in the app header or modals.
- Theme toggle uses Lucide icons for light/dark/auto states.

---

## Task 3 — Replace Card + Element Icons
Goal: Convert all card/action/element UI icons (including drag handles and bullets) to Lucide.

Files:
- `src/components/Card.jsx`
- `src/components/Card.css`
- `src/components/elements/ElementWrapper.jsx`
- `src/components/elements/AspectsElement.jsx`
- `src/components/elements/ConsequencesElement.jsx`
- `src/components/elements/InventoryElement.jsx`
- `src/components/elements/SkillsElement.jsx`
- `src/components/elements/StressTracksElement.jsx`
- `src/components/elements/NoteElement.jsx`
- `src/components/elements/TroubleElement.jsx`
- `src/components/elements/HighConceptElement.jsx`

Steps:
1. Replace card header action icons (delete, add element, duplicate, settings, lock/unlock) with Lucide components.
2. Swap element delete buttons and add/remove controls to Lucide, ensuring labels remain readable.
3. Replace the drag handle graphic and aspect bullet emoji with Lucide equivalents, adjusting CSS as needed.

Acceptance:
- All card and element action icons are Lucide-based.
- Icon alignment and spacing match existing layout and hover states.

---

## Task 4 — Update Tests + Cleanup
Goal: Make tests resilient to icon changes and confirm no emoji icons remain.

Files:
- `src/hooks/useTheme.test.js`
- `src/components/modals/TemplateModal.test.jsx`
- `src/components/elements/AspectsElement.test.jsx`
- `src/components/elements/NoteElement.test.jsx`
- `src/components/elements/TroubleElement.test.jsx`
- `src/components/elements/HighConceptElement.test.jsx`
- Any other tests using icon text queries

Steps:
1. Update tests to query by `aria-label`, `title`, or role instead of emoji/text glyphs.
2. Add or adjust aria labels where needed to keep queries stable.
3. Run test suite and fix any remaining icon-dependent assertions.

Acceptance:
- Tests no longer depend on emoji/glyph contents.
- All icon-related tests pass with Lucide icons.
