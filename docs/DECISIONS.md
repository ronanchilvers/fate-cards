# Decisions

## 2026-02-16 - Source-Specific Multi-Source Modifier Model

### Context
The dice roller needed to support selecting multiple contributors from card elements (`High Concept`, `Trouble`, `Aspects`, `Skills`) instead of the previous single skill-bonus flow.

### Decision
Use a unified app-level modifier model with stable ids and source-specific values. `Skills` use their own skill-level value, while non-skill sources default to `+2`. Snapshot selected modifiers when roll starts, include them in result calculation, and clear selections after result processing.

### Consequences
- Supports toggling multiple modifiers across cards without coupling roll logic to a specific element.
- Supports accurate skill-based modifier math in Fate rolls.
- Keeps non-skill invokes simple with `+2` default behavior.

## 2026-02-16 - Text-First Modifier Interaction Styling

### Context
Clickable modifier entries in card elements should not look like buttons, and active state should be minimal while preserving card-color context and left alignment.

### Decision
Render modifier interactions with text-like styling (transparent background, no border/chrome), left-aligned content, and simple active typography (font weight/style + opacity) instead of button-like visual treatment.

### Consequences
- Better visual integration with card content.
- Clear active/inactive state without adding heavy UI chrome.
- Maintains keyboard/button semantics for accessibility while presenting text-first visuals.

## 2026-02-16 - Neutral Base Text with Accent-on-Active Modifier State

### Context
Modifier text needed to visually match the pre-change element presentation (neutral/black text and grouped skills), while still communicating selection clearly when clicked.

### Decision
Keep inactive modifier text in neutral element colors and grouped skill-list formatting; when active, switch modifier text color to the card accent (`--card-accent-color`) with no additional italic/bold typography changes.

### Consequences
- Restores familiar baseline readability and grouping.
- Selection state remains visible without introducing button-like chrome.
- Active-state color now consistently ties interaction feedback to card identity.

## 2026-02-16 - Floating Modifier Pill Spacing and Typography Refinement

### Context
The floating modifier stack needed more visual breathing room and less rigid per-fragment sizing to match preferred UI rhythm.

### Decision
Increase stack/control gaps to `1rem`, set pill padding to `0.5rem 1rem`, set pill base font size to `1rem`, and remove explicit label/value font-size and width constraints.

### Consequences
- Improved readability and touch/scan comfort of stacked modifier pills.
- Simplified typography cascade inside pills.
- Slightly larger footprint for the floating stack, offset by improved visual clarity.

## 2026-02-16 - Mode-Invariant Dice Control Palette

### Context
The dice control button and modifier pills should remain visually consistent across light and dark themes.

### Decision
Use the former dark-mode palette as the default for the floating dice control and modifier pills, remove theme-dependent color switching for those elements, and align dice button tokens directly to the modifier pill scheme.

### Consequences
- Ensures stable visual identity for roll controls regardless of app theme.
- Reduces theme-conditional styling complexity in floating dice control CSS.

## 2026-02-16 - Toast Breakdown Simplification

### Context
Dice result toasts originally included modifier labels in breakdown strings.

### Decision
Display only numeric modifier values in toast breakdown (`dice + modifiers`), not modifier source text labels.

### Consequences
- Cleaner, denser toast output.
- Less provenance detail in toast text; source labels remain visible in modifier stack before rolling.
