# CSS Optimization Plan

## Goals
- Remove duplicated CSS while preserving current visuals and behaviors.
- Keep the stylesheet lean and easier to maintain.
- Avoid any styling regressions (including dark mode and responsive behavior).

## Scope
- Review and refactor all CSS in `src/index.css`, `src/App.css`, `src/components/Card.css`, and `src/components/modals/TemplateModal.css`.
- Changes stay in `src/` (no new dependencies, no Vite config changes).

## Duplication Hotspots (from the current review)
- Modal scaffolding duplicated in `src/App.css` and `src/components/modals/TemplateModal.css`:
  - `.modal-overlay`, `.modal-content`, `.modal-header`, `.modal-close`, dark-mode variants.
- Template selection styles duplicated between `src/App.css` and `src/components/modals/TemplateModal.css`:
  - `.template-selection`, `.template-options`, `.template-option`, `.template-icon`, `.template-info`, `.template-controls`, `.category-selector`, `.category-select`, `.add-template-btn`.
  - There are subtle differences (extra dark-mode states and responsive tweaks in `TemplateModal.css`) that must be preserved when consolidating.
- Card base styles duplicated between `src/App.css` and `src/components/Card.css`:
  - `.card`, `.card-header`, `.card-body`, `.card-subtitle`, `.card-placeholder`.
- Repeated button patterns (same structure, colors, spacing) across multiple selectors:
  - Delete/icon buttons: `.element-delete-btn`, `.aspect-delete-btn`, `.inventory-delete-btn`, `.skill-delete-btn`, `.remove-level-btn`, `.consequence-delete-btn`, `.skill-list-delete`, `.modal-close`, `.delete-category-btn`.
- Repeated input/select styles with the same borders, padding, background, focus rules:
  - `.element-input`, `.element-textarea`, `.skill-name-select`, `.stress-track-name-input`, `.consequence-label-input`, `.refresh-input`, `.settings-input`, `.settings-select`, `.category-select`, `.skill-input`, `.category-input`.
- Repeated color values and borders for neutral surfaces (e.g. `#e2e8f0`, `#4a5568`, `#2d3748`, `#f7fafc`, `#1a202c`, `#999`, `#666`).

## Step-by-Step Tasks (Discreet Units of Work)
1. **Selector inventory and ownership map**
   - Inputs: `src/index.css`, `src/App.css`, `src/components/Card.css`, `src/components/modals/TemplateModal.css`.
   - Actions: List duplicated selectors, note which components use them, and decide whether each belongs to a shared base or a component.
   - Output: A short checklist (inline in the PR/notes) mapping selector → owning file.
   - Done when: Every duplicated selector in the hotspots section has a designated “owner” file.

2. **Extract modal scaffolding to a shared base file**
   - Inputs: `src/App.css`, `src/components/modals/TemplateModal.css`, modal component files.
   - Actions: Create `src/components/modals/ModalBase.css` with common `.modal-*` rules and dark-mode variants. Import it into `TemplateModal.jsx`, `CategoryModal.jsx`, `SkillsAdminModal.jsx`, `SkillLevelsAdminModal.jsx`.
   - Output: Shared modal CSS file and updated imports.
   - Done when: All modal scaffolding is defined in `ModalBase.css` and removed from other files.

3. **Deduplicate template selection styles**
   - Inputs: `src/App.css`, `src/components/modals/TemplateModal.css`.
   - Actions: Keep all template-related rules only in `TemplateModal.css`. Remove matching blocks from `App.css`. Preserve the TemplateModal-only dark-mode and responsive rules.
   - Output: `TemplateModal.css` is the single source of truth for template selection styles.
   - Done when: No `.template-*` or `.category-select` template rules remain in `App.css`.

4. **Centralize card base styles in `Card.css`**
   - Inputs: `src/App.css`, `src/components/Card.css`.
   - Actions: Move/keep `.card`, `.card-header`, `.card-body`, `.card-subtitle`, `.card-placeholder` only in `Card.css`. Remove duplicates from `App.css`.
   - Output: `Card.css` owns base card styles.
   - Done when: No card base selectors remain in `App.css`.

5. **Consolidate repeated button styles**
   - Inputs: `src/App.css`, `src/components/Card.css`.
   - Actions: Group identical delete/icon button rules using combined selectors or `:is()`. Keep overrides local to each component block.
   - Output: Fewer repeated button declarations with unchanged computed styles.
   - Done when: Each repeated delete/icon button pattern is defined once.

6. **Consolidate repeated input/select styles**
   - Inputs: `src/App.css`, `src/components/Card.css`, `src/components/modals/TemplateModal.css`.
   - Actions: Group identical input/select rules, preserving differences (padding, sizes, focus). Prefer grouping where values truly match.
   - Output: Reduced duplication for form controls without visual changes.
   - Done when: Every repeated input/select block is either grouped or justified as distinct.

7. **Introduce CSS variables for common tokens**
   - Inputs: `src/index.css` and any file using repeated colors/radii.
   - Actions: Add token variables for neutral colors, borders, and radii in `:root` and override in `.dark-mode`. Replace repeated hex values with variables.
   - Output: Tokenized colors/radii used across files.
   - Done when: The most repeated neutral colors are replaced by variables and dark-mode overrides are centralized.

8. **Clean dead/commented CSS**
   - Inputs: `src/App.css` (and any other CSS files).
   - Actions: Remove clearly unused commented blocks after verifying they aren’t referenced in JSX.
   - Output: CSS free of dead commented rules.
   - Done when: No unused commented CSS remains.

## Validation
- Visual spot-check of:
  - All modals (including Template, Category, Skills Admin, Skill Levels Admin)
  - Card view (single/two/auto columns)
  - Light mode + dark mode
  - Mobile breakpoints at 1024px and 600px
- Ensure CSS files are smaller and no duplicate selector blocks remain after consolidation.

## Acceptance Criteria
- No visible changes in layout, colors, spacing, or interactions.
- Duplicated selector blocks removed or consolidated.
- Shared tokens reduce repeated hard-coded color values.
