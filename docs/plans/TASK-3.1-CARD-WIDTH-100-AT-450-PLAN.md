# Task 3.1 - Card Width 100% at <=450px - Implementation Plan

## Requirement
From `docs/Tasks.md`:
- `3.1 - When width <=450px, card width should be 100%`

## Current State Review
- Card widths are fixed in `src/components/Card.css`:
  - `.card { width: 350px; }`
  - `.card.two-column { width: 720px; }`
  - `.card.auto-column { width: 350px; }` (and `720px` at `min-width: 800px`)
- Card list container (`.cards-container`) already supports wrapping in `src/App.css`.
- App root currently has `min-width: 400px` in `src/App.css`, which may prevent true narrow-screen behavior below 400px.

## Implementation Plan

### 1) Add mobile width override for cards
File: `src/components/Card.css`

Add a media query for `@media (max-width: 450px)` to force all card variants to full width:
- `.card { width: 100%; max-width: 100%; }`
- `.card.two-column { width: 100%; }`
- `.card.auto-column { width: 100%; }`

This keeps changes local to card layout behavior and avoids altering card internals.

### 2) Ensure small screens can realize full-width cards
File: `src/App.css` (conditional, if needed after quick visual check)

If the `min-width: 400px` on `.app` causes horizontal overflow on very narrow devices, add:
- `@media (max-width: 450px) { .app { min-width: 0; } }`

This is only to ensure card `width: 100%` maps to the actual viewport width on small phones.

### 3) Validation

Automated:
- Run `npq-hero run test` via `asdf exec` to ensure no regressions.

Manual checks:
- At viewport width `450px`, card fills available width in category container.
- At viewport widths below `450px` (e.g. `430px`, `390px`), card remains full width without clipping.
- Confirm `.card.two-column` and `.card.auto-column` also respect full width at mobile breakpoint.

## Files Planned for Edit
- `src/components/Card.css`
- `src/App.css` (only if needed after verification)

## Out of Scope
- Changing card element spacing/typography
- Changing two-column content behavior beyond width override
- Any non-card feature changes
