# Three-Column Card Layout Plan

## Summary
- Add a new persisted layout mode, `3-column`, and expose it in the card settings UI.
- Extend the existing card layout behavior so cards can expand from 1 to 2 to 3 columns when there is enough width.
- Prevent three-column rendering unless the card has at least three elements, so each column can contain at least one element.

## Implementation Changes
- Extend card normalization to accept `3-column` as a valid persisted layout value.
- Update the layout dropdown in `src/components/Card.jsx` to include `3 Columns`.
- Replace the inline layout class ternary in `src/components/Card.jsx` with a small helper that derives the effective layout classes from `card.layout` and `card.elements.length`.
- Keep `single-column` and existing `2-column` behavior as-is.
- For `3-column`, apply progressive fallback:
  - Render 3 columns only when `elements.length >= 3` and the viewport is wide enough.
  - Render 2 columns when the viewport supports two columns but not three, or when there are exactly two elements.
  - Render 1 column when there is not enough width for two columns or there is only one element.
- For `auto`, preserve the current 2-column behavior and additionally allow 3-column expansion when `elements.length >= 3` and the viewport is wide enough.
- Implement the three-column breakpoint in `src/components/Card.css`:
  - Keep single-column width at `350px`.
  - Keep two-column width at `720px`.
  - Add three-column width at `1090px`.
  - Use a `1170px` breakpoint for 3-column expansion.
- Reuse the existing multi-column CSS pattern with `column-count`, `column-gap`, `column-rule`, and `break-inside: avoid`.

## Test Plan
- Update `src/utils/cardSchema.test.js` to assert that `3-column` is accepted as a valid layout.
- Add `src/components/Card.test.jsx` coverage for:
  - The layout dropdown showing `3 Columns`.
  - Saving `3-column` through the settings modal.
  - `3-column` cards with fewer than three elements not receiving the “ready for 3 columns” class.
  - `auto` cards with at least three elements receiving the class that enables 3-column expansion at the wider breakpoint.
- Run the relevant test suite after implementation.

## Assumptions
- The “at least one element per column” rule applies only to 3-column rendering; existing 2-column behavior remains unchanged.
- New cards and templates continue to default to `auto`.
- No data migration is required beyond accepting the new layout value during normalization.
