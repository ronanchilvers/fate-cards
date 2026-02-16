# Project Memory

- **What:** Roll modifiers are now managed at app level as a multi-select list and are snapshotted at roll start, then cleared after dice result handling.
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/App.jsx` (`selectedRollModifiers`, `activeRollModifiersRef`, `toggleRollModifier`, `handleRollDice`, `handleDiceResult`)
  - **Evidence:** Roll flow no longer uses `pendingSkillBonus`; tests validate reset after result (`App.test.jsx`).

- **What:** Modifier sources include `High Concept`, `Trouble`, `Aspects`, and `Skills` across cards, each using stable ids for toggle on/off.
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/components/elements/HighConceptElement.jsx`, `/Users/ronan/Personal/experiments/fate-cards/src/components/elements/TroubleElement.jsx`, `/Users/ronan/Personal/experiments/fate-cards/src/components/elements/AspectsElement.jsx`, `/Users/ronan/Personal/experiments/fate-cards/src/components/elements/SkillsElement.jsx`
  - **Evidence:** Element tests include modifier toggle assertions for all four element types.

- **What:** Modifier values are source-specific: `Skills` use their numeric skill-level rating, while other selected modifier sources continue to default to `+2`.
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/components/elements/SkillsElement.jsx` (`getSkillModifier`), `/Users/ronan/Personal/experiments/fate-cards/src/App.jsx` (`normalizeModifierValue`), and non-skill element payload builders.
  - **Evidence:** `SkillsElement.test.jsx` validates `Stealth` emits `value: 1`; `App.test.jsx` validates non-skill value propagation in toast breakdown.

- **What:** Floating roll control displays selected modifiers as a stacked list above the roll button.
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/components/FloatingDiceButton.jsx`, `/Users/ronan/Personal/experiments/fate-cards/src/components/FloatingDiceButton.css`
  - **Evidence:** `FloatingDiceButton.test.jsx` verifies stacked modifier rendering.

- **What:** Card element modifier interactions use baseline neutral text styling (matching prior black/gray element text), with skills presented in grouped list format; active modifiers switch text color to the card accent color only (no italic/bold emphasis).
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/components/Card.css`
  - **Evidence:** `.is-active` style blocks set accent color without `font-style` or `font-weight` overrides.

- **What:** Dark-mode-specific font color overrides for modifier element text were removed so element text styling remains consistent with baseline element presentation logic.
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/components/Card.css`
  - **Evidence:** `.dark-mode` color assignments for modifier chips/toggles and locked modifier text were removed.

- **What:** Floating modifier pills now use larger spacing and inherited text sizing from the pill container.
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/components/FloatingDiceButton.css`
  - **Evidence:** `.floating-dice-control` and `.floating-modifier-stack` gaps are `1rem`, `.floating-modifier-item` uses `padding: 0.5rem 1rem` and `font-size: 1rem`, and explicit size/width constraints were removed from label/value.

- **What:** Floating modifier pills are now capped at `max-width: 368px`; app root minimum width remains `400px`.
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/components/FloatingDiceButton.css` and `/Users/ronan/Personal/experiments/fate-cards/src/App.css`
  - **Evidence:** `.floating-modifier-item` has `max-width: 368px`; `.app` already defines `min-width: 400px`.

- **What:** Dice control button and modifier pill colors are now mode-invariant and always use the previous dark-mode palette.
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/components/FloatingDiceButton.css`
  - **Evidence:** Base styles now use dark palette values; `.dark-mode` color override blocks for dice control/pills were removed.

- **What:** Dice control button color tokens now match the modifier pill scheme directly (same dark background, border, and light foreground text).
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/components/FloatingDiceButton.css`
  - **Evidence:** `.floating-dice-button` uses `background: rgba(15, 23, 42, 0.95)`, `border: 1px solid rgba(148, 163, 184, 0.4)`, and `color: var(--slate-100)`.

- **What:** Skills list in locked view renders inline skill chips without comma separators; each chip has `margin-right: 0.5rem`, and the last chip in a list has `margin-right: 0`.
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/components/Card.css`
  - **Evidence:** `.skill-level-list .skill-modifier-chip` rules now set inline display and right margin with a `:last-child` reset; comma `::after` rules remain removed.

- **What:** The app previously shrank below `400px` because a mobile media query explicitly reset `.app` min-width to `0`; this override has been removed.
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/App.css`
  - **Evidence:** Deleted `@media (max-width: 450px) { .app { min-width: 0; } }`.

- **What:** Dice result toast breakdown now shows dice value plus numeric modifier values only (no modifier labels).
  - **Where:** `/Users/ronan/Personal/experiments/fate-cards/src/App.jsx` (`handleDiceResult`)
  - **Evidence:** `App.test.jsx` expects breakdown format like `+1 + +2`.
